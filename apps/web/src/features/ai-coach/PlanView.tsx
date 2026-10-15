import type { Plan, PlanSession } from "./types";

function Cardio({ s }: { s: PlanSession }) {
  const c = s.cardio;
  return (
    <li className="cardio">
      <strong>Cardio: {c.nombre}</strong>
      <span className="muted"> {c.minutos} min · {c.intensidad} · {c.momento === "antes" ? "antes de las pesas" : "al terminar las pesas"}</span>
    </li>
  );
}

export function PlanView({ plan }: { plan: Plan }) {
  return (
    <div className="stack">
      <div>
        <h2>{plan.nombre}</h2>
        <p className="muted">
          {plan.objetivo} · {plan.sesiones.length} días por semana · {plan.semanas} semanas
        </p>
      </div>
      <p>{plan.resumen}</p>

      {plan.conservador && (
        <div className="notice">
          Este plan es conservador: menos series y esfuerzo moderado. Consulta a un profesional de la salud antes de empezar si tienes alguna condición o molestia.
        </div>
      )}
      {plan.validacion.length > 0 && (
        <div className="notice">
          <strong>Ajustes automáticos</strong>
          <ul className="list">{plan.validacion.map((v, i) => <li key={i}>{v}</li>)}</ul>
        </div>
      )}

      {plan.sesiones.map((s) => (
        <section className="session" key={s.dia}>
          <h2>{s.dia}{s.enfoque ? ` · ${s.enfoque}` : ""}</h2>
          <p className="muted">Unos {s.duracionMin} minutos</p>
          <ol className="list">
            {s.cardio.momento === "antes" && <Cardio s={s} />}
            {s.ejercicios.map((e) => (
              <li key={e.ejercicioId}>
                <strong>{e.nombre}</strong>
                <span className="muted"> {e.series} × {e.repeticiones} · descanso {e.descansoSeg} s · esfuerzo {e.esfuerzo}/10 · {e.equipo}</span>
                {e.nota && <div className="muted">{e.nota}</div>}
              </li>
            ))}
            {s.cardio.momento !== "antes" && <Cardio s={s} />}
          </ol>
        </section>
      ))}

      {plan.progresion && (
        <div>
          <h2>Cómo progresar</h2>
          <p>{plan.progresion}</p>
        </div>
      )}
      {plan.notas.length > 0 && (
        <div>
          <h2>Notas</h2>
          <ul className="list">{plan.notas.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}
      <p className="muted">Los ejercicios salen de un catálogo general de gimnasio de cadena. Confirma en tu sede que tengas cada equipo.</p>
    </div>
  );
}
