import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Web Speech API hook for Leo Voice Input
 * Provides real-time speech-to-text with auto-detection for English & Bengali
 */
export function useVoiceInput({ lang = 'bn', onTranscript } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback((customCallback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'bn' 
        ? 'আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। অনুগ্রহ করে গুগল ক্রোম বা এজ ব্যবহার করুন।' 
        : 'Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results?.[0]?.[0]?.transcript || '';
        if (text) {
          if (customCallback) customCallback(text);
          if (onTranscript) onTranscript(text);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Voice input recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start voice recognition:', err);
      setIsListening(false);
    }
  }, [lang, onTranscript]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
}
