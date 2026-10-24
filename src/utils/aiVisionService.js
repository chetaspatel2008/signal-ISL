// AI Multimodal Vision Service for Full Sign Language Translation
// Powered by Google Gemini Flash (gemini-flash-latest)

class AIVisionService {
  constructor() {
    this.apiKey = this.loadApiKey();
    this.isAnalyzing = false;
    this.modelName = 'gemini-flash-latest';
  }

  loadApiKey() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('signvoice_gemini_key');
      if (stored) return stored;
    }
    return import.meta.env.VITE_GEMINI_API_KEY || '';
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
    canvas.width = Math.min(800, videoEl.videoWidth);
    canvas.height = Math.min(600, videoEl.videoHeight);
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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const prompt = `You are a world-class real-time Sign Language interpreter and translator specializing in ${language === 'ISL' ? 'Indian Sign Language (ISL)' : 'American Sign Language (ASL)'}.
The person in front of the camera has just executed a sign language gesture and paused to let you translate their complete sentence.
You are given temporal video keyframes captured over the gesture motion arc (from the 16-frame temporal buffer).

Observe the precise hand shapes, palm orientations, and spatial positioning relative to anatomical anchors:
- Hand touching or near Forehead / Brow: Father (पिताजी / Dad)
- Hand touching or near Chin / Lower Face: Mother (माँ / Mom)
- Hands touching side-by-side after forehead: Brother (भाई)
- Hands touching side-by-side after chin: Sister (बहन)
- Both palms pressed in Anjali Mudra: Namaste (नमस्ते / Greetings)
- Flat hand sweeping forward from chin/lips: Thank You (धन्यवाद)
- Two fingers tapping opposite inner wrist pulse: Doctor (डॉक्टर)
- Fist resting on flat horizontal palm: Help (मदद)
- Fist circling gently over chest: Sorry (माफ़ कीजिये)
- Hooked index fingers interlocking: Friend (दोस्त)
- Thumb + Index + Pinky extended: I Love You (प्यार)
- V-shape upright: Peace / Victory (शांति)
- W-shape near mouth: Water (पानी)
- Thumb upright: Good / All Good (बहुत बढ़िया / ठीक है)
- Closed fist nodding: Yes (हाँ)
- Pointing forward: You (आप)
- Hands open sweeping inward: Welcome (स्वागतम)
- Dual F-hands circling together: Family (परिवार)
- Also recognize standard ISL 76 vocabulary classes:
  afternoon, animal, bad, beautiful, big, bird, blind, cat, cheap, clothing, cold, cow, deaf, dog, dress, dry, evening, expensive, famous, fast, female, fish, flat, friday, good, happy, hat, healthy, horse, hot, hour, light, long, loud, minute, monday, month, morning, mouse, narrow, new, night, old, pant, pocket, quiet, sad, saturday, second, shirt, shoes, short, sick, skirt, slow, small, suit, sunday, t-shirt, tall, thursday, time, today, tomorrow, tuesday, ugly, warm, wednesday, week, wet, wide, year, yesterday, young.
${contextHint ? `Recent context / detected anchor: ${contextHint}` : ''}

Convert their signed thought into a polished, complete, and grammatically natural conversational sentence that can be spoken aloud.
Return ONLY valid JSON (no markdown formatting, no code fences):
{
  "detected": true,
  "signName": "Father",
  "sentence": "My father.",
  "hindiSentence": "मेरे पिताजी।",
  "confidence": 0.98
}

If no clear sign language gesture was made:
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

    try {
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
            maxOutputTokens: 220
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      return result;
    } catch (err) {
      console.error('Gemini Sign Translation Error:', err);
      throw err;
    } finally {
      this.isAnalyzing = false;
    }
  }

  async testConnection(testKey) {
    const key = testKey || this.apiKey;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${key}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with OK.' }] }]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Connection failed with status ${res.status}`);
    }

    return true;
  }
}

export const aiVisionService = new AIVisionService();
