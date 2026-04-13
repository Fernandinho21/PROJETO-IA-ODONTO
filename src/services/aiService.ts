import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const FALLBACK_MODELS = ["gemini-3.0-pro", "gemini-2.5-pro", "gemini-2.5-flash"] as const;
const DENTIN_NAME = "Dentin";
const REQUEST_TIMEOUT_MS = 25000;
const RETRY_PROGRESS_MESSAGE =
  "🦷 Dentin: Os servidores estão cheios agora! 😅 Estou tentando novamente em alguns segundos...";
const RETRY_EXHAUSTED_MESSAGE =
  "🦷 Dentin: Os servidores estão muito cheios no momento. Que tal estudar um pouco sobre periodontia enquanto eu continuo tentando? 😊 Tente perguntar novamente em alguns minutos.";

const FRIENDLY_MESSAGES = {
  busy: RETRY_PROGRESS_MESSAGE,
  slow: "⏳ Dentin está preparando sua resposta com carinho... 🦷",
  generic: "🦷 Dentin: Tive um pequeno contratempo técnico, mas já estou resolvendo! Só um minutinho... ✨",
  offTopic:
    "🦷 Dentin: Hmm, isso não é sobre dentes... Eu sou o Dentin, seu amigo odontológico! Vamos falar de saúde bucal? 😁",
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type QuizQuestion = {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
};

type ProgressCallback = (message: string) => void;

function getModel(modelName: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_UNAVAILABLE");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

function hasErrorCode(error: unknown, code: number): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { status?: number; code?: number; message?: string };
  return (
    maybeError.status === code ||
    maybeError.code === code ||
    (typeof maybeError.message === "string" && maybeError.message.includes(String(code)))
  );
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("REQUEST_TIMEOUT");
}

function is503Error(error: unknown): boolean {
  return hasErrorCode(error, 503);
}

function isConnectionError(error: unknown): boolean {
  if (hasErrorCode(error, 429) || hasErrorCode(error, 503) || hasErrorCode(error, 504)) {
    return true;
  }

  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("unavailable") ||
    message.includes("timeout")
  );
}

export function getFriendlyErrorMessage(error: Error): string {
  if (isTimeoutError(error)) return FRIENDLY_MESSAGES.slow;
  if (isConnectionError(error)) return FRIENDLY_MESSAGES.busy;
  return FRIENDLY_MESSAGES.generic;
}

// ============ VALIDAÇÃO CORRIGIDA ============

const OBVIOUS_OFFTOPIC_KEYWORDS = [
  "capital do brasil",
  "futebol",
  "nba",
  "criptomoeda",
  "bitcoin",
  "política",
  "politica",
  "eleição",
  "eleicao",
  "horóscopo",
  "horoscopo",
  "novela",
  "filme",
  "série",
  "serie",
  "receita de bolo",
];

// LISTA DE TERMOS ODONTOLÓGICOS
const ODONTOLOGY_KEYWORDS = [
  "dente", "dentes", "gengiva", "periodontia", "periodontite", 
  "cárie", "carie", "obturação", "obturacao", "restauração", "restauracao",
  "canal", "endodontia", "polpa", "pulpite", "necrose",
  "extração", "extracao", "exodontia", "cirurgia", "implante", 
  "prótese", "protes", "coroa", "ponte", "faceta", "clareamento",
  "raspagem", "alisamento", "gengivite", "abscesso", "resina", "amálgama", "amalgama",
  "anestesia", "articaína", "lidocaína", "odontologia", "saúde bucal", "saude bucal"
];

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isOdontologyQuestion(pergunta: string): boolean {
  const normalized = normalizeText(pergunta);
  return ODONTOLOGY_KEYWORDS.some(termo => normalized.includes(normalizeText(termo)));
}

function isObviouslyOutOfContextQuestion(pergunta: string): boolean {
  // Se tem termo odontológico → NÃO é off-topic (aceita)
  if (isOdontologyQuestion(pergunta)) return false;
  
  // Se não tem termo odontológico, verifica se é off-topic óbvio
  const normalized = normalizeText(pergunta);
  return OBVIOUS_OFFTOPIC_KEYWORDS.some((term) => normalized.includes(normalizeText(term)));
}

function extractTopic(pergunta: string): string {
  const cleaned = pergunta
    .replace(/[?!.]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 4)
    .join(" ");
  return cleaned || "esse assunto";
}

function getOffTopicResponse(pergunta: string): string {
  const topic = extractTopic(pergunta);
  if (Math.random() > 0.5) {
    return `🦷 ${DENTIN_NAME}: Olha, eu sou especialista em dentes, não em ${topic}! 😅 Que tal me perguntar sobre periodontia, cáries ou canal radicular? 🦷✨`;
  }
  return FRIENDLY_MESSAGES.offTopic;
}

function looksLikeOutOfScopeResponse(response: string): boolean {
  const normalized = normalizeText(response);
  const outOfScopeSignals = [
    "nao posso responder",
    "nao tenho como ajudar",
    "fora do meu escopo",
    "nao e odontologia",
    "nao sou especialista nesse assunto",
    "nao sei sobre esse assunto",
    "foge da area odontologica",
  ];

  return outOfScopeSignals.some((signal) => normalized.includes(signal));
}

function getDentinPersonaPrompt(systemPrompt: string): string {
  return `${systemPrompt}

Você é o ${DENTIN_NAME} 🦷, um assistente odontológico engraçado, educado e didático.
- Fale sempre em português do Brasil.
- Seja acolhedor e use emojis com naturalidade.
- Responda normalmente conteúdos de odontologia e saúde bucal.
- Se a pergunta não for de odontologia, responda de forma breve, educada e bem-humorada dizendo que seu foco é saúde bucal.
- Você pode responder perguntas pessoais sobre você com bom humor e educação.
- Nunca exponha erros técnicos, códigos HTTP ou detalhes internos de API.`;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  onProgress?: ProgressCallback,
  maxRetries = 3,
  baseDelay = 2000
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!is503Error(error) || retries >= maxRetries) {
        throw error;
      }

      onProgress?.(RETRY_PROGRESS_MESSAGE);
      const delay = baseDelay * 2 ** retries; // 2s, 4s, 8s
      retries += 1;
      await sleep(delay);
    }
  }
}

async function generateContentOnceAcrossModels(prompt: string): Promise<string> {
  let lastError: unknown;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = getModel(modelName);
      const result = await withTimeout(model.generateContent(prompt), REQUEST_TIMEOUT_MS);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      lastError = error;
      if (is503Error(error)) continue;
      throw error;
    }
  }

  if (is503Error(lastError)) {
    throw new Error("503_ALL_MODELS_BUSY");
  }

  throw lastError instanceof Error ? lastError : new Error("Falha ao gerar conteudo com a IA.");
}

function stripCodeFence(text: string): string {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
}

export const aiService = {
  async sendChatMessage(
    messages: ChatMessage[],
    systemPrompt: string,
    onProgress?: ProgressCallback
  ): Promise<string> {
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")?.content ?? "";

    if (isObviouslyOutOfContextQuestion(lastUserMessage)) {
      return getOffTopicResponse(lastUserMessage);
    }

    const history = messages
      .map((msg) => `${msg.role === "user" ? "Usuario" : "Assistente"}: ${msg.content}`)
      .join("\n");

    const prompt = `${getDentinPersonaPrompt(systemPrompt)}

Historico da conversa:
${history}

Responda apenas a ultima mensagem do usuario, de forma objetiva, didatica e com tom humano.`;

    try {
      const aiResponse = await retryWithBackoff(
        () => generateContentOnceAcrossModels(prompt),
        onProgress
      );
      if (looksLikeOutOfScopeResponse(aiResponse)) {
        return getOffTopicResponse(lastUserMessage);
      }
      return aiResponse;
    } catch (error) {
      if (is503Error(error)) {
        return RETRY_EXHAUSTED_MESSAGE;
      }
      return getFriendlyErrorMessage(error instanceof Error ? error : new Error("UNKNOWN_ERROR"));
    }
  },

  async generateQuizQuestion(topic: string): Promise<QuizQuestion> {
    const prompt = `Gere exatamente 1 pergunta de multipla escolha sobre odontologia no tema "${topic}".
Retorne SOMENTE um JSON valido com este formato:
{
  "pergunta": "texto da pergunta",
  "opcoes": ["opcao 1", "opcao 2", "opcao 3", "opcao 4"],
  "correta": 0,
  "explicacao": "explicacao curta"
}
Regras:
- "correta" deve ser um indice de 0 a 3.
- "opcoes" deve ter exatamente 4 itens.
- Nao inclua markdown, comentarios ou texto fora do JSON.`;

    try {
      const raw = stripCodeFence(await retryWithBackoff(() => generateContentOnceAcrossModels(prompt)));
      const parsed = JSON.parse(raw) as QuizQuestion;

      if (
        !parsed ||
        typeof parsed.pergunta !== "string" ||
        !Array.isArray(parsed.opcoes) ||
        parsed.opcoes.length !== 4 ||
        typeof parsed.correta !== "number" ||
        parsed.correta < 0 ||
        parsed.correta > 3 ||
        typeof parsed.explicacao !== "string"
      ) {
        throw new Error("INVALID_QUIZ_FORMAT");
      }

      return parsed;
    } catch {
      throw new Error(FRIENDLY_MESSAGES.generic);
    }
  },
};