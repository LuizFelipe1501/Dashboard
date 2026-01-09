export default function InstructionBox() {
  return (
    <div className="hud-panel max-w-sm text-sm text-neutral-200">
      {/* HUD corners */}
      <span className="hud-corner top-left" />
      <span className="hud-corner top-right" />
      <span className="hud-corner bottom-left" />
      <span className="hud-corner bottom-right" />

      <h2 className="text-base font-semibold mb-3 tracking-wide text-white">
        HOW TO USE
      </h2>

      <ol className="space-y-2 list-decimal list-inside text-neutral-300">
        <li>Allow camera & microphone.</li>
        <li>Press the <span className="text-white font-medium">Ask</span> button.</li>
        <li>
          Ask things like:
          <ul className="mt-1 ml-4 list-disc text-neutral-400 space-y-1">
            <li>Is anyone around me?</li>
            <li>How many people do you see?</li>
            <li>Is the environment safe?</li>
          </ul>
        </li>
        <li>Answers use real visual context.</li>
      </ol>

      <p className="mt-4 text-xs text-neutral-400 italic">
        Demo only. No data is stored.
      </p>
    </div>
  );
}
