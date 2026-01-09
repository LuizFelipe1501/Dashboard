export default function LumiAvatar() {
  return (
    <div className="bg-purple-700 border-4 border-yellow-300 rounded-full p-6 flex flex-col items-center">
      <img
        src="/lumi.png"
        alt="Lumi"
        className="w-32 h-32 rounded-full"
      />
      <button className="mt-4 bg-[#c9a6f2] text-black px-4 py-2 rounded-full font-semibold">
        Ask Lumi
      </button>
    </div>
  );
}
