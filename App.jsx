import { useState } from "react";
import Login from "./components/Login";
import MainApp from "./components/MainApp";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);

  return user ? (
    <MainApp user={user} onLogout={() => setUser(null)} />
  ) : (
    <Login onLogin={setUser} />
  );
}
