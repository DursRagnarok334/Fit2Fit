import { Navigate, Route, Routes } from "react-router-dom";
import { isConfigured } from "../lib/firebase";
import { useAuth } from "../features/auth/AuthContext";
import { Shell } from "../components/layout/Shell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { AssistantPage } from "../features/ai-coach/AssistantPage";
import { ComingSoon } from "../features/placeholders/ComingSoon";
import { SettingsPage } from "../features/placeholders/SettingsPage";

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="centered"><div className="card stack narrow">{children}</div></div>;
}

function SetupNotice() {
  return (
    <Centered>
      <h1>Falta conectar Firebase</h1>
      <p className="muted">Copia <code>.env.example</code> a <code>apps/web/.env.local</code> y completa los valores de tu app web de Firebase. Luego reinicia el servidor.</p>
    </Centered>
  );
}

function Login() {
  const { signIn, error } = useAuth();
  return (
    <Centered>
      <h1>Fit2Fit</h1>
      <p className="muted">Tus metas. Tu progreso.</p>
      <button className="btn primary" onClick={signIn}>Entrar con Google</button>
      {error && <p className="error" role="alert">{error}</p>}
    </Centered>
  );
}

export function App() {
  const { user, loading } = useAuth();
  if (!isConfigured) return <SetupNotice />;
  if (loading) return <Centered><p className="muted">Cargando…</p></Centered>;
  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<DashboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="entrenamiento" element={<ComingSoon title="Entrenamiento" text="Tu plan semanal aparecerá aquí cuando el asistente genere y apruebes tu primera propuesta." />} />
        <Route path="nutricion" element={<ComingSoon title="Nutrición" text="El menú, las porciones y la lista de mercado llegan después del plan de entrenamiento." />} />
        <Route path="evolucion" element={<ComingSoon title="Evolución" text="Las gráficas de peso y medidas se activan con la siguiente fase." />} />
        <Route path="asistente" element={<AssistantPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
