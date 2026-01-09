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

      /** * SEGREDO DO CÓDIGO ANTIGO: 
       * O tamanho interno (resolução) do Canvas deve ser IGUAL ao do Vídeo.
       */
      if (overlayRef.current) {
        overlayRef.current.width = video.videoWidth;
        overlayRef.current.height = video.videoHeight;
      }
      if (captureRef.current) {
        captureRef.current.width = video.videoWidth;
        captureRef.current.height = video.videoHeight;
      }
    }

    function animate() {
      const canvas = overlayRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 4; // Aumentei um pouco para ficar mais visível no dashboard

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current)
      );

      smoothed.forEach(polygon => {
        ctx.beginPath();
        polygon.forEach((p, i) => {
          /**
           * LÓGICA DO CÓDIGO ANTIGO:
           * Como o Canvas tem a mesma resolução do vídeo, multiplicamos direto.
           * O CSS "object-cover" vai cuidar de alinhar os dois na tela.
           */
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

    return () => {
      clearInterval(detectionTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-xl border border-white/10">
      {/* A MÁGICA: 
          Ambos possuem 'object-cover'. Como o canvas tem a mesma largura/altura 
          interna do vídeo, o navegador vai esticar e cortar os dois exatamente 
          da mesma forma. 
      */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        autoPlay
      />

      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      <canvas ref={captureRef} className="hidden" />
    </div>
  );
}