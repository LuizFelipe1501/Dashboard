"use client"

type Props = {
  sceneState: string
}

function getStatusConfig(scene: string) {
  switch (scene) {
    case "EMPTY_ENVIRONMENT":
      return { label: "No people detected", color: "text-green-300" }
    case "SINGLE_PERSON_PRESENT":
      return { label: "One person detected", color: "text-green-300" }
    case "MULTIPLE_PEOPLE_PRESENT":
      return { label: "Multiple people detected", color: "text-yellow-300" }
    case "CROWD_ENVIRONMENT":
      return { label: "Crowded environment", color: "text-red-300" }
    default:
      return { label: "No people detected", color: "text-purple-300" }
  }
}

export default function SceneStatus({ sceneState }: Props) {
  const cfg = getStatusConfig(sceneState)

  return (
    <div className="text-center">
      <h2 className="text-sm uppercase tracking-widest text-white font-semibold mb-3">Environment Status</h2>
      <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
    </div>
  )
}
