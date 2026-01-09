export default function LumiAvatar() {
  return (
    <div className="hud-panel flex flex-col items-center gap-4 max-w-[220px]">
      
      <div className="relative">
        <img
          src="/lumi.png"
          alt="Lumi"
          className="w-24 h-24 rounded-full border border-white/20 shadow-lg"
        />

        {/* Glow sutil */}
        <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/20 -z-10" />
      </div>

      <span className="text-xs uppercase tracking-widest text-purple-300">
        Lumi AI
      </span>

      <button
        className="
          w-full
          text-sm
          py-2
          rounded-md
          bg-purple-600/20
          border border-purple-400/30
          text-purple-200
          hover:bg-purple-600/30
          transition
        "
      >
        Ask Lumi
      </button>

    </div>
  );
}
