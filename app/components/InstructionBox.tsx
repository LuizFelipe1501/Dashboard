export default function InstructionBox() {
  return (
    <div className="text-gray-800 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        How to Use the Demo
      </h2>
      <div className="space-y-3">
        <p className="font-semibold">
          1. Allow camera and microphone access.
        </p>
        <p className="font-semibold">
          2. Click the "Ask Lumi" button.
        </p>
        <p className="font-semibold">
          3. The system will respond using real visual feedback.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-400">
          <p className="font-medium">You can ask questions such as:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>"Is anyone around me?"</li>
            <li>"How many people do you see?"</li>
            <li>"Is the environment safe?"</li>
          </ul>
        </div>
      </div>
      <p className="text-xs italic text-gray-600 mt-4 text-center">
        This is a demo. No data is stored.
      </p>
    </div>
  );
}