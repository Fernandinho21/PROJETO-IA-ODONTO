import { useState } from "react";
import ChatPage from "../Chat/ChatPage";
import QuizPage from "../Quiz/QuizPage";
import { type User } from "../../services";
import styles from "./MainAppPage.module.css";

interface MainAppPageProps {
  user: User;
  onLogout: () => void;
}

export default function MainAppPage({ user, onLogout }: MainAppPageProps) {
  const [tab, setTab] = useState<"chat" | "quiz">("chat");

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>🦷</span>
          <span className={styles.logoName}>OdontoIA</span>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${tab === "chat" ? styles.navActive : ""}`}
            onClick={() => setTab("chat")}
          >
            💬 Chat IA
          </button>
          <button
            className={`${styles.navBtn} ${tab === "quiz" ? styles.navActive : ""}`}
            onClick={() => setTab("quiz")}
          >
            📝 Quiz
          </button>
        </nav>
        <div className={styles.userArea}>
          <span className={styles.userName}>Olá, {user.name}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {tab === "chat" ? <ChatPage userName={user.name} /> : <QuizPage />}
      </main>
    </div>
  );
}
