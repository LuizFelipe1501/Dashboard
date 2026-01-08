export default function InstructionBox() {
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 max-w-xs">
      <h2 className="text-lg font-semibold mb-2">How to use the demo</h2>

      <ol className="text-sm text-neutral-300 space-y-2 list-decimal list-inside">
        <li>Allow camera and microphone access.</li>
        <li>Click the <strong>Ask</strong> button.</li>
        <li>
          Ask questions like:
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>“Is anyone around me?”</li>
            <li>“How many people do you see?”</li>
            <li>“Is the environment safe?”</li>
          </ul>
        </li>
        <li>The system answers using real visual context.</li>
      </ol>

      <p className="text-xs text-neutral-400 mt-4">
        This is a demo. No data is stored.
      </p>
    </div>
  );
}
