// Serviço para chamadas à API da Anthropic Claude

interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  content: Array<{ type: string; text?: string }>;
}

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

export const aiService = {
  async sendChatMessage(
    messages: MessageParam[],
    systemPrompt: string
  ): Promise<string> {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const reply =
        data.content?.map((c) => c.text || "").join("") ||
        "Não consegui responder, tente novamente.";

      return reply;
    } catch (error) {
      console.error("Chat API error:", error);
      throw new Error("Erro ao conectar. Verifique sua conexão e tente novamente.");
    }
  },

  async generateQuizQuestion(topic: string): Promise<{
    pergunta: string;
    opcoes: string[];
    correta: number;
    explicacao: string;
  }> {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: `Você gera questões de múltipla escolha sobre odontologia para estudantes universitários.
Responda APENAS com JSON válido, sem texto extra, sem blocos de código.
Formato: {"pergunta":"...","opcoes":["A) ...","B) ...","C) ...","D) ..."],"correta":0,"explicacao":"..."}
O campo "correta" é o índice (0-3) da opção correta.`,
          messages: [
            {
              role: "user",
              content: `Gere uma questão de múltipla escolha de nível universitário sobre ${topic} em odontologia.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const question = JSON.parse(clean);

      return question;
    } catch (error) {
      console.error("Quiz API error:", error);
      throw new Error("Erro ao gerar pergunta. Tente novamente.");
    }
  },
};
