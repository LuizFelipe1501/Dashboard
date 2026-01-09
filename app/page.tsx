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
      } catch {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#091b45] relative overflow-hidden">
      {/* Camada de fundo/overlay opcional para efeito HUD */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

      {/* Painel de instruções - posicionado como no mockup */}
      <div className="absolute top-4 left-4 z-20 w-80 md:w-96">
        <InstructionBox />
      </div>

      {/* Conteúdo central - câmera ocupando boa parte da tela */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div className="
          w-full max-w-4xl aspect-video 
          bg-black rounded-2xl overflow-hidden 
          shadow-2xl shadow-purple-900/40 
          border border-purple-600/30
        ">
          <CameraView />
        </div>
      </div>

      {/* Barra inferior fixa com Lumi + status + input */}
      <div className="
        absolute bottom-0 left-0 right-0 
        bg-gradient-to-t from-[#4a0080] to-[#2a0040] 
        border-t border-purple-500/40
        backdrop-blur-md
        z-10
      ">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 md:gap-6">
          {/* Avatar Lumi */}
          <div className="flex-shrink-0">
            {/* Aqui você coloca a imagem do avatar */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-purple-700 flex items-center justify-center overflow-hidden border-2 border-purple-300/50">
              {/* Se tiver a imagem da Lumi, use <Image src="/lumi-avatar.png" ... /> */}
              <span className="text-2xl">👧</span> {/* placeholder */}
            </div>
          </div>

          {/* Voice Assistant component */}
          <div className="flex-1">
            <VoiceAssistant
              peopleDetected={peopleDetected}
              sceneState={sceneState}
            />
          </div>

          {/* Status indicators */}
          <div className="hidden md:flex gap-4">
            <PeopleCounter demo={peopleDetected} />
            <SceneStatus sceneState={sceneState} />
          </div>
        </div>
      </div>

      {/* Status em mobile - aparece abaixo da barra se necessário */}
      <div className="md:hidden absolute bottom-24 left-0 right-0 z-10 px-4">
        <div className="flex gap-3 justify-center">
          <div className="text-sm">
            <PeopleCounter demo={peopleDetected} />
          </div>
          <div className="text-sm">
            <SceneStatus sceneState={sceneState} />
          </div>
        </div>
      </div>
    </main>
  );
}