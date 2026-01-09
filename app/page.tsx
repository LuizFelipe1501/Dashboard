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
  const [peopleDetected, setPeopleDetected] = useState(0);
  const [sceneState, setSceneState] = useState("UNKNOWN");

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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Instructions */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-400 via-purple-300 to-pink-300 rounded-3xl p-6 shadow-2xl">
              <InstructionBox />
            </div>
          </div>

          {/* Right Panel: Camera + Status */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Camera Feed with gradient border */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 p-1">
              <div className="bg-black rounded-2xl aspect-video flex items-center justify-center">
                <CameraView />
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* People Counter Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl border-4 border-pink-400 shadow-xl p-6 text-center">
                <PeopleCounter demo={peopleDetected} />
              </div>

              {/* Scene Status Card */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl border-4 border-purple-400 shadow-xl p-6 text-center">
                <SceneStatus sceneState={sceneState} />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 left-6 z-50 max-w-sm">
          <VoiceAssistant peopleDetected={peopleDetected} sceneState={sceneState} />
        </div>
      </div>
    </div>
  )
}
