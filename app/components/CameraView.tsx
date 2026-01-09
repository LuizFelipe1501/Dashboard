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
        console.error("Erro na câmera:", err);
      }
    }

    function setupCanvases() {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return;
      
      if (captureRef.current) {
        captureRef.current.width = video.videoWidth;
        captureRef.current.height = video.videoHeight;
      }
      updateOverlaySize();
    }

    function updateOverlaySize() {
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (!container || !overlay) return;
      
      // Sincroniza o tamanho do desenho com o tamanho visível na tela
      overlay.width = container.clientWidth;
      overlay.height = container.clientHeight;
    }

    function animate() {
      const canvas = overlayRef.current;
      const video = videoRef.current;
      const container = containerRef.current;
      
      if (!canvas || !video || !container || !video.videoWidth) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      const ctx = canvas.getContext("2d")!;
      
      // Redimensiona se a janela mudar
      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        updateOverlaySize();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;

      // --- MATEMÁTICA DE POSICIONAMENTO ---
      // 1. Calculamos a escala necessária para cobrir o container (object-cover)
      const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
      
      // 2. Calculamos quanto do vídeo "transbordou" e foi cortado
      // Offset é a diferença entre o canvas e o vídeo escalado, dividido por 2 (centralização)
      const offsetX = (canvas.width - video.videoWidth * scale) / 2;
      const offsetY = (canvas.height - video.videoHeight * scale) / 2;

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current)
      );

      smoothed.forEach(polygon => {
        ctx.beginPath();
        polygon.forEach((p, i) => {
          /**
           * MAPEAMENTO FINAL:
           * Pegamos o ponto normalizado (0 a 1) e projetamos no espaço visível.
           * Fórmula: (Ponto * TamanhoReal * Escala) + DeslocamentoCentral
           */
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
        if (!blob) { busy.current = false; return; }
        try {
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");
          const res = await fetch("https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/detect", {
            method: "POST", body: formData
          });
          const data = await res.json();
          const polygons = data.polygons ?? [];
          prevPolygons.current = targetPolygons.current.length ? targetPolygons.current : polygons;
          targetPolygons.current = polygons;
          alpha.current = 0;
        } catch (err) { console.error(err); } 
        finally { busy.current = false; }
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
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden rounded-xl">
      {/* Vídeo base */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        autoPlay
      />
      {/* Canvas com os contornos (Sobreposição Perfeita) */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
      <canvas ref={captureRef} className="hidden" />
    </div>
  );
}