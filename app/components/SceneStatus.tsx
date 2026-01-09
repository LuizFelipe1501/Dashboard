"use client";

type Props = {
  sceneState: string;
};

function getStatusConfig(scene: string) {
  switch (scene) {
    case "EMPTY_ENVIRONMENT":
      return { label: "No people detected", color: "text-green-400", border: "border-green-600" };
    case "SINGLE_PERSON_PRESENT":
      return { label: "One person detected", color: "text-green-300", border: "border-green-500" };
    case "MULTIPLE_PEOPLE_PRESENT":
      return { label: "Multiple people detected", color: "text-yellow-400", border: "border-yellow-600" };
    case "CROWD_ENVIRONMENT":
      return { label: "Crowded environment", color: "text-red-400", border: "border-red-600" };
    default:
      return { label: "Analyzing environment…", color: "text-zinc-400", border: "border-zinc-600" };
  }
}

export default function SceneStatus({ sceneState }: Props) {
  const cfg = getStatusConfig(sceneState);

  return (
    <div className={`bg-purple-900/60 border-2 border-yellow-400 rounded-2xl p-6 text-center shadow-md`}>
      <h2 className="text-base uppercase font-semibold text-yellow-300">
        Environment Status
      </h2>
      <p className={`mt-3 text-xl lg:text-2xl font-bold ${cfg.color}`}>
        {cfg.label}
      </p>
    </div>
  );
}