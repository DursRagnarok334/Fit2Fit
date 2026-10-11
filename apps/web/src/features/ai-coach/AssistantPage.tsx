import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { aiConfigured, AiError, callAi } from "../../lib/ai";
import { useAuth } from "../auth/AuthContext";
import { useMeasurements, useProfile } from "../profile/data";
import type { Diagnosis } from "./types";

type Saved = { id: string; createdAt?: { toDate: () => Date }; data: Diagnosis };

function useLatestDiagnosis(uid: string) {
  const [saved, setSaved] = useState<Saved | null>(null);
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users", uid, "diagnoses"), orderBy("createdAt", "desc"), limit(1));
    return onSnapshot(q, (snap) => {
      const d = snap.docs[0];
      setSaved(d ? ({ id: d.id, ...(d.data() as Omit<Saved, "id">) }) : null);
    });
  }, [uid]);
  return saved;
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2>{title}</h2>
      <ul className="list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

export function AssistantPage() {
  const { user } = useAuth();
  const uid = user!.uid;
  const { profile } = useProfile(uid);
  const { items: measurements } = useMeasurements(uid);
  const saved = useLatestDiagnosis(uid);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(profile.age && profile.heightCm && measurements.length > 0);

  const generate = async () => {
    if (!db) return;
    setBusy(true);
    setError(null);
    try {
      const data = await callAi<Diagnosis>("diagnosis", {
        profile: { age: profile.age, heightCm: profile.heightCm, strengths: profile.strengths, freeText: profile.freeText },
        measurements: measurements.slice(0, 6),
      });
      await addDoc(collection(db, "users", uid, "diagnoses"), { data, createdAt: serverTimestamp() });
    } catch (e) {
      setError(e instanceof AiError ? e.message : "No se pudo generar el diagnóstico.");
    } finally {
      setBusy(false);
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

  const d = saved?.data;

  return (
    <div className="stack">
      <h1>Asistente IA</h1>

      <section className="card stack">
        <h2>Diagnóstico previo</h2>
        <p className="muted">
          El asistente analiza tu edad, estatura, medidas y lo que escribiste en tu perfil. No es un diagnóstico médico ni reemplaza a un profesional.
        </p>
        {!ready && (
          <p className="muted">
            Antes necesitas guardar tu edad, tu estatura y al menos una medida. <Link className="link" to="/perfil">Ir a Mi perfil</Link>
          </p>
        )}
        <div className="row">
          <button className="btn primary" onClick={generate} disabled={!ready || busy}>
            {busy ? "Analizando…" : d ? "Generar uno nuevo" : "Generar diagnóstico"}
          </button>
          {error && <span className="error" role="alert">{error}</span>}
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
          <div>
            <h2>Preguntas del asistente</h2>
            <ol className="list">
              {d.preguntas.map((q) => (
                <li key={q.id}>
                  {q.pregunta}
                  <span className="muted"> {q.motivo}</span>
                </li>
              ))}
            </ol>
            <p className="muted">Responder estas preguntas para generar tu plan es el siguiente paso.</p>
          </div>
        </section>
      )}
    </div>
  );
}
