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
    <main className="min-h-screen bg-[#0a1a3a] text-white overflow-x-hidden">
      {/* Container central com padding responsivo e max-height controlada */}
      <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Título */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 lg:mb-10 text-purple-300">
          LuminaVision – Interactive Demo
        </h1>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Instruções */}
          <div className="
            bg-purple-900/70 border-4 border-yellow-400 rounded-2xl sm:rounded-3xl 
            p-5 sm:p-7 lg:p-8 shadow-lg shadow-purple-900/30
          ">
            <InstructionBox />
          </div>

          {/* Câmera - altura limitada + max-w */}
          <div className="
            relative w-full aspect-[4/3] sm:aspect-video 
            max-h-[50vh] lg:max-h-[70vh] mx-auto
            bg-black rounded-2xl lg:rounded-3xl overflow-hidden
            shadow-2xl shadow-purple-900/40 border-2 border-purple-600/40
          ">
            <CameraView />
          </div>
        </div>

        {/* Barra inferior - mais compacta */}
        <div className="
          mt-6 lg:mt-10 bg-purple-800/90 border-4 border-yellow-400 rounded-2xl sm:rounded-3xl 
          p-5 sm:p-6 lg:p-8 backdrop-blur-sm
          flex flex-col md:flex-row items-center gap-5 lg:gap-8
        ">
          {/* Avatar + Botão */}
          <div className="flex flex-col items-center min-w-[140px] md:min-w-[180px]">
            <div className="
              w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 
              rounded-full overflow-hidden border-4 border-yellow-300 
              bg-purple-700 shadow-xl
            ">
              {/* <img src="/lumi-avatar.png" alt="Lumi" className="w-full h-full object-cover" /> */}
              <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl">
                👧
              </div>
            </div>

            <button className="
              mt-3 sm:mt-4 bg-purple-600 hover:bg-purple-500 
              text-white font-medium py-2 px-6 sm:px-8 rounded-full
              border-2 border-yellow-300 shadow-md text-sm sm:text-base
              transition-all hover:scale-105
            ">
              Ask Lumi
            </button>
          </div>

          {/* Voice Assistant */}
          <div className="flex-1 w-full">
            <VoiceAssistant
              peopleDetected={peopleDetected}
              sceneState={sceneState}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full lg:w-auto lg:min-w-[260px]">
            <div className="bg-purple-900/60 border-2 border-yellow-400 rounded-xl p-4 sm:p-5 text-center">
              <PeopleCounter demo={peopleDetected} />
            </div>
            <div className="bg-purple-900/60 border-2 border-yellow-400 rounded-xl p-4 sm:p-5 text-center">
              <SceneStatus sceneState={sceneState} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}