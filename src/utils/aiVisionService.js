// AI Multimodal Vision Service for Full Sign Language Translation
// Powered by Google Gemini Flash (gemini-flash-latest)

class AIVisionService {
  constructor() {
    this.apiKey = this.loadApiKey();
    this.isAnalyzing = false;
    this.modelName = 'gemini-3.5-flash';
    this.fallbackModel = 'gemini-3.5-flash-lite';
  }

  loadApiKey() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('signvoice_gemini_key');
      if (stored && stored.length > 10) return stored;
    }
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 10) return envKey.trim();
    return '';
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : '';
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('signvoice_gemini_key', key.trim());
      } else {
        localStorage.removeItem('signvoice_gemini_key');
      }
    }
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Captures a high-resolution JPEG base64 from a video element
   */
  captureFrameFromVideo(videoEl) {
    if (!videoEl || videoEl.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(640, videoEl.videoWidth);
    canvas.height = Math.min(480, videoEl.videoHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return dataUrl.split(',')[1];
  }

  /**
   * Analyzes a completed sign sequence or paused frame and converts it into a natural sentence
   * Supports both a single frame or multiple sequential keyframes from the 16-frame clip buffer
   */
  async translateSignedSequence(framesInput, language = 'ISL', contextHint = '') {
    if (!this.hasApiKey()) {
      throw new Error('API key not configured.');
    }

    if (this.isAnalyzing) {
      return null;
    }

    this.isAnalyzing = true;

    const prompt = `You are a world-class real-time Sign Language interpreter and translator specializing in ${language === 'ISL' ? 'Indian Sign Language (ISL)' : 'American Sign Language (ASL)'} based on the SignBridge dataset.
The person in front of the camera has executed a sign language gesture and paused.
You are given temporal video keyframes captured over the gesture motion arc (from a 16-frame temporal buffer).

STRICT USER REQUIREMENT:
"dont guess the word from letter accurately show it what it is if its just an letter write it if is sign of a word write it"

CRITICAL RULES:
1. STRICT DISCRIMINATION BETWEEN LETTERS AND WORDS:
   - NEVER guess or predict words from a single letter handshape!
   - If the person is showing a fingerspelling alphabet letter handshape (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z):
     * Return "type": "letter"
     * Return "text": "<LETTER>" (single uppercase letter e.g. "A", "B", "C", "V", "W", "Y", etc.)
     * Return "signName": "Letter <LETTER>"
     * DO NOT guess or expand into an English word starting with that letter!
   - If the person is showing a number digit (0 to 10):
     * Return "type": "number"
     * Return "text": "<DIGIT>" (e.g. "1", "2", "3", etc.)
     * Return "signName": "Number <DIGIT>"
   - If the person is demonstrating an actual SIGN FOR A WORD:
     * Check against the SignBridge 76 ISL Word Classes:
       afternoon, animal, bad, beautiful, big, bird, blind, cat, cheap, clothing, cold, cow, curved, deaf, dog, dress, dry, evening, expensive, famous, fast, female, fish, flat, friday, good, happy, hat, healthy, horse, hot, hour, light, long, loose, loud, minute, monday, month, morning, mouse, narrow, new, night, old, pant, pocket, quiet, sad, saturday, second, shirt, shoes, short, sick, skirt, slow, small, suit, sunday, t-shirt, tall, thursday, time, today, tomorrow, tuesday, ugly, warm, wednesday, week, wet, wide, year, yesterday, young.
     * Or Core ISL Word Signs:
       - Both palms pressed (Anjali Mudra): Namaste
       - Flat hand sweeping forward from chin: Thank You
       - Hand at forehead/temple: Father
       - Hand at chin/jaw: Mother
       - Hands touching after forehead: Brother
       - Hands touching after chin: Sister
       - Fist on horizontal palm: Help
       - Two fingers tapping inner wrist: Doctor
       - Two hooked index fingers: Friend
       - Hands circling together: Family
       - Fingertips tapping near mouth: Food
       - W-shape near mouth / cup: Water
       - Thumb upright: Good
       - Thumb + Index + Pinky: I Love You
       - Both palms open sweeping to chest: Welcome
       - Both palms roof: House
       - Hands opening like book: School
     * Return "type": "word"
     * Return "text": "<WORD>" (e.g. "Water", "Father", "Namaste", "Help", "Happy", "Dog", etc.)
     * Return "signName": "<WORD>"
     * Write ONLY the clean word, NOT an expanded speculative sentence!
${contextHint ? `Context / Anchor hint: ${contextHint}` : ''}

Return ONLY valid JSON (no markdown formatting, no code fences):
{
  "detected": true,
  "type": "letter" | "word" | "number",
  "text": "A" or "Water" or "Namaste",
  "signName": "Letter A" or "Water" or "Namaste",
  "hindi": "हिंदी अनुवाद",
  "confidence": 0.95
}

If absolutely no gesture or hand movement is visible:
{
  "detected": false,
  "type": "none",
  "text": "",
  "signName": "",
  "hindi": "",
  "confidence": 0
}`;

    // Normalize input frames (single base64 string or array of base64 strings)
    const framesArray = Array.isArray(framesInput) ? framesInput : [framesInput];
    const imageParts = framesArray.filter(Boolean).map((base64Data) => ({
      inline_data: {
        mime_type: 'image/jpeg',
        data: base64Data
      }
    }));

    if (imageParts.length === 0) {
      this.isAnalyzing = false;
      return null;
    }

    const modelsToTry = [this.modelName, this.fallbackModel];
    let lastError = null;

    try {
      for (const currentModel of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${this.apiKey}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    ...imageParts
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 250
              }
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API error ${response.status}`);
          }

          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

          // Extract JSON string even if model wraps in markdown
          let jsonText = rawText;
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }

          const result = JSON.parse(jsonText);
          return result;
        } catch (err) {
          lastError = err;
          console.warn(`Gemini model ${currentModel} failed, trying fallback if available:`, err.message);
        }
      }

      throw lastError || new Error('Failed to interpret sign with Gemini Vision');
    } catch (err) {
      console.error('Gemini Sign Translation Error:', err);
      throw err;
    } finally {
      this.isAnalyzing = false;
    }
  }

  async testConnection(testKey) {
    const key = testKey || this.apiKey;
    const modelsToTry = [this.modelName, this.fallbackModel];
    let lastErr = null;

    for (const m of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK.' }] }]
          })
        });

        if (res.ok) {
          this.modelName = m;
          return true;
        }
        const err = await res.json();
        lastErr = new Error(err.error?.message || `Status ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr || new Error('Connection failed');
  }
}

export const aiVisionService = new AIVisionService();
