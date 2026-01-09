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
    <main className="h-screen bg-[#091b45] text-white flex flex-col overflow-hidden">
      <h1 className="text-2xl font-bold text-center py-4 bg-black/30">
        LuminaVision – Demo
      </h1>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="bg-purple-900/60 rounded-lg p-4 overflow-auto">
          <InstructionBox />
        </div>

        <div className="bg-black rounded-lg overflow-hidden h-full">
          <CameraView />
        </div>
      </div>

      <div className="bg-purple-900/80 p-4 flex flex-wrap gap-4 justify-center">
        <VoiceAssistant peopleDetected={0} sceneState="UNKNOWN" />
        <PeopleCounter demo={0} />
        <SceneStatus sceneState="UNKNOWN" />
      </div>
    </main>
  );
}