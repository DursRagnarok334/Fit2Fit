import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useTheme } from "../../features/theme/ThemeContext";

const NAV = [
  { to: "/", label: "Inicio", end: true },
  { to: "/entrenamiento", label: "Entrenamiento" },
  { to: "/nutricion", label: "Nutrición" },
  { to: "/evolucion", label: "Evolución" },
  { to: "/asistente", label: "Asistente IA" },
];

function Logo() {
  return (
    <span className="logo" aria-label="Fit2Fit">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="24" cy="32" r="12" fill="none" stroke="var(--accent)" strokeWidth="6" />
        <circle cx="40" cy="32" r="12" fill="none" stroke="var(--accent)" strokeWidth="6" opacity=".55" />
      </svg>
      Fit2Fit
    </span>
  );
}

export function Shell() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const initial = (user?.displayName ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="shell">
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <button className="icon" aria-label={theme === "dark" ? "Cambiar a modo día" : "Cambiar a modo noche"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <NavLink to="/perfil" className="avatar" aria-label="Mi perfil">{initial}</NavLink>
          <NavLink to="/configuracion" className="icon" aria-label="Configuración">⚙</NavLink>
        </div>
      </header>

      <nav className="nav" aria-label="Principal">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
