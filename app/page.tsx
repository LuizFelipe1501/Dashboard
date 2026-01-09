"use client";

import { useEffect, useState } from "react";
import CameraView from "./components/CameraView";
import PeopleCounter from "./components/PeopleCounter";
import SceneStatus from "./components/SceneStatus";
import VoiceAssistant from "./components/VoiceAssistant";
import InstructionBox from "./components/InstructionBox";

const BACKEND_URL =
  "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io";

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
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Hallucination Checker — Interactive Demo
      </h1>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* COLUNA ESQUERDA */}
        <div className="flex flex-col gap-4">
          <InstructionBox />
        </div>

        {/* COLUNA DIREITA (2x mais larga) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <CameraView />

          <div className="flex gap-4">
            <PeopleCounter demo={peopleDetected} />
            <SceneStatus sceneState={sceneState} />
          </div>

          <VoiceAssistant
            peopleDetected={peopleDetected}
            sceneState={sceneState}
          />
        </div>

      </div>
    </main>
  );
}
