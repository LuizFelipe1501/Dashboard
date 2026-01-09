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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);

  const busy = useRef(false);
  const prevPolygons = useRef<Point[][]>([]);
  const targetPolygons = useRef<Point[][]>([]);
  const alpha = useRef(1);

  useEffect(() => {
    let detectionTimer: NodeJS.Timeout;
    let rafId: number;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setupCanvases();
            animate();
            startDetectionLoop();
          };
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    }

    function setupCanvases() {
      const video = videoRef.current;
      if (!video) return;

      // O canvas de captura sempre terá o tamanho real do vídeo para o backend
      if (captureRef.current) {
        captureRef.current.width = video.videoWidth;
        captureRef.current.height = video.videoHeight;
      }
      updateOverlaySize();
    }

    function updateOverlaySize() {
      if (containerRef.current && overlayRef.current) {
        overlayRef.current.width = containerRef.current.clientWidth;
        overlayRef.current.height = containerRef.current.clientHeight;
      }
    }

    function animate() {
      const canvas = overlayRef.current;
      const video = videoRef.current;
      const container = containerRef.current;
      if (!canvas || !video || !container) return;

      const ctx = canvas.getContext("2d")!;
      
      // Ajusta o canvas se o container mudar de tamanho
      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        updateOverlaySize();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;

      // --- MATEMÁTICA DE ALINHAMENTO ---
      // Como o vídeo usa object-cover, ele "transborda" o container.
      // Calculamos a escala baseada no maior lado para cobrir tudo.
      const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
      const offsetX = (canvas.width - video.videoWidth * scale) / 2;
      const offsetY = (canvas.height - video.videoHeight * scale) / 2;

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current)
      );

      smoothed.forEach(polygon => {
        ctx.beginPath();
        polygon.forEach((p, i) => {
          // Converte a coordenada 0-1 do backend para a posição exata na tela
          const x = p.x * video.videoWidth * scale + offsetX;
          const y = p.y * video.videoHeight * scale + offsetY;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });

      alpha.current = Math.min(alpha.current + 0.08, 1);
      rafId = requestAnimationFrame(animate);
    }

    async function detectOnce() {
      if (busy.current || !videoRef.current || !captureRef.current) return;
      busy.current = true;

      const video = videoRef.current;
      const canvas = captureRef.current;
      const ctx = canvas.getContext("2d")!;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async blob => {
        if (!blob) {
          busy.current = false;
          return;
        }

        try {
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");

          const res = await fetch("https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/detect", {
            method: "POST",
            body: formData
          });

          const data = await res.json();
          const polygons = data.polygons ?? [];

          prevPolygons.current = targetPolygons.current.length ? targetPolygons.current : polygons;
          targetPolygons.current = polygons;
          alpha.current = 0;
        } catch (err) {
          console.error(err);
        } finally {
          busy.current = false;
        }
      }, "image/jpeg", 0.7);
    }

    function startDetectionLoop() {
      detectionTimer = setInterval(detectOnce, 1500); 
    }

    startCamera();
    window.addEventListener("resize", updateOverlaySize);

    return () => {
      clearInterval(detectionTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateOverlaySize);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden rounded-xl border border-primary/20">
      {/* IMPORTANTE: Usamos scale-x-[-1] tanto no vídeo quanto no canvas.
        Isso inverte os dois visualmente (efeito espelho), garantindo que
        as coordenadas do backend batam com a sua posição na tela.
      */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1]"
        muted
        playsInline
        autoPlay
      />

      <canvas
        ref={overlayRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
      />

      {/* Canvas invisível para capturar o frame real */}
      <canvas ref={captureRef} className="hidden" />
    </div>
  );
}