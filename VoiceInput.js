import React, { useState, useEffect } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function VoiceInput({ onAddIngredient }) {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onAddIngredient(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
  }, [onAddIngredient]);

  const startListening = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }
    setListening(true);
    recognition.start();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={startListening} disabled={listening}>
        {listening ? "Listening..." : "Add Ingredient by Voice"}
      </button>
    </div>
  );
}
