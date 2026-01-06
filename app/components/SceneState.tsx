"use client";
import { useEffect, useState } from "react";

const stateMap: Record<string, string> = {
  calm: "Environment appears calm",
  crowded: "Multiple people detected nearby",
  empty: "No people detected",
  unknown: "Analyzing environment…",
};

export default function SceneState() {
  const [state, setState] = useState("unknown");

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(
          "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/status"
        );
        const data = await res.json();
        setState(data.scene_state ?? "unknown");
      } catch {
        setState("unknown");
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-sm text-zinc-400 uppercase">Scene State</h2>
      <p className="mt-4 text-xl font-semibold">
        {stateMap[state] ?? "Analyzing…"}
      </p>
    </div>
  );
}
