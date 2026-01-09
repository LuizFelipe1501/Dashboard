"use client"

import { useRef, useState } from "react"

type Props = {
  peopleDetected: number
  sceneState: string
}

const WAKE_WORD = "lumi"

export default function VoiceAssistant({ peopleDetected, sceneState }: Props) {
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const busyRef = useRef(false)
  const handledRef = useRef(false)

  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle")

  async function sendToVoiceAPI(text: string): Promise<Blob> {
    const res = await fetch("https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/voice", {
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
    })

    if (!res.ok) {
      throw new Error(`Voice API failed: ${res.status}`)
    }

    return await res.blob()
  }

  function startListening() {
    if (busyRef.current) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported")
      return
    }

    busyRef.current = true
    handledRef.current = false

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = async (e: any) => {
      if (handledRef.current) return
      handledRef.current = true

      const transcriptRaw = e.results?.[0]?.[0]?.transcript?.trim().toLowerCase()

      if (!transcriptRaw || transcriptRaw === WAKE_WORD) {
        reset()
        return
      }

      const transcript = transcriptRaw.startsWith(WAKE_WORD)
        ? transcriptRaw.replace(WAKE_WORD, "").trim()
        : transcriptRaw

      if (!transcript) {
        reset()
        return
      }

      recognition.stop()
      setStatus("thinking")

      try {
        const audioBlob = await sendToVoiceAPI(transcript)
        playAudio(audioBlob)
      } catch {
        reset()
      }
    }

    recognition.onerror = () => {
      recognition.stop()
      reset()
    }

    recognitionRef.current = recognition
    setStatus("listening")
    recognition.start()
  }

  function playAudio(blob: Blob) {
    setStatus("speaking")

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current = null
    }

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audioRef.current = audio

    audio.onended = () => {
      URL.revokeObjectURL(url)
      reset()
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reset()
    }

    audio.play().catch(reset)
  }

  function reset() {
    busyRef.current = false
    handledRef.current = false
    setStatus("idle")
  }

  return (
    <div className="flex flex-col items-center">
      {/* Avatar da Lumi */}
      <div className="relative">
        <div
          className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl bg-gradient-to-br from-purple-600 to-indigo-700 ${
            status === "listening" ? "ring-4 ring-purple-400 animate-pulse" : ""
          } ${status === "speaking" ? "ring-4 ring-green-400" : ""}`}
        >
          <img src="/lumi.png" alt="Lumi" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Botão Ask Lumi */}
      <button
        onClick={startListening}
        disabled={status !== "idle"}
        className={`mt-3 px-6 py-3 rounded-full font-bold text-white shadow-xl transition-all border-2 border-white flex items-center gap-2 ${
          status === "listening"
            ? "bg-gradient-to-r from-pink-500 to-purple-600"
            : status === "thinking"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
              : status === "speaking"
                ? "bg-gradient-to-r from-green-500 to-teal-500"
                : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        } disabled:opacity-70`}
      >
        <span className="text-xl">🎤</span>
        {status === "idle" && "Ask Lumi"}
        {status === "listening" && "Listening..."}
        {status === "thinking" && "Thinking..."}
        {status === "speaking" && "Speaking..."}
      </button>
    </div>
  )
}
