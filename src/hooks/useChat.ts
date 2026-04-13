// Hook customizado para gerenciar messages do chat

import { useState, useCallback } from "react";
import { aiService } from "../services";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChat(initialGreeting: string) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: initialGreeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = useCallback(
    async (systemPrompt: string) => {
      const text = input.trim();
      if (!text || loading) return;

      setInput("");
      const newMessages: Message[] = [...messages, { role: "user", content: text }];
      setMessages(newMessages);
      setLoading(true);
      setError("");

      try {
        const reply = await aiService.sendChatMessage(
          newMessages,
          systemPrompt
        );
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Erro ao conectar. Verifique sua conexão e tente novamente.",
          },
        ]);
      }
      setLoading(false);
    },
    [input, loading, messages]
  );

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
  };
}
