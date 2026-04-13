import React, { useState } from 'react';

interface AuthFormProps {
  onAuth: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleToggle = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement auth logic
    onAuth();
  };

  return (
    <div className="auth">
      <h2>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</h2>
      <p>{mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>
      <button type="button" onClick={handleToggle} className="toggle-btn">
        {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
      </button>
    </div>
  );
};

export default AuthForm;