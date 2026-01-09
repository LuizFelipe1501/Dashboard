export default function InstructionBox() {
  return (
    <div className="bg-purple-900/70 border-4 border-yellow-400 rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-yellow-300">
        How to Use the Demo
      </h2>

      <ol className="sspace-y-3 text-base sm:text-lg">
        <li>Allow camera and microphone access.</li>
        <li>Click the <span className="text-yellow-300 font-medium">"Ask Lumi"</span> button.</li>
        <li>
          The system will respond using real visual context.
          <ul className="mt-3 pl-6 list-disc space-y-2 text-purple-200">
            <li>"Is anyone around me?"</li>
            <li>"How many people do you see?"</li>
            <li>"Is the environment safe?"</li>
          </ul>
        </li>
      </ol>

      <p className="mt-8 text-sm italic text-purple-400">
        This is a demo. No data is stored.
      </p>
    </div>
  );
}