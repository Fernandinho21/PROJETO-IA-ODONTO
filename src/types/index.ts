// Tipos centralizados do projeto

// Autenticação
export interface User {
  email: string;
  name: string;
}

export interface StoredUser {
  password: string;
  name: string;
}

// Chat
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Quiz
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizScore {
  total: number;
  correct: number;
  percentage: number;
  topic?: string;
}

// Resposta de IA
export interface AIResponse {
  success: boolean;
  message: string;
  data?: unknown;
}
