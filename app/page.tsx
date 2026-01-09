// page.tsx
"use client";

import { useEffect, useState } from "react";
import CameraView from "./components/CameraView";
import PeopleCounter from "./components/PeopleCounter";
import SceneStatus from "./components/SceneStatus";
import VoiceAssistant from "./components/VoiceAssistant";
import InstructionBox from "./components/InstructionBox";

const BACKEND_URL = "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io";

export default function Home() {
  const [peopleDetected, setPeopleDetected] = useState<number>(0);
  const [sceneState, setSceneState] = useState<string>("UNKNOWN");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/status`);
        const data = await res.json();
        setPeopleDetected(data.people_detected ?? 0);
        setSceneState(data.scene_state ?? "UNKNOWN");
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a1a3a] p-4 md:p-6 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Título central */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-10 text-purple-300">
          LuminaVision – Interactive Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Coluna esquerda: Painel de instruções */}
          <div className="
            bg-purple-900/70 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 
            shadow-lg shadow-purple-900/30
          ">
            <InstructionBox />
          </div>

          {/* Coluna direita: Área da câmera */}
          <div className="
            bg-purple-950 border-4 border-yellow-400 rounded-3xl 
            overflow-hidden shadow-2xl shadow-purple-900/40
            aspect-video
          ">
            <CameraView />
          </div>
        </div>

        {/* Barra inferior com avatar, VoiceAssistant e status */}
        <div className="
          mt-6 lg:mt-8 bg-purple-800/90 border-4 border-yellow-400 rounded-3xl 
          p-6 md:p-8 backdrop-blur-sm
          flex flex-col md:flex-row items-center gap-6 lg:gap-8
        ">
          {/* Avatar + Botão Ask Lumi */}
          <div className="flex flex-col items-center min-w-[180px] lg:min-w-[220px]">
            <div className="
              w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 
              rounded-full overflow-hidden border-4 border-yellow-300 
              bg-purple-700 shadow-xl
            ">
              {/* Substitua pelo caminho real da sua imagem da Lumi */}
              {/* <img src="/lumi-avatar.png" alt="Lumi" className="w-full h-full object-cover" /> */}
              <div className="w-full h-full flex items-center justify-center text-6xl">
                👧 {/* placeholder */}
              </div>
            </div>

            {/* Botão Ask Lumi (você pode conectar com o VoiceAssistant se preferir) */}
            <button className="
              mt-4 lg:mt-6 bg-purple-600 hover:bg-purple-500 
              text-white font-bold py-3 px-8 rounded-full
              border-2 border-yellow-300 shadow-md text-base lg:text-lg
              transition-all hover:scale-105
            ">
              Ask Lumi
            </button>
          </div>

          {/* Voice Assistant (ocupa o espaço central) */}
          <div className="flex-1 w-full">
            <VoiceAssistant
              peopleDetected={peopleDetected}
              sceneState={sceneState}
            />
          </div>

          {/* Status indicators à direita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6 w-full lg:w-auto lg:min-w-[300px]">
            <div className="bg-purple-900/60 border-2 border-yellow-400 rounded-2xl p-5 text-center">
              <PeopleCounter demo={peopleDetected} />
            </div>
            <div className="bg-purple-900/60 border-2 border-yellow-400 rounded-2xl p-5 text-center">
              <SceneStatus sceneState={sceneState} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}