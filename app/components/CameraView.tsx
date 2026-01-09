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
  const containerRef = useRef<HTMLDivElement>(null); // Referência para o layout novo
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);

  const busy = useRef(false);
  const prevPolygons = useRef<Point[][]>([]);
  const targetPolygons = useRef<Point[][]>([]);
  const alpha = useRef(1);

  useEffect(() => {
    let detectionTimer: any;
    let rafId: number;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
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
        console.error("Erro ao abrir câmera:", err);
      }
    }

    function setupCanvases() {
      const video = videoRef.current!;
      // Mantém a lógica de captura no tamanho real do vídeo
      if (captureRef.current) {
        captureRef.current.width = video.videoWidth;
        captureRef.current.height = video.videoHeight;
      }
      updateOverlaySize();
    }

    // Função para o canvas sempre preencher o container do layout novo
    function updateOverlaySize() {
      if (containerRef.current && overlayRef.current) {
        overlayRef.current.width = containerRef.current.clientWidth;
        overlayRef.current.height = containerRef.current.clientHeight;
      }
    }

    function animate() {
      const canvas = overlayRef.current!;
      const video = videoRef.current!;
      const container = containerRef.current!;
      if (!canvas || !video || !container) return;

      const ctx = canvas.getContext("2d")!;
      
      // Ajusta o canvas se você redimensionar a tela
      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        updateOverlaySize();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;

      // --- AJUSTE PARA O LAYOUT NOVO (OBJECT-COVER) ---
      // Essa é a única parte "nova". Ela calcula como o vídeo está esticado na tela.
      const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
      const offsetX = (canvas.width - video.videoWidth * scale) / 2;
      const offsetY = (canvas.height - video.videoHeight * scale) / 2;

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current)
      );

      smoothed.forEach(polygon => {
        ctx.beginPath();
        polygon.forEach((p, i) => {
          // Lógica original multiplicada pela escala e somada ao offset do layout
          const x = p.x * (video.videoWidth * scale) + offsetX;
          const y = p.y * (video.videoHeight * scale) + offsetY;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });

      alpha.current = Math.min(alpha.current + 0.08, 1);
      rafId = requestAnimationFrame(animate);
    }

    async function detectOnce() {
      if (busy.current) return;
      busy.current = true;

      const video = videoRef.current!;
      const canvas = captureRef.current!;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async blob => {
        if (!blob) { busy.current = false; return; }
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
        } catch (err) { console.error(err); } 
        finally { busy.current = false; }
      }, "image/jpeg", 0.6);
    }

    function startDetectionLoop() {
      detectionTimer = setInterval(detectOnce, 1000);
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
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden rounded-xl border-2 border-primary/20">
      {/* VÍDEO E CANVAS ESPELHADOS ( scale-x-[-1] )
          Isso resolve o problema das suas prints onde você estava de um lado e o contorno do outro.
      */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        muted
        playsInline
        autoPlay
      />

      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 scale-x-[-1]"
      />

      <canvas ref={captureRef} className="hidden" />
    </div>
  );
}