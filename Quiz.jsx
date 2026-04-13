import { useState } from "react";
import styles from "./Quiz.module.css";

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

export default function Quiz() {
  const [topic, setTopic] = useState("geral");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  async function generateQuestion() {
    if (loading) return;
    setLoading(true);
    setQuestion(null);
    setSelected(null);
    setError("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Você gera questões de múltipla escolha sobre odontologia para estudantes universitários.
Responda APENAS com JSON válido, sem texto extra, sem blocos de código.
Formato: {"pergunta":"...","opcoes":["A) ...","B) ...","C) ...","D) ..."],"correta":0,"explicacao":"..."}
O campo "correta" é o índice (0-3) da opção correta.`,
          messages: [{ role: "user", content: `Gere uma questão de múltipla escolha de nível universitário sobre ${topic} em odontologia.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const q = JSON.parse(clean);
      setQuestion(q);
    } catch {
      setError("Erro ao gerar pergunta. Tente novamente.");
    }
    setLoading(false);
  }

  function answer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.correta) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  }

  const total = score.correct + score.wrong;
  const pct = total > 0 ? Math.round((score.correct / total) * 100) : null;

  return (
    <div className={styles.container}>
      <div className={styles.scoreBar}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreNum} style={{ color: "var(--accent)" }}>{score.correct}</span>
          <span className={styles.scoreLbl}>Corretas</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreNum} style={{ color: "var(--error)" }}>{score.wrong}</span>
          <span className={styles.scoreLbl}>Erradas</span>
        </div>
        <div className={styles.scoreItem}>
          <span className={styles.scoreNum}>{pct !== null ? `${pct}%` : "—"}</span>
          <span className={styles.scoreLbl}>Aproveitamento</span>
        </div>
      </div>

      <div className={styles.topicRow}>
        {TOPICS.map(t => (
          <button
            key={t.id}
            className={`${styles.topicBtn} ${topic === t.id ? styles.topicActive : ""}`}
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

      {error && <div className={styles.error}>{error}</div>}

      {question && !loading && (
        <div className={styles.questionCard}>
          <p className={styles.questionText}>{question.pergunta}</p>
          <div className={styles.options}>
            {question.opcoes.map((op, i) => {
              let cls = styles.option;
              if (selected !== null) {
                if (i === question.correta) cls = `${styles.option} ${styles.correct}`;
                else if (i === selected && i !== question.correta) cls = `${styles.option} ${styles.wrong}`;
                else cls = `${styles.option} ${styles.dim}`;
              }
              return (
                <button key={i} className={cls} onClick={() => answer(i)} disabled={selected !== null}>
                  {op}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className={`${styles.explanation} ${selected === question.correta ? styles.expCorrect : styles.expWrong}`}>
              <strong>{selected === question.correta ? "✓ Correto!" : "✗ Incorreto."}</strong> {question.explicacao}
            </div>
          )}
        </div>
      )}

      {!question && !loading && !error && (
        <div className={styles.empty}>
          Selecione um tema e clique em <strong>Nova pergunta</strong> para começar!
        </div>
      )}

      <button className={styles.nextBtn} onClick={generateQuestion} disabled={loading}>
        {loading ? "Gerando..." : "Nova pergunta"}
      </button>
    </div>
  );
}
