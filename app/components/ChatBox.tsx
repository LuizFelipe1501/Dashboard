"use client";

import { useState } from "react";
import { sendChat } from "../lib/api";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  async function handleSend() {
    if (!input) return;

    setMessages(prev => [...prev, "🧑 " + input]);
    const res = await sendChat(input);
    setMessages(prev => [...prev, "🤖 " + res.text]);
    setInput("");
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700">
      <div className="h-64 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="flex-1 bg-black p-2 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={handleSend} className="px-4 bg-green-600 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
