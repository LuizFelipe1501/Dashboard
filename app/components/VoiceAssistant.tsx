"use client";

import { useRef, useState } from "react";

type Props = {
  peopleDetected: number;
  sceneState: string;
};

const WAKE_WORD = "lumi";

export default function VoiceAssistant({
  peopleDetected,
  sceneState,
}: Props) {
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const busyRef = useRef(false);
  const handledRef = useRef(false);

  const [status, setStatus] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");

  async function sendToVoiceAPI(text: string): Promise<Blob> {
    const res = await fetch(
      "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/voice",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          people_detected: peopleDetected,
          scene_state: sceneState,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Voice API failed: ${res.status}`);
    }

    return await res.blob();
  }

  function startListening() {
    if (busyRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    busyRef.current = true;
    handledRef.current = false;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (e: any) => {
      if (handledRef.current) return;
      handledRef.current = true;

      const transcriptRaw =
        e.results?.[0]?.[0]?.transcript?.trim().toLowerCase();

      if (!transcriptRaw || transcriptRaw === WAKE_WORD) {
        reset();
        return;
      }

      const transcript = transcriptRaw.startsWith(WAKE_WORD)
        ? transcriptRaw.replace(WAKE_WORD, "").trim()
        : transcriptRaw;

      if (!transcript) {
        reset();
        return;
      }

      recognition.stop();
      setStatus("thinking");

      try {
        const audioBlob = await sendToVoiceAPI(transcript);
        playAudio(audioBlob);
      } catch {
        reset();
      }
    };

    recognition.onerror = () => {
      recognition.stop();
      reset();
    };

    recognitionRef.current = recognition;
    setStatus("listening");
    recognition.start();
  }

  function playAudio(blob: Blob) {
    setStatus("speaking");

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      reset();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reset();
    };

    audio.play().catch(reset);
  }

  function reset() {
    busyRef.current = false;
    handledRef.current = false;
    setStatus("idle");
  }

  return (
    <div className="bg-purple-900/70 border-2 border-yellow-400 rounded-3xl p-6 w-full shadow-lg">
      <div className="flex items-center gap-6 flex-col sm:flex-row">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src="/lumi.png"
            alt="Lumi"
            className={`
              w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-300
              transition-all duration-300
              ${status === "listening" ? "ring-4 ring-purple-400 animate-pulse scale-110" : ""}
              ${status === "speaking" ? "ring-4 ring-green-400 scale-105" : ""}
            `}
          />
          <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30 -z-10" />
        </div>

        {/* Texto + Status + Botão */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-yellow-300">
            Lumi Voice Assistant
          </h2>

          <p className="text-lg text-purple-200 mt-2">
            {status === "idle" && "Press the button and speak naturally"}
            {status === "listening" && "Listening…"}
            {status === "thinking" && "Processing your request…"}
            {status === "speaking" && "Responding with real context"}
          </p>

          <button
            onClick={startListening}
            disabled={status !== "idle"}
            className="
              mt-4 px-8 py-3 bg-purple-600 hover:bg-purple-500
              text-white font-bold rounded-full text-lg
              border-2 border-yellow-300 shadow-lg
              transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-3 mx-auto sm:mx-0
            "
          >
            <span className="text-2xl">🎤</span> Ask Lumi
          </button>
        </div>
      </div>
    </div>
  );
}