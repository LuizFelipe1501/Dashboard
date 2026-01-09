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
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
    {/* Título */}
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 lg:mb-12 text-purple-300">
      LuminaVision – Interactive Demo
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
      {/* Instruções */}
      <div className="
        bg-purple-900/70 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 
        shadow-lg shadow-purple-900/30
      ">
        <InstructionBox />
      </div>

      {/* Câmera */}
      <div className="
        relative w-full aspect-video max-w-full lg:max-w-[90%] mx-auto
        bg-black rounded-2xl lg:rounded-3xl overflow-hidden 
        shadow-2xl shadow-purple-900/40 
        border-2 sm:border-4 border-purple-600/40
      ">
        <CameraView />
      </div>
    </div>

    {/* Barra inferior */}
    <div className="
      mt-8 lg:mt-12 bg-purple-800/90 border-4 border-yellow-400 rounded-3xl 
      p-6 sm:p-8 backdrop-blur-md
      flex flex-col md:flex-row items-center gap-6 lg:gap-8
    ">
      {/* Avatar + Botão */}
      <div className="flex flex-col items-center min-w-[160px] md:min-w-[200px]">
        <div className="
          w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 
          rounded-full overflow-hidden border-4 border-yellow-300 
          bg-purple-700 shadow-xl
        ">
          {/* <img src="/lumi-avatar.png" alt="Lumi" className="w-full h-full object-cover" /> */}
          <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl">
            👧
          </div>
        </div>

        <button className="
          mt-4 bg-purple-600 hover:bg-purple-500 
          text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full
          border-2 border-yellow-300 shadow-md text-sm sm:text-base lg:text-lg
          transition-all hover:scale-105
        ">
          Ask Lumi
        </button>
      </div>

      {/* Voice Assistant */}
      <div className="flex-1 w-full">
        <VoiceAssistant peopleDetected={peopleDetected} sceneState={sceneState} />
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6 w-full lg:w-auto lg:min-w-[280px]">
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