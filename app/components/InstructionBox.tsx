export default function InstructionBox() {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-yellow-300">
        How to Use the Demo
      </h2>

      <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-neutral-300">
        <li>Allow camera and microphone access.</li>
        <li>Click the <span className="text-yellow-300 font-medium">"Ask Lumi"</span> button.</li>
        <li>
          The system will respond using real visual context.
          <ul className="mt-2 pl-6 list-disc space-y-1 text-sm text-neutral-400">
            <li>"Is anyone around me?"</li>
            <li>"How many people do you see?"</li>
            <li>"Is the environment safe?"</li>
          </ul>
        </li>
      </ol>

      <p className="mt-4 text-xs italic text-neutral-400">
        This is a demo. No data is stored.
      </p>
    </div>
  );
}