export default function InstructionBox() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900">How to Use the Demo</h2>

      <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-800">
        <li>Allow camera and microphone access.</li>
        <li>
          Click the <span className="font-semibold text-gray-900">"Ask Lumi"</span> button.
        </li>
        <li>
          The system will respond using real visual context.
          <ul className="mt-2 pl-6 list-disc space-y-1 text-xs text-gray-700">
            <li>"Is anyone around me?"</li>
            <li>"How many people do you see?"</li>
            <li>"Is the environment safe?"</li>
          </ul>
        </li>
      </ol>

      <p className="mt-4 text-xs italic text-gray-700">This is a demo. No data is stored.</p>
    </div>
  )
}
