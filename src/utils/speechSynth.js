// Web Speech API text-to-speech engine

class SpeechController {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.init();
  }

  init() {
    if (!this.synth) return;

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  getAvailableVoices() {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    // Curate clean English & global voices
    const englishVoices = this.voices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('hi'));
    return englishVoices.length > 0 ? englishVoices : this.voices;
  }

  speak(text, { voiceURI, rate = 1.0, volume = 1.0, onStart, onEnd, onError } = {}) {
    if (!this.synth || !text) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.volume = volume;

    if (voiceURI) {
      const selectedVoice = this.voices.find(v => v.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      if (onError) onError(e);
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechController = new SpeechController();
