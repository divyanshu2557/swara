// ===============================
// SwaraBharat Advanced Frontend Logic
// ===============================

// LIVE backend API (Render)
const API_URL = "https://backend-swarabharat.onrender.com/submit";

const inputBox = document.getElementById("input");
const statusBox = document.getElementById("status");
const speakBtn = document.getElementById("speakBtn");
const submitBtn = document.getElementById("submitBtn");

function safeSetStatus(text) {
  if (statusBox) statusBox.innerText = text;
}

// -------------------------------
// Voice Recognition Setup
// -------------------------------
let recognition;
let isListening = false;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = "auto"; // auto-detect language
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    safeSetStatus("🎙️ Listening… please speak clearly");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (inputBox) inputBox.value = transcript;
    safeSetStatus("✅ Voice captured. You can submit now.");
  };

  recognition.onerror = () => {
    safeSetStatus("❌ Voice recognition failed. Please type your issue.");
  };

  recognition.onend = () => {
    isListening = false;
  };
} else {
  if (speakBtn) {
    speakBtn.disabled = true;
    speakBtn.innerText = "🎙️ Not supported";
  }
}

// -------------------------------
// Start Voice Input
// -------------------------------
function startVoiceInput() {
  if (!recognition || isListening) return;
  recognition.start();
}

// -------------------------------
// Submit Issue to Backend
// -------------------------------
async function submitIssue() {
  if (!inputBox) {
    console.warn("submitIssue: input element not found");
    safeSetStatus("⚠️ Input not available on this page.");
    return;
  }

  const text = inputBox.value.trim();

  if (!text) {
    safeSetStatus("⚠️ Please speak or type your problem first.");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";
  }
  safeSetStatus("⏳ Sending your voice to SwaraBharat AI…");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue: text }),
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const result = await response.json();

    safeSetStatus(
      "✅ Your voice has been heard. It is now part of your community’s collective insight."
    );

    if (inputBox) inputBox.value = "";

    // Optional: auto-clear message after 6 seconds
    setTimeout(() => {
      safeSetStatus("");
    }, 6000);
  } catch (error) {
    console.error(error);
    safeSetStatus("❌ Unable to submit right now. Please try again.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit";
    }
  }
}

// -------------------------------
// Expose functions to HTML
// -------------------------------
window.startVoiceInput = startVoiceInput;
window.submitIssue = submitIssue;