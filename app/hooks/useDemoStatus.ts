"use client";

import { useEffect, useState } from "react";

export function useDemoStatus(enabled: boolean) {
  const [people, setPeople] = useState(0);
  const [scene, setScene] = useState("UNKNOWN");

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const fakePeople = Math.floor(Math.random() * 5);
      setPeople(fakePeople);

      if (fakePeople === 0) setScene("EMPTY_ENVIRONMENT");
      else if (fakePeople === 1) setScene("SINGLE_PERSON_PRESENT");
      else if (fakePeople <= 4) setScene("MULTIPLE_PEOPLE_PRESENT");
      else setScene("CROWD_ENVIRONMENT");
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  return { people, scene };
}
