"use client";

import { useEffect, useState } from "react";
import CameraView from "./components/CameraView";
import PeopleCounter from "./components/PeopleCounter";
import SceneStatus from "./components/SceneStatus";
import VoiceAssistant from "./components/VoiceAssistant";
import InstructionBox from "./components/InstructionBox";
import { Camera } from "lucide-react"; // npm install lucide-react se não tiver

const BACKEND_URL = "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io";

export default function Home() {
  const [peopleDetected, setPeopleDetected] = useState<number>(0);
  const [sceneState, setSceneState] = useState<string>("UNKNOWN");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/status`);
        const data = await res.json();
        setPeopleDetected(data.people_detected ?? 0);
        setSceneState(data.scene_state ?? "UNKNOWN");
      } catch {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#162447] to-[#1f2c56] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Título */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-8 lg:mb-12">
          LuminaVision – Interactive Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Instruções */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 lg:p-8">
              <InstructionBox />
            </div>
          </div>

          {/* Câmera + Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Área da câmera com borda neon */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl neon-border p-1">
              <div className="bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 rounded-2xl aspect-video flex items-center justify-center">
                {peopleDetected === 0 ? (
                  <div className="text-center text-white/60">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Camera feed would appear here</p>
                  </div>
                ) : (
                  <CameraView />
                )}
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-6 text-center border-4 border-yellow-400">
                <PeopleCounter demo={peopleDetected} />
              </div>

              <div className="glass-card p-6 text-center border-4 border-purple-400">
                <SceneStatus sceneState={sceneState} />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Lumi fixo bottom-left + Botão Ask */}
        <div className="fixed bottom-6 left-6 z-50">
          <div className="relative">
            {/* Avatar */}
            <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 border-4 border-yellow-400 shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Sua imagem real */}
              {/* <img src="/lumi.png" alt="Lumi" className="w-full h-full object-cover" /> */}
              <div className="text-center text-white">
                <div className="text-6xl mb-2">👧</div>
                <p className="font-bold text-sm">Lumi</p>
              </div>
            </div>

            {/* Botão Ask Lumi */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`mt-4 w-full text-lg font-bold py-4 lg:py-6 rounded-2xl transition-all shadow-xl border-2 border-white ${
                isListening
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              }`}
            >
              {isListening ? "🎤 Listening..." : "Ask Lumi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}