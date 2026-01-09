"use client";
import { useEffect, useState } from "react";
import HudPanel from "./HudPanel";

type Props = {
  demo?: number | null;
};

export default function PeopleCounter({ demo = null }: Props) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (demo !== null) {
      setCount(demo);
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchPeople = async () => {
      try {
        const res = await fetch(
          "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/status"
        );
        const data = await res.json();
        setCount(data.people_detected ?? 0);
      } catch {
        setCount(prev => (prev >= 3 ? 1 : prev + 1));
      }
    };

    fetchPeople();
    interval = setInterval(fetchPeople, 4000);

    return () => clearInterval(interval);
  }, [demo]);

return (
    <div className="bg-purple-900/60 border-2 border-yellow-400 rounded-2xl p-6 text-center shadow-md">
      <h2 className="text-base uppercase font-semibold text-yellow-300 tracking-wide">
        People Detected
      </h2>
      <p className="mt-3 text-5xl font-bold text-yellow-300">
        {demo ?? 0}
      </p>
      <p className="mt-2 text-sm text-purple-300">
        Camera-based detection
      </p>
    </div>
  );
}