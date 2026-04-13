// Hook customizado para gerenciar quiz

import { useState, useCallback } from "react";
import { aiService } from "../services";

export interface QuizQuestion {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

export interface QuizScore {
  correct: number;
  wrong: number;
}

export function useQuiz() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState<QuizScore>({ correct: 0, wrong: 0 });

  const generateQuestion = useCallback(async (topic: string) => {
    if (loading) return;
    setLoading(true);
    setQuestion(null);
    setSelected(null);
    setError("");

    try {
      const q = await aiService.generateQuizQuestion(topic);
      setQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar pergunta");
    }
    setLoading(false);
  }, [loading]);

  const answerQuestion = useCallback((idx: number) => {
    if (selected !== null || !question) return;
    setSelected(idx);
    if (idx === question.correta) {
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  }, [selected, question]);

  const resetScore = useCallback(() => {
    setScore({ correct: 0, wrong: 0 });
  }, []);

  const accuracy =
    score.correct + score.wrong > 0
      ? Math.round((score.correct / (score.correct + score.wrong)) * 100)
      : null;

  return {
    question,
    selected,
    loading,
    error,
    score,
    accuracy,
    generateQuestion,
    answerQuestion,
    resetScore,
  };
}
