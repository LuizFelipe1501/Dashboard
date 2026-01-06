"use client";

import { ReactNode } from "react";

export default function HudPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative hud-panel">
      {/* cantos */}
      <span className="hud-corner top-left" />
      <span className="hud-corner top-right" />
      <span className="hud-corner bottom-left" />
      <span className="hud-corner bottom-right" />

      {children}
    </div>
  );
}
