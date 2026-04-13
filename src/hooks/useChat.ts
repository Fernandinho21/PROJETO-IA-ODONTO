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
      let progressMessageAdded = false;

      try {
        const onProgress = (progressText: string) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];

            if (lastMessage?.role === "assistant" && lastMessage.content === progressText) {
              return prev;
            }

            if (progressMessageAdded && lastMessage?.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: progressText }];
            }

            progressMessageAdded = true;
            return [...prev, { role: "assistant", content: progressText }];
          });
        };

        const reply = await aiService.sendChatMessage(
          newMessages,
          systemPrompt,
          onProgress
        );
        setMessages((prev) => {
          if (progressMessageAdded && prev[prev.length - 1]?.role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: reply }];
          }

          return [...prev, { role: "assistant", content: reply }];
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Erro ao conectar: ${message}`,
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
