// Serviço de autenticação com localStorage

export interface User {
  email: string;
  name: string;
}

export interface StoredUser {
  password: string;
  name: string;
}

const USERS_KEY = "odonto_users";

export const authService = {
  getUsers(): Record<string, StoredUser> {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : {};
    } catch {
      return {};
    }
  },

  saveUsers(users: Record<string, StoredUser>): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  validatePassword(pwd: string): string[] {
    const errors: string[] = [];
    if (pwd.length < 6) errors.push("Mínimo 6 caracteres");
    if (!/[A-Z]/.test(pwd)) errors.push("Uma letra maiúscula");
    if (!/[a-z]/.test(pwd)) errors.push("Uma letra minúscula");
    if (!/\*/.test(pwd)) errors.push("Um asterisco (*)");
    return errors;
  },

  register(
    email: string,
    password: string
  ): { success: boolean; message: string } {
    if (!email.trim()) {
      return { success: false, message: "Informe seu email." };
    }

    const pwdErrors = this.validatePassword(password);
    if (pwdErrors.length > 0) {
      return { success: false, message: "A senha não atende aos requisitos." };
    }

    const users = this.getUsers();
    if (users[email]) {
      return { success: false, message: "Este email já está cadastrado." };
    }

    users[email] = { password, name: email.split("@")[0] };
    this.saveUsers(users);

    return { success: true, message: "Conta criada! Faça login." };
  },

  login(email: string, password: string): { user: User | null; message: string } {
    if (!email.trim()) {
      return { user: null, message: "Informe seu email." };
    }

    const users = this.getUsers();
    if (!users[email] || users[email].password !== password) {
      return { user: null, message: "Email ou senha incorretos." };
    }

    return {
      user: { email, name: users[email].name },
      message: "Login realizado com sucesso!",
    };
  },
};
