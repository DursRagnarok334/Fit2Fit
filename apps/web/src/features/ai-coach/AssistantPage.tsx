import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { aiConfigured, AiError, callAi } from "../../lib/ai";
import { useAuth } from "../auth/AuthContext";
import { useMeasurements, useProfile } from "../profile/data";
import {
  approvePlan, saveInterview, saveProposal, setPlanStatus,
  useLatestDiagnosis, useLatestInterview, usePlans,
} from "./data";
import { PlanView } from "./PlanView";
import type { Answer, Diagnosis, Plan } from "./types";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2>{title}</h2>
      <ul className="list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

const errMsg = (e: unknown, fallback: string) => (e instanceof AiError ? e.message : fallback);

export function AssistantPage() {
  const { user } = useAuth();
  const uid = user!.uid;
  const { profile } = useProfile(uid);
  const { items: measurements } = useMeasurements(uid);
  const saved = useLatestDiagnosis(uid);
  const interview = useLatestInterview(uid);
  const { plans } = usePlans(uid);

  const [busy, setBusy] = useState<"diagnosis" | "plan" | "answers" | "approve" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const d = saved?.data;
  const ready = Boolean(profile.age && profile.heightCm && measurements.length > 0);
  const interviewForThis = interview && saved && interview.diagnosisId === saved.id ? interview : null;
  const proposal = plans.find((p) => p.status === "propuesta");
  const active = plans.find((p) => p.status === "activo");
  const filled = d ? d.preguntas.filter((q) => (answers[q.id] ?? "").trim()).length : 0;

  // Rellena el formulario con las respuestas ya guardadas para este diagnóstico.
  useEffect(() => {
    const next: Record<string, string> = {};
    interviewForThis?.answers.forEach((a) => { next[a.id] = a.respuesta; });
    setAnswers(next);
  }, [interviewForThis?.id, saved?.id]);

  const generateDiagnosis = async () => {
    if (!db) return;
    setBusy("diagnosis"); setError(null); setNotice(null);
    try {
      const data = await callAi<Diagnosis>("diagnosis", {
        profile: { age: profile.age, heightCm: profile.heightCm, strengths: profile.strengths, freeText: profile.freeText },
        measurements: measurements.slice(0, 6),
      });
      await addDoc(collection(db, "users", uid, "diagnoses"), { data, createdAt: serverTimestamp() });
    } catch (e) {
      setError(errMsg(e, "No se pudo generar el diagnóstico."));
    } finally {
      setBusy(null);
    }
  };

  const saveAnswers = async () => {
    if (!d || !saved) return;
    setBusy("answers"); setError(null); setNotice(null);
    try {
      const list: Answer[] = d.preguntas
        .filter((q) => (answers[q.id] ?? "").trim())
        .map((q) => ({ id: q.id, pregunta: q.pregunta, respuesta: answers[q.id].trim().slice(0, 1000) }));
      await saveInterview(uid, saved.id, list);
      setNotice("Respuestas guardadas.");
    } catch {
      setError("No se pudieron guardar las respuestas.");
    } finally {
      setBusy(null);
    }
  };

  const generatePlan = async () => {
    if (!d || !saved || !interviewForThis) return;
    setBusy("plan"); setError(null); setNotice(null);
    try {
      const plan = await callAi<Plan>("plan_training", {
        profile: { age: profile.age, heightCm: profile.heightCm, strengths: profile.strengths, freeText: profile.freeText },
        measurements: measurements.slice(0, 3),
        diagnosis: { resumen: d.resumen, prioridades: d.prioridades, alertas: d.alertas, datosFaltantes: d.datosFaltantes },
        answers: interviewForThis.answers.map((a) => ({ pregunta: a.pregunta, respuesta: a.respuesta })),
      });
      if (proposal) await setPlanStatus(uid, proposal.id, "rechazada");
      await saveProposal(uid, plan, saved.id, plans.length + 1);
    } catch (e) {
      setError(errMsg(e, "No se pudo generar el plan."));
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    if (!proposal) return;
    setBusy("approve"); setError(null);
    try {
      await approvePlan(uid, plans, proposal.id);
      setNotice("Plan aprobado. Ya aparece en Entrenamiento.");
    } catch {
      setError("No se pudo aprobar el plan.");
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (!proposal) return;
    try {
      await setPlanStatus(uid, proposal.id, "rechazada");
      setNotice("Propuesta descartada. Puedes generar otra.");
    } catch {
      setError("No se pudo descartar la propuesta.");
    }
  };

  if (!aiConfigured) {
    return (
      <div className="stack">
        <h1>Asistente IA</h1>
        <section className="card">
          <p className="muted">Falta conectar el Worker. Define <code>VITE_AI_WORKER_URL</code> y vuelve a compilar.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Asistente IA</h1>

      <section className="card stack">
        <h2>1. Diagnóstico previo</h2>
        <p className="muted">
          El asistente analiza tu edad, estatura, medidas y lo que escribiste en tu perfil. No es un diagnóstico médico ni reemplaza a un profesional.
        </p>
        {!ready && (
          <p className="muted">
            Antes necesitas guardar tu edad, tu estatura y al menos una medida. <Link className="link" to="/perfil">Ir a Mi perfil</Link>
          </p>
        )}
        <div className="row">
          <button className="btn primary" onClick={generateDiagnosis} disabled={!ready || busy !== null}>
            {busy === "diagnosis" ? "Analizando…" : d ? "Generar uno nuevo" : "Generar diagnóstico"}
          </button>
        </div>
      </section>

      {d && (
        <section className="card stack">
          {saved?.createdAt && <p className="muted">Generado el {saved.createdAt.toDate().toLocaleDateString("es-CO")}</p>}
          <p>{d.resumen}</p>
          {d.alertas.length > 0 && (
            <div className="notice">
              <h2>Ten en cuenta</h2>
              <ul className="list">{d.alertas.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
          <List title="Punto de partida" items={d.puntoDePartida} />
          <List title="Prioridades" items={d.prioridades} />
          <List title="Datos que faltan" items={d.datosFaltantes} />
        </section>
      )}

      {d && (
        <section className="card stack">
          <h2>2. Tus respuestas</h2>
          <p className="muted">Responde con calma; entre más detalle, más personalizado será tu plan. Puedes dejar en blanco lo que no quieras contestar.</p>
          {d.preguntas.map((q, i) => (
            <label key={q.id}>
              {i + 1}. {q.pregunta}
              <span className="hint">{q.motivo}</span>
              <textarea
                rows={2}
                maxLength={1000}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              />
            </label>
          ))}
          <div className="row">
            <button className="btn primary" onClick={saveAnswers} disabled={filled < 3 || busy !== null}>
              {busy === "answers" ? "Guardando…" : "Guardar respuestas"}
            </button>
            {filled < 3 && <span className="muted">Responde al menos 3 preguntas.</span>}
          </div>
        </section>
      )}

      {interviewForThis && (
        <section className="card stack">
          <h2>3. Plan de entrenamiento</h2>
          <p className="muted">
            El asistente propone y tú decides: nada cambia en tu plan activo hasta que lo apruebes.
            {active && " Si apruebas una propuesta nueva, el plan actual se archiva."}
          </p>
          <div className="row">
            <button className="btn primary" onClick={generatePlan} disabled={busy !== null}>
              {busy === "plan" ? "Diseñando tu plan… puede tardar un momento" : proposal ? "Generar otra propuesta" : "Generar propuesta de plan"}
            </button>
          </div>
        </section>
      )}

      {proposal && (
        <section className="card stack">
          <p className="muted">Propuesta pendiente de tu aprobación (versión {proposal.version})</p>
          <PlanView plan={proposal.content} />
          <div className="row">
            <button className="btn primary" onClick={approve} disabled={busy !== null}>Aprobar plan</button>
            <button className="btn" onClick={reject} disabled={busy !== null}>Descartar</button>
          </div>
        </section>
      )}

      {(error || notice) && (
        <p className={error ? "error" : "muted"} role={error ? "alert" : "status"}>{error ?? notice}</p>
      )}
    </div>
  );
}
