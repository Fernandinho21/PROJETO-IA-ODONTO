import { useState } from "react";
import styles from "./Login.module.css";

const USERS_KEY = "odonto_users";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
  catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function validatePassword(pwd) {
  const errors = [];
  if (pwd.length < 6) errors.push("Mínimo 6 caracteres");
  if (!/[A-Z]/.test(pwd)) errors.push("Uma letra maiúscula");
  if (!/[a-z]/.test(pwd)) errors.push("Uma letra minúscula");
  if (!/\*/.test(pwd)) errors.push("Um asterisco (*)");
  return errors;
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pwdErrors = validatePassword(password);
  const pwdValid = pwdErrors.length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) { setError("Informe seu email."); return; }

    if (mode === "register") {
      if (!pwdValid) { setError("A senha não atende aos requisitos."); return; }
      const users = getUsers();
      if (users[email]) { setError("Este email já está cadastrado."); return; }
      users[email] = { password, name: email.split("@")[0] };
      saveUsers(users);
      setSuccess("Conta criada! Faça login.");
      setMode("login");
      setPassword("");
      return;
    }

    const users = getUsers();
    if (!users[email] || users[email].password !== password) {
      setError("Email ou senha incorretos.");
      return;
    }
    onLogin({ email, name: users[email].name });
  }

  const requirements = [
    { label: "Mínimo 6 caracteres", ok: password.length >= 6 },
    { label: "Letra maiúscula (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "Letra minúscula (a-z)", ok: /[a-z]/.test(password) },
    { label: "Asterisco (*)", ok: /\*/.test(password) },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.tooth}>🦷</span>
          <h1 className={styles.brandName}>OdontoIA</h1>
        </div>
        <p className={styles.tagline}>Estude odontologia com inteligência artificial</p>
        <div className={styles.features}>
          <div className={styles.feat}><span className={styles.featIcon}>💬</span><span>Chat com IA especialista</span></div>
          <div className={styles.feat}><span className={styles.featIcon}>📝</span><span>Quiz gerado por IA</span></div>
          <div className={styles.feat}><span className={styles.featIcon}>🎯</span><span>Temas específicos</span></div>
          <div className={styles.feat}><span className={styles.featIcon}>📊</span><span>Acompanhe seu progresso</span></div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
              Entrar
            </button>
            <button className={`${styles.tab} ${mode === "register" ? styles.tabActive : ""}`} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "register" ? "Ex: Senha*1" : "••••••••"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {mode === "register" && password.length > 0 && (
              <div className={styles.requirements}>
                {requirements.map(req => (
                  <div key={req.label} className={`${styles.req} ${req.ok ? styles.reqOk : styles.reqFail}`}>
                    <span className={styles.reqDot}>{req.ok ? "✓" : "○"}</span>
                    {req.label}
                  </div>
                ))}
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={mode === "register" && password.length > 0 && !pwdValid}
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
