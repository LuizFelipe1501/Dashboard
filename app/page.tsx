"use client";

import { useEffect, useState } from "react";
import CameraView from "./components/CameraView";
import PeopleCounter from "./components/PeopleCounter";
import SceneStatus from "./components/SceneStatus";
import VoiceAssistant from "./components/VoiceAssistant";

const BACKEND_URL =
  "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io";

export default function Home() {
  const [peopleDetected, setPeopleDetected] = useState<number>(0);
  const [sceneState, setSceneState] = useState<string>("UNKNOWN");

  // 🔁 Puxa estado real do backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/status`);
        const data = await res.json();

        setPeopleDetected(data.people_detected ?? 0);
        setSceneState(data.scene_state ?? "UNKNOWN");
      } catch {
        // fallback silencioso (demo não quebra)
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">
        Hallucination Checker — Interactive Demo
      </h1>

      {/* 🎥 Câmera real */}
      <CameraView />

      {/* 📊 Estado objetivo */}
      <div className="flex gap-4">
        <PeopleCounter demo={peopleDetected} />
        <SceneStatus sceneState={sceneState} />
      </div>

      {/* 🎙️ Voz + IA */}
      <VoiceAssistant
        peopleDetected={peopleDetected}
        sceneState={sceneState}
      />
    </main>
  );
}
