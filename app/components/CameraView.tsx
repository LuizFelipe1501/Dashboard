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
      const container = containerRef.current
      if (!video || !video.videoWidth || !video.videoHeight || !container) {
        setTimeout(setupCanvases, 300)
        return
      }

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      if (overlayRef.current) {
        overlayRef.current.width = containerWidth
        overlayRef.current.height = containerHeight
      }
      if (captureRef.current) {
        captureRef.current.width = video.videoWidth
        captureRef.current.height = video.videoHeight
      }
    }

    function getVideoContainTransform() {
      const video = videoRef.current
      const container = containerRef.current
      if (!video || !container || !video.videoWidth || !video.videoHeight) {
        return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
      }

      const videoW = video.videoWidth
      const videoH = video.videoHeight
      const containerW = container.clientWidth
      const containerH = container.clientHeight

      const videoRatio = videoW / videoH
      const containerRatio = containerW / containerH

      let renderW: number
      let renderH: number

      // object-contain: o vídeo cabe inteiro no container, pode ter barras pretas
      if (containerRatio > videoRatio) {
        // Container mais largo - altura do vídeo = altura do container
        renderH = containerH
        renderW = containerH * videoRatio
      } else {
        // Container mais alto - largura do vídeo = largura do container
        renderW = containerW
        renderH = containerW / videoRatio
      }

      // Offset para centralizar (barras pretas em volta)
      const offsetX = (containerW - renderW) / 2
      const offsetY = (containerH - renderH) / 2

      return { scaleX: renderW, scaleY: renderH, offsetX, offsetY }
    }

    function animate() {
      const canvas = overlayRef.current
      const video = videoRef.current
      const container = containerRef.current
      if (!canvas || !video || !container) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "#00ff00"
      ctx.lineWidth = 2

      const { scaleX, scaleY, offsetX, offsetY } = getVideoContainTransform()

      const smoothed = targetPolygons.current.map((poly, i) =>
        lerpPolygon(prevPolygons.current[i] ?? poly, poly, alpha.current),
      )

      smoothed.forEach((polygon) => {
        ctx.beginPath()
        polygon.forEach((p, i) => {
          const x = p.x * scaleX + offsetX
          const y = p.y * scaleY + offsetY
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

    const handleResize = () => setupCanvases()
    window.addEventListener("resize", handleResize)

    return () => {
      if (detectionTimer) clearInterval(detectionTimer)
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleResize)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain" muted playsInline autoPlay />
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <canvas ref={captureRef} className="hidden" />
    </div>
  )
}
