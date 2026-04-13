import { useState } from "react";
import Chat from "./Chat";
import Quiz from "./Quiz";
import styles from "./MainApp.module.css";

export default function MainApp({ user, onLogout }) {
  const [tab, setTab] = useState("chat");

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>🦷</span>
          <span className={styles.logoName}>OdontoIA</span>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.navBtn} ${tab === "chat" ? styles.navActive : ""}`} onClick={() => setTab("chat")}>
            💬 Chat IA
          </button>
          <button className={`${styles.navBtn} ${tab === "quiz" ? styles.navActive : ""}`} onClick={() => setTab("quiz")}>
            📝 Quiz
          </button>
        </nav>
        <div className={styles.userArea}>
          <span className={styles.userName}>Olá, {user.name}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        {tab === "chat" ? <Chat user={user} /> : <Quiz />}
      </main>
    </div>
  );
}
