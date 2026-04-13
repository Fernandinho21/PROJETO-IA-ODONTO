import { useState } from "react";
import LoginPage from "./pages/Login/LoginPage";
import MainAppPage from "./pages/MainApp/MainAppPage";
import { type User } from "./services";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return user ? (
    <MainAppPage user={user} onLogout={() => setUser(null)} />
  ) : (
    <LoginPage onLogin={setUser} />
  );
}