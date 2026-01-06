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
  const handledRef = useRef(false); // 🔑 evita duplicação

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
    recognition.continuous = false; // ✅ MUITO IMPORTANTE
    recognition.interimResults = false;

    recognition.onresult = async (e: any) => {
      if (handledRef.current) return;
      handledRef.current = true;

      const transcriptRaw =
        e.results?.[0]?.[0]?.transcript?.trim().toLowerCase();

      if (!transcriptRaw) {
        reset();
        return;
      }

      // wake word sozinho → ignora
      if (transcriptRaw === WAKE_WORD) {
        reset();
        return;
      }

      // remove wake word se vier junto
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
      } catch (err) {
        console.error("Voice error:", err);
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
    <button
      onClick={startListening}
      disabled={status !== "idle"}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
    >
      {status === "idle" && "🎙 Speak"}
      {status === "listening" && "👂 Listening..."}
      {status === "thinking" && "🧠 Thinking..."}
      {status === "speaking" && "🔊 Speaking..."}
    </button>
  );
}
