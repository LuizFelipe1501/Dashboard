import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from 'geist/font/mono'
import "./globals.css"

const _geist = GeistMono

export const metadata: Metadata = {
  title: "LuminaVision – Interactive Demo",
  description: "Real-time perception confirmation dashboard with AI-powered detection",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${_geist.className} bg-slate-900 text-white min-h-screen`}>
        {children}

      </body>
    </html>
  )
}
