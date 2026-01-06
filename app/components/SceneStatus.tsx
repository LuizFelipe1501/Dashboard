"use client";

type Props = {
  sceneState: string;
};

function getStatusConfig(scene: string) {
  switch (scene) {
    case "EMPTY_ENVIRONMENT":
      return {
        label: "No people detected",
        color: "text-green-400",
        border: "border-green-700",
      };
    case "SINGLE_PERSON_PRESENT":
      return {
        label: "One person detected",
        color: "text-green-300",
        border: "border-green-600",
      };
    case "MULTIPLE_PEOPLE_PRESENT":
      return {
        label: "Multiple people detected",
        color: "text-yellow-400",
        border: "border-yellow-600",
      };
    case "CROWD_ENVIRONMENT":
      return {
        label: "Crowded environment",
        color: "text-red-400",
        border: "border-red-700",
      };
    default:
      return {
        label: "Analyzing environment",
        color: "text-zinc-400",
        border: "border-zinc-700",
      };
  }
}

export default function SceneStatus({ sceneState }: Props) {
  const cfg = getStatusConfig(sceneState);

  return (
    <div
      className={`rounded-xl border ${cfg.border} bg-zinc-950 p-6`}
    >
      <h2 className="text-sm uppercase text-zinc-500">
        Environment status
      </h2>

      <p className={`mt-4 text-xl font-semibold ${cfg.color}`}>
        {cfg.label}
      </p>
    </div>
  );
}
