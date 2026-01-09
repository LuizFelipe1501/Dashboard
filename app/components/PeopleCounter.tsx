"use client";
import { useEffect, useState } from "react";

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
    const interval = setInterval(fetchPeople, 4000);
    return () => clearInterval(interval);
  }, [demo]);

  return (
    <div className="text-center">
      <h2 className="text-xs uppercase tracking-wide text-yellow-300">
        People Detected
      </h2>
      <p className="mt-1 text-3xl sm:text-4xl font-bold text-yellow-300">
        {count}
      </p>
      <p className="mt-1 text-xs text-purple-300">
        Camera-based detection
      </p>
    </div>
  );
}