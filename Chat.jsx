import { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";

const SYSTEM_PROMPT = `Você é um especialista em odontologia que ajuda estudantes universitários a estudar e tirar dúvidas. 
Responda APENAS perguntas relacionadas à odontologia: anatomia dental, histologia, periodontia, endodontia, dentística, prótese, cirurgia oral, ortodontia, materiais dentários, microbiologia oral, radiologia odontológica, etc.
Se a pergunta não for sobre odontologia, redirecione educadamente para tópicos odontológicos.
Seja claro, didático e conciso. Use exemplos clínicos quando relevante. Responda sempre em português.`;

export default function Chat({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Olá, ${user.name}! Sou sua IA especialista em odontologia. Pode me perguntar sobre anatomia dental, periodontia, endodontia, materiais, procedimentos clínicos e muito mais. Como posso ajudar?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "Não consegui responder, tente novamente.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar. Verifique sua conexão e tente novamente." }]);
    }
    setLoading(false);
  }

  const suggestions = ["O que é periodontite?", "Explique o canal radicular", "Quais são os tipos de cárie?", "Diferença entre amálgama e resina"];

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${msg.role === "user" ? styles.user : styles.ai}`}>
            {msg.role === "assistant" && <div className={styles.aiLabel}>🦷 OdontoIA</div>}
            <div className={styles.bubble}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.msg} ${styles.ai}`}>
            <div className={styles.aiLabel}>🦷 OdontoIA</div>
            <div className={`${styles.bubble} ${styles.loading}`}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className={styles.suggestions}>
          {suggestions.map(s => (
            <button key={s} className={styles.suggestion} onClick={() => { setInput(s); }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Pergunte sobre odontologia..."
          disabled={loading}
        />
        <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim() || loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
