"use client";

export default function VoiceInput() {
  async function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

   recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;

      const res = await fetch(
        "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/voice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: transcript,
            people_detected: 2,
            scene_state: "calm",
          }),
        }
      );

      const data = await res.json();

      const speech = new SpeechSynthesisUtterance(data.answer);
      speech.lang = "en-US";
      window.speechSynthesis.speak(speech);
    };
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-lg font-semibold">Voice Assistant</h2>
      <p className="text-sm text-zinc-400 mt-1">
        Ask what is happening around you
      </p>

      <button
        onClick={startListening}
        className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-500 transition"
      >
        🎙 Speak
      </button>
    </div>
  );
}
