"use client"

import { useEffect, useRef } from "react"

type Point = { x: number; y: number }

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpPolygon(from: Point[], to: Point[], t: number): Point[] {
  if (!from || from.length !== to.length) return to
  return from.map((p, i) => ({
    x: lerp(p.x, to[i].x, t),
    y: lerp(p.y, to[i].y, t),
  }))
}

export default function CameraView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const captureRef = useRef<HTMLCanvasElement>(null)

  const busy = useRef(false)
  const prevPolygons = useRef<Point[][]>([])
  const targetPolygons = useRef<Point[][]>([])
  const alpha = useRef(1)

  useEffect(() => {
    let detectionTimer: NodeJS.Timeout | undefined
    let rafId: number
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            console.log(
              "[v0] Vídeo carregado - dimensões:",
              videoRef.current?.videoWidth,
              "x",
              videoRef.current?.videoHeight,
            )
            videoRef.current?.play().catch((e) => console.error("Play error:", e))
            setupCanvases()
            animate()
            startDetectionLoop()
          }
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err)
      }
    }

    function setupCanvases() {
      const video = videoRef.current
      if (!video || !video.videoWidth || !video.videoHeight) {
        setTimeout(setupCanvases, 300)
        return
      }

      if (captureRef.current) {
        captureRef.current.width = video.videoWidth
        captureRef.current.height = video.videoHeight
      }

      updateOverlaySize()
    }

    function updateOverlaySize() {
      const container = containerRef.current
      const overlay = overlayRef.current
      if (!container || !overlay) return

      overlay.width = container.clientWidth
      overlay.height = container.clientHeight
    }

    function animate() {
      const canvas = overlayRef.current
      const container = containerRef.current
      const video = videoRef.current
      if (!canvas || !container || !video) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "#00ff00"
      ctx.lineWidth = 2

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current),
      )

      const videoRatio = video.videoWidth / video.videoHeight
      const containerRatio = canvas.width / canvas.height

      let scale: number
      let offsetX = 0
      let offsetY = 0

      if (containerRatio > videoRatio) {
        // Container é mais largo - vídeo preenche largura, corta altura
        scale = canvas.width / video.videoWidth
        const scaledHeight = video.videoHeight * scale
        offsetY = (canvas.height - scaledHeight) / 2
      } else {
        // Container é mais alto - vídeo preenche altura, corta largura
        scale = canvas.height / video.videoHeight
        const scaledWidth = video.videoWidth * scale
        offsetX = (canvas.width - scaledWidth) / 2
      }

      smoothed.forEach((polygon) => {
        ctx.beginPath()
        polygon.forEach((p, i) => {
          const x = p.x * video.videoWidth * scale + offsetX
          const y = p.y * video.videoHeight * scale + offsetY
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.stroke()
      })

      alpha.current = Math.min(alpha.current + 0.08, 1)
      rafId = requestAnimationFrame(animate)
    }

    async function detectOnce() {
      if (busy.current || !videoRef.current || !captureRef.current) return
      busy.current = true

      const video = videoRef.current
      const canvas = captureRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              busy.current = false
              return
            }

            try {
              const formData = new FormData()
              formData.append("file", blob, "frame.jpg")

              const res = await fetch(
                "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io/detect",
                { method: "POST", body: formData },
              )

              const data = await res.json()
              const polygons = data.polygons ?? []

              prevPolygons.current = targetPolygons.current.length ? targetPolygons.current : polygons
              targetPolygons.current = polygons
              alpha.current = 0
            } catch (err) {
              console.error("Detect error:", err)
            } finally {
              busy.current = false
            }
          },
          "image/jpeg",
          0.7,
        )
      }
    }

    function startDetectionLoop() {
      detectionTimer = setInterval(detectOnce, 2000)
    }

    startCamera()

    window.addEventListener("resize", updateOverlaySize)

    return () => {
      if (detectionTimer) clearInterval(detectionTimer)
      cancelAnimationFrame(rafId)
      if (stream) stream.getTracks().forEach((t) => t.stop())
      window.removeEventListener("resize", updateOverlaySize)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay />
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <canvas ref={captureRef} className="hidden" />
    </div>
  )
}
