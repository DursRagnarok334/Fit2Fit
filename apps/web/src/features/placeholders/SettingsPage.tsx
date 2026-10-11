import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  return (
    <div className="stack">
      <h1>Configuración</h1>
      <section className="card stack">
        <h2>Apariencia</h2>
        <div className="seg" role="group" aria-label="Tema">
          <button className={theme === "dark" ? "on" : ""} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Noche</button>
          <button className={theme === "light" ? "on" : ""} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Día</button>
        </div>
      </section>
      <section className="card stack">
        <h2>Cuenta</h2>
        <p className="muted">{user?.email}</p>
        <div><button className="btn" onClick={signOut}>Cerrar sesión</button></div>
      </section>
    </div>
  );
}
