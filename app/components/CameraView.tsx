"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPolygon(from: Point[], to: Point[], t: number): Point[] {
  if (!from || from.length !== to.length) return to;
  return from.map((p, i) => ({
    x: lerp(p.x, to[i].x, t),
    y: lerp(p.y, to[i].y, t)
  }));
}

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);

  const busy = useRef(false);
  const prevPolygons = useRef<Point[][]>([]);
  const targetPolygons = useRef<Point[][]>([]);
  const alpha = useRef(1);

  useEffect(() => {
    let detectionTimer: NodeJS.Timeout | undefined;
    let rafId: number;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } } // Melhor qualidade, mas responsivo
        });

        const video = videoRef.current!;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play();
          setupCanvases();
          animate();
          startDetectionLoop();
        };
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    }

    function setupCanvases() {
      const video = videoRef.current!;
      if (!video.videoWidth || !video.videoHeight) return;

      const w = video.videoWidth;
      const h = video.videoHeight;

      if (overlayRef.current) {
        overlayRef.current.width = w;
        overlayRef.current.height = h;
      }
      if (captureRef.current) {
        captureRef.current.width = w;
        captureRef.current.height = h;
      }
    }

    function animate() {
      if (!overlayRef.current) return;
      const canvas = overlayRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current)
      );

      smoothed.forEach(polygon => {
        ctx.beginPath();
        polygon.forEach((p, i) => {
          const x = p.x * canvas.width;
          const y = p.y * canvas.height;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });

      alpha.current = Math.min(alpha.current + 0.08, 1);
      rafId = requestAnimationFrame(animate);
    }

    async function detectOnce() {
      if (busy.current || !captureRef.current || !videoRef.current) return;
      busy.current = true;

      const video = videoRef.current;
      const canvas = captureRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            busy.current = false;
            return;
          }

          try {
            const formData = new FormData();
            formData.append("file", blob, "frame.jpg");

            const res = await fetch(
              "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/detect",
              { method: "POST", body: formData }
            );

            const data = await res.json();
            const polygons = data.polygons ?? [];

            prevPolygons.current = targetPolygons.current.length
              ? targetPolygons.current
              : polygons;

            targetPolygons.current = polygons;
            alpha.current = 0;
          } catch (err) {
            console.error("Erro na detecção:", err);
          } finally {
            busy.current = false;
          }
        }, "image/jpeg", 0.7);
      }
    }

    function startDetectionLoop() {
      detectionTimer = setInterval(detectOnce, 1500); // 1 a cada ~1.5s para não sobrecarregar
    }

    startCamera();

    return () => {
      if (detectionTimer) clearInterval(detectionTimer);
      cancelAnimationFrame(rafId);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
        muted
        playsInline
        autoPlay
      />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <canvas ref={captureRef} className="hidden" />
    </div>
  );
}