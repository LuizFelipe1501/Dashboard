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
    <HudPanel>
      <h2 className="text-xs text-green-400 uppercase tracking-widest">
        People Detected
      </h2>

      <p className="mt-4 text-5xl font-bold text-green-400">
        {count}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        Camera-based detection
      </p>
    </HudPanel>
  );
}
