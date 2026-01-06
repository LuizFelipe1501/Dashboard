"use client";

import { useEffect, useRef } from "react";

export default function WakeWordListener() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    async function startListening() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size === 0) return;

        const formData = new FormData();
        formData.append("audio", event.data);

        await fetch("http://localhost:8000/wakeword", {
          method: "POST",
          body: formData,
        });
      };

      mediaRecorder.start(2000); // chunks de 2s
    }

    startListening();

    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  return null;
}
