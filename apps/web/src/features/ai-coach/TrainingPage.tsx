import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { usePlans } from "./data";
import { PlanView } from "./PlanView";

export function TrainingPage() {
  const { user } = useAuth();
  const { plans, loading } = usePlans(user!.uid);
  const active = plans.find((p) => p.status === "activo");

  return (
    <div className="stack">
      <h1>Entrenamiento</h1>
      {loading ? (
        <section className="card"><p className="muted">Cargando…</p></section>
      ) : !active ? (
        <section className="card stack">
          <p className="muted">Aún no tienes un plan activo. Genera una propuesta con el asistente y apruébala para verla aquí.</p>
          <div><Link className="btn primary" to="/asistente">Ir al Asistente IA</Link></div>
        </section>
      ) : (
        <section className="card">
          <p className="muted">Plan activo · versión {active.version}</p>
          <PlanView plan={active.content} />
        </section>
      )}
    </div>
  );
}
