import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMeasurements, useProfile } from "../profile/data";

export function DashboardPage() {
  const { user } = useAuth();
  const { items } = useMeasurements(user!.uid);
  const { profile } = useProfile(user!.uid);
  const last = items[0];
  const prev = items[1];
  const delta = last && prev ? Math.round((last.weightKg - prev.weightKg) * 10) / 10 : null;
  const first = user?.displayName?.split(" ")[0];
  const profileDone = Boolean(profile.age && profile.heightCm);

  return (
    <div className="stack">
      <h1>{first ? `Hola, ${first}` : "Hola"}</h1>

      <section className="card hero">
        <p className="muted">Peso actual</p>
        {last ? (
          <>
            <p className="big">{last.weightKg} <span>kg</span></p>
            <p className="muted">
              {delta === null ? `Registrado el ${last.date}` : `${delta > 0 ? "+" : ""}${delta} kg frente al registro anterior`}
            </p>
          </>
        ) : (
          <>
            <p className="big muted">Sin datos</p>
            <Link className="btn primary" to="/perfil">Registrar mi primera medida</Link>
          </>
        )}
      </section>

      <div className="grid2">
        <section className="card">
          <h2>Perfil</h2>
          <p className="muted">{profileDone ? "Tus datos básicos están completos." : "Faltan tu edad y tu estatura."}</p>
          <Link className="btn" to="/perfil">{profileDone ? "Ver perfil" : "Completar perfil"}</Link>
        </section>
        <section className="card">
          <h2>Asistente IA</h2>
          <p className="muted">Disponible cuando termines el registro y se active el backend.</p>
        </section>
      </div>
    </div>
  );
}
