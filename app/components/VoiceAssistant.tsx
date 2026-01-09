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
    <div className="hud-panel flex items-center gap-4 w-full max-w-xl">

    {/* AVATAR */}
    <div className="relative shrink-0">
      <img
        src="/lumi.png"
        alt="Lumi"
        className={`
          w-16 h-16 rounded-full border border-white/20
          transition
          ${status === "listening" ? "ring-2 ring-purple-400 animate-pulse" : ""}
          ${status === "speaking" ? "ring-2 ring-green-400" : ""}
        `}
      />
      <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/20 -z-10" />
    </div>

    {/* TEXTO + BOTÃO */}
    <div className="flex-1">
      <h2 className="text-sm font-semibold text-purple-300">
        Lumi Voice Assistant
      </h2>

      <p className="text-xs text-zinc-400 mt-1">
        {status === "idle" && "Press the button and speak naturally"}
        {status === "listening" && "Listening…"}
        {status === "thinking" && "Processing your request…"}
        {status === "speaking" && "Responding with real context"}
      </p>

      <button
        onClick={startListening}
        disabled={status !== "idle"}
        className="
          mt-3
          w-full
          rounded-md
          bg-purple-600/20
          border border-purple-400/30
          py-2
          text-sm
          text-purple-200
          hover:bg-purple-600/30
          transition
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        🎙 Ask Lumi
      </button>
    </div>

    </div>
  );
}
