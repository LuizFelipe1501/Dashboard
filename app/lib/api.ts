const BASE_URL =
  "https://hallucination.calmwave-93bbec10.brazilsouth.azurecontainerapps.io";

export async function getStatus() {
  const res = await fetch(`${BASE_URL}/status`, { cache: "no-store" });
  return res.json();
}

export async function sendChat(message: string) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return res.json();
}
