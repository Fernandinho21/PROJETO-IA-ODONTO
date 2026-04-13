import { useState } from "react";
import { authService, type User } from "../../services";
import styles from "./Login.module.css";

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pwdErrors = authService.validatePassword(password);
  const pwdValid = pwdErrors.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      const result = authService.register(email, password);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setSuccess(result.message);
      setMode("login");
      setPassword("");
      return;
    }

    const result = authService.login(email, password);
    if (!result.user) {
      setError(result.message);
      return;
    }
    onLogin(result.user);
  }

  const requirements = [
    { label: "Mínimo 6 caracteres", ok: password.length >= 6 },
    { label: "Letra maiúscula (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "Letra minúscula (a-z)", ok: /[a-z]/.test(password) },
    { label: "Caractere especial (!@#$%&*)", ok: /[!@#$%&*]/.test(password) },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brandBadge}>Plataforma de Estudo Odontologico</div>
        <div className={styles.brand}>
          <span className={styles.tooth}>🦷</span>
          <h1 className={styles.brandName}>OdontoIA</h1>
        </div>
        <p className={styles.tagline}>Estude odontologia com inteligência artificial</p>
        <div className={styles.features}>
          <div className={styles.feat}>
            <span className={styles.featIcon}>💬</span>
            <span>Chat com IA especialista</span>
          </div>
          <div className={styles.feat}>
            <span className={styles.featIcon}>📝</span>
            <span>Quiz gerado por IA</span>
          </div>
          <div className={styles.feat}>
            <span className={styles.featIcon}>🎯</span>
            <span>Temas específicos</span>
          </div>
          <div className={styles.feat}>
            <span className={styles.featIcon}>📊</span>
            <span>Acompanhe seu progresso</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={`${styles.card} ${mode === "register" ? styles.cardRegister : ""}`}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
            >
              Entrar
            </button>
            <button
              className={`${styles.tab} ${mode === "register" ? styles.tabActive : ""}`}
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className={styles.requirements}>
                {requirements.map((req) => (
                  <div
                    key={req.label}
                    className={`${styles.req} ${req.ok ? styles.reqOk : ""}`}
                  >
                    <span className={styles.reqIcon}>{req.ok ? "✓" : "○"}</span>
                    {req.label}
                  </div>
                ))}
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!email.trim() || (mode === "register" && !pwdValid)}
            >
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
