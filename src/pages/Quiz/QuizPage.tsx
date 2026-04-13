import { useState, useEffect } from "react";
import { useQuiz } from "../../hooks";
import styles from "./QuizPage.module.css";

const TOPICS = [
  { id: "geral", label: "Geral" },
  { id: "periodontia", label: "Periodontia" },
  { id: "endodontia", label: "Endodontia" },
  { id: "dentística", label: "Dentística" },
  { id: "anatomia dental", label: "Anatomia" },
  { id: "materiais dentários", label: "Materiais" },
  { id: "cirurgia oral", label: "Cirurgia" },
  { id: "ortodontia", label: "Ortodontia" },
];

export default function QuizPage() {
  const {
    question,
    selected,
    loading,
    error,
    score,
    accuracy,
    generateQuestion,
    answerQuestion,
  } = useQuiz();

  const [topic, setTopic] = useState("geral");

  useEffect(() => {
    generateQuestion(topic);
  }, [topic, generateQuestion]);

  return (
    <div className={styles.container}>
      <div className={styles.scoreBar}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreNum} style={{ color: "var(--accent)" }}>
            {score.correct}
          </span>
          <span className={styles.scoreLbl}>Corretas</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreNum} style={{ color: "var(--error)" }}>
            {score.wrong}
          </span>
          <span className={styles.scoreLbl}>Erradas</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreNum}>
            {accuracy !== null ? `${accuracy}%` : "—"}
          </span>
          <span className={styles.scoreLbl}>Aproveitamento</span>
        </div>
      </div>

      <div className={styles.topicRow}>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            className={`${styles.topicBtn} ${
              topic === t.id ? styles.topicActive : ""
            }`}
            onClick={() => setTopic(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          Gerando pergunta sobre {topic}...
        </div>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {question && !loading && (
        <div className={styles.questionBox}>
          <h2 className={styles.question}>{question.pergunta}</h2>
          <div className={styles.options}>
            {question.opcoes.map((opt, idx) => (
              <button
                key={idx}
                className={`${styles.option} ${
                  selected === idx
                    ? idx === question.correta
                      ? styles.optionCorrect
                      : styles.optionWrong
                    : ""
                } ${selected !== null ? styles.optionDisabled : ""}`}
                onClick={() => answerQuestion(idx)}
                disabled={selected !== null}
              >
                {opt}
              </button>
            ))}
          </div>

          {selected !== null && (
            <div className={styles.explanation}>
              <h3>Explicação:</h3>
              <p>{question.explicacao}</p>
              <button
                className={styles.nextBtn}
                onClick={() => generateQuestion(topic)}
              >
                Próxima Questão
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && !question && (
        <button
          className={styles.startBtn}
          onClick={() => generateQuestion(topic)}
        >
          Começar Quiz
        </button>
      )}
    </div>
  );
}
