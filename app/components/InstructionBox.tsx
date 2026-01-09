export default function InstructionBox() {
  return (
    <div className="bg-[#c9a7f5] border-2 border-yellow-300 rounded-2xl p-5 max-w-sm shadow-lg">
      <h2 className="text-lg font-bold mb-3 text-black">
        How to Use the Demo
      </h2>

      <ol className="text-sm text-black space-y-2 list-decimal list-inside">
        <li>Allow camera and microphone access.</li>
        <li>Press the <strong>Ask</strong> button.</li>
        <li>
          Ask questions such as:
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>“Is anyone around me?”</li>
            <li>“How many people do you see?”</li>
            <li>“Is the environment safe?”</li>
          </ul>
        </li>
        <li>The system responds using real visual context.</li>
      </ol>

      <p className="text-xs text-black/70 mt-4 italic">
        This is a demo. No data is stored.
      </p>
    </div>
  );
}
