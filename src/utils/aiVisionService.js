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

    const prompt = `You are a world-class real-time Sign Language interpreter and translator specializing in ${language === 'ISL' ? 'Indian Sign Language (ISL)' : 'American Sign Language (ASL)'} based on the SignBridge ISL recognition dataset.
The person in front of the camera has just executed a sign language gesture and paused to let you translate their complete sign or sentence.
You are given temporal video keyframes captured over the gesture motion arc (from a 16-frame temporal buffer).

Analyze the precise hand shapes, finger configurations, palm orientations, and spatial positioning relative to anatomical anchors (head, face, chin, chest, shoulders, wrists):

1. Standard SignBridge 76 ISL Word Classes:
afternoon, animal, bad, beautiful, big, bird, blind, cat, cheap, clothing, cold, cow, curved, deaf, dog, dress, dry, evening, expensive, famous, fast, female, fish, flat, friday, good, happy, hat, healthy, horse, hot, hour, light, long, loose, loud, minute, monday, month, morning, mouse, narrow, new, night, old, pant, pocket, quiet, sad, saturday, second, shirt, shoes, short, sick, skirt, slow, small, suit, sunday, t-shirt, tall, thursday, time, today, tomorrow, tuesday, ugly, warm, wednesday, week, wet, wide, year, yesterday, young.

2. Core Everyday Conversational Signs & Mudras:
- Hand on/near Forehead: Father (पिताजी / Dad)
- Hand on/near Chin/Lower Face: Mother (माँ / Mom)
- Hands side-by-side touching after forehead: Brother (भाई)
- Hands side-by-side touching after chin: Sister (बहन)
- Both palms pressed in Anjali Mudra: Namaste (नमस्ते / Hello / Greetings)
- Flat hand sweeping forward from lips/chin: Thank You (धन्यवाद)
- Two fingers tapping opposite inner wrist: Doctor (डॉक्टर)
- Fist resting on horizontal flat palm: Help (मदद)
- Fist circling gently over chest: Sorry (माफ़ कीजिये)
- Hooked index fingers interlocking: Friend (दोस्त)
- Thumb + Index + Pinky extended (ILY sign): I Love You (प्यार)
- V-shape upright: Peace / Victory (शांति)
- W-shape near mouth or downward wave: Water (पानी)
- Thumb upright: Good / Super (बहुत बढ़िया)
- Closed fist nodding: Yes (हाँ)
- Pointing forward: You (आप)
- Both hands open sweeping inward toward chest: Welcome (स्वागतम)
- Dual F-hands circling together: Family (परिवार)
- Fingers tapping near mouth: Food / Eat (खाना)
- Cups shape to mouth: Drink (पीना)
- Both palms flat roof shape: Home / House (घर)
- Two flat hands opening like a book: School / Study (पढ़ाई)
${contextHint ? `Context / Anchor hint: ${contextHint}` : ''}

Your task is to identify and guess what word or sentence the person is demonstrating, and return it accurately.
Return ONLY valid JSON (no markdown formatting, no code fences):
{
  "detected": true,
  "signName": "Word or Phrase",
  "sentence": "English conversational phrase or word",
  "hindiSentence": "हिंदी अनुवाद",
  "confidence": 0.95
}

If absolutely no gesture or hand movement is visible:
{
  "detected": false,
  "signName": "",
  "sentence": "",
  "hindiSentence": "",
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
