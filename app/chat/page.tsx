"use client";

import ChatBox from "../components/ChatBox";
import VoiceInput from "../components/VoiceInput";

export default function ChatPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <ChatBox />
      <VoiceInput />
    </div>
  );
}
