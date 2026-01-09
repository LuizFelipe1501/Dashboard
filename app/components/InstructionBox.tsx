export default function InstructionBox() {
  return (
    <div className="text-gray-800">
      <h2 className="text-lg md:text-xl font-bold mb-3 text-gray-900">How to Use the Demo</h2>

      <ol className="list-decimal pl-4 space-y-2 text-sm">
        <li>Allow camera and microphone access.</li>
        <li>
          Click the <span className="font-semibold">"Ask Lumi"</span> button.
        </li>
        <li>The system will respond using real visual context.</li>
      </ol>

      <p className="mt-3 text-sm text-gray-700">You can ask questions such as:</p>
      <ul className="mt-1 pl-4 list-disc space-y-1 text-sm text-gray-600">
        <li>"Is anyone around me?"</li>
        <li>"How many people do you see?"</li>
        <li>"Is the environment safe?"</li>
      </ul>

      <p className="mt-4 text-xs italic text-red-600">This is a demo. No data is stored.</p>
    </div>
  )
}
