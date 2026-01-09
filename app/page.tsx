"use client"

import { useEffect, useState } from "react"
import CameraView from "./components/CameraView"
import PeopleCounter from "./components/PeopleCounter"
import SceneStatus from "./components/SceneStatus"
import VoiceAssistant from "./components/VoiceAssistant"
import InstructionBox from "./components/InstructionBox"
import { Camera } from "lucide-react"

export default function Home() {
  const [peopleDetected, setPeopleDetected] = useState(0)
  const [sceneState, setSceneState] = useState("UNKNOWN")

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/status")
        const data = await res.json()
        setPeopleDetected(data.people_detected ?? 0)
        setSceneState(data.scene_state ?? "UNKNOWN")
      } catch {}
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center mb-6">
        LuminaVision – Interactive Demo
      </h1>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Painel de Instruções - Esquerda */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-400 via-purple-300 to-pink-300 rounded-2xl p-4 md:p-5 shadow-lg h-fit">
              <InstructionBox />
            </div>
          </div>

          {/* Área da Câmera - Direita */}
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden border-4 border-yellow-500 shadow-xl">
              <div className="bg-purple-800 aspect-video flex items-center justify-center">
                {peopleDetected === 0 ? (
                  <div className="text-center text-white/60">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Camera feed would appear here</p>
                  </div>
                ) : (
                  <CameraView />
                )}
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-purple-700 rounded-xl border-2 border-yellow-500 p-4 text-center">
                <PeopleCounter demo={peopleDetected} />
              </div>

              <div className="bg-purple-800 rounded-xl border-2 border-purple-400 p-4 text-center">
                <SceneStatus sceneState={sceneState} />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Lumi + Botão Ask (fixo bottom-left) */}
        <div className="fixed bottom-4 left-4 z-50">
          <VoiceAssistant peopleDetected={peopleDetected} sceneState={sceneState} />
        </div>
      </div>
    </div>
  )
}
