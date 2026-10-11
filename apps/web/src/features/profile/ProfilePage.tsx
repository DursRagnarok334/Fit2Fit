import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  addMeasurement, deleteMeasurement, saveProfile, updateMeasurement, useMeasurements, useProfile,
  type Measurement, type MeasurementInput,
} from "./data";

const today = () => new Date().toLocaleDateString("en-CA");
const num = (s: string) => (s.trim() === "" ? undefined : Number(s.replace(",", ".")));

const FIELDS = [
  ["waistCm", "Cintura"],
  ["hipCm", "Cadera"],
  ["thighCm", "Muslo"],
  ["armCm", "Brazo"],
  ["chestCm", "Pecho"],
  ["calfCm", "Pantorrilla"],
] as const;

type Form = { date: string; weightKg: string } & Record<(typeof FIELDS)[number][0], string>;
const emptyForm = (): Form => ({ date: today(), weightKg: "", waistCm: "", hipCm: "", thighCm: "", armCm: "", chestCm: "", calfCm: "" });

function validate(f: Form): { value?: MeasurementInput; error?: string } {
  const weight = num(f.weightKg);
  if (weight === undefined || Number.isNaN(weight) || weight < 20 || weight > 400)
    return { error: "El peso debe estar entre 20 y 400 kg." };
  if (!f.date || f.date > today()) return { error: "La fecha no puede ser futura." };
  const value: MeasurementInput = { date: f.date, weightKg: weight };
  for (const [key, label] of FIELDS) {
    const n = num(f[key]);
    if (n === undefined) continue;
    if (Number.isNaN(n) || n < 10 || n > 250) return { error: `${label} debe estar entre 10 y 250 cm.` };
    value[key] = n;
  }
  return { value };
}

export function ProfilePage() {
  const { user } = useAuth();
  const uid = user!.uid;
  const { profile, loading: profileLoading } = useProfile(uid);
  const { items, loading, error: listError } = useMeasurements(uid);

  const [p, setP] = useState({ age: "", heightCm: "", strengths: "", freeText: "" });
  const [pMsg, setPMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [mMsg, setMMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setP({
      age: profile.age?.toString() ?? "",
      heightCm: profile.heightCm?.toString() ?? "",
      strengths: profile.strengths ?? "",
      freeText: profile.freeText ?? "",
    });
  }, [profile]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const age = num(p.age);
    const height = num(p.heightCm);
    if ((age !== undefined && (Number.isNaN(age) || age < 14 || age > 100)) ||
        (height !== undefined && (Number.isNaN(height) || height < 100 || height > 230))) {
      setPMsg("Revisa la edad (14 a 100) y la estatura (100 a 230 cm).");
      return;
    }
    try {
      await saveProfile(uid, { age, heightCm: height, strengths: p.strengths.trim(), freeText: p.freeText.trim() });
      setPMsg("Perfil guardado.");
    } catch {
      setPMsg("No se pudo guardar el perfil. Intenta de nuevo.");
    }
  };

  const onSubmitMeasurement = async (e: FormEvent) => {
    e.preventDefault();
    const { value, error } = validate(form);
    if (!value) return setMMsg({ ok: false, text: error! });
    setBusy(true);
    try {
      if (editing) await updateMeasurement(uid, editing, value);
      else await addMeasurement(uid, value);
      setMMsg({ ok: true, text: editing ? "Medida actualizada." : "Medida guardada." });
      setForm(emptyForm());
      setEditing(null);
    } catch {
      setMMsg({ ok: false, text: "No se pudo guardar. Intenta de nuevo." });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (m: Measurement) => {
    setEditing(m.id);
    setMMsg(null);
    setForm({
      date: m.date, weightKg: String(m.weightKg),
      waistCm: m.waistCm?.toString() ?? "", hipCm: m.hipCm?.toString() ?? "", thighCm: m.thighCm?.toString() ?? "",
      armCm: m.armCm?.toString() ?? "", chestCm: m.chestCm?.toString() ?? "", calfCm: m.calfCm?.toString() ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (m: Measurement) => {
    if (!window.confirm(`¿Borrar la medida del ${m.date}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteMeasurement(uid, m.id);
    } catch {
      setMMsg({ ok: false, text: "No se pudo borrar la medida." });
    }
  };

  return (
    <div className="stack">
      <h1>Mi perfil</h1>

      <section className="card">
        <h2>Datos personales</h2>
        {profileLoading ? <p className="muted">Cargando…</p> : (
          <form onSubmit={onSaveProfile} className="stack">
            <div className="grid2">
              <label>Edad<input inputMode="numeric" value={p.age} onChange={(e) => setP({ ...p, age: e.target.value })} /></label>
              <label>Estatura (cm)<input inputMode="decimal" value={p.heightCm} onChange={(e) => setP({ ...p, heightCm: e.target.value })} /></label>
            </div>
            <label>Fortalezas<textarea rows={2} value={p.strengths} onChange={(e) => setP({ ...p, strengths: e.target.value })} placeholder="Qué se te da bien al entrenar" /></label>
            <label>Tu proceso y objetivo personal<textarea rows={4} value={p.freeText} onChange={(e) => setP({ ...p, freeText: e.target.value })} placeholder="Cuéntalo con tus palabras" /></label>
            <div className="row">
              <button className="btn primary" type="submit">Guardar perfil</button>
              {pMsg && <span className="muted" role="status">{pMsg}</span>}
            </div>
          </form>
        )}
      </section>

      <section className="card">
        <h2>{editing ? "Editar medida" : "Nueva medida"}</h2>
        <form onSubmit={onSubmitMeasurement} className="stack">
          <div className="grid2">
            <label>Fecha<input type="date" max={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label>Peso (kg)<input inputMode="decimal" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} /></label>
          </div>
          <div className="grid3">
            {FIELDS.map(([key, label]) => (
              <label key={key}>{label} (cm)
                <input inputMode="decimal" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>{editing ? "Guardar cambios" : "Guardar medida"}</button>
            {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(emptyForm()); setMMsg(null); }}>Cancelar</button>}
            {mMsg && <span className={mMsg.ok ? "muted" : "error"} role="status">{mMsg.text}</span>}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Historial</h2>
        {loading ? <p className="muted">Cargando…</p> : listError ? <p className="error">{listError}</p> :
          items.length === 0 ? <p className="muted">Aún no tienes medidas. Guarda la primera para empezar a ver tu evolución.</p> : (
            <div className="tablewrap">
              <table>
                <thead>
                  <tr><th>Fecha</th><th>Peso</th>{FIELDS.map(([k, l]) => <th key={k}>{l}</th>)}<th /></tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td>{m.date}</td><td>{m.weightKg} kg</td>
                      {FIELDS.map(([k]) => <td key={k}>{m[k] ?? "–"}</td>)}
                      <td className="actions">
                        <button className="link" onClick={() => startEdit(m)}>Editar</button>
                        <button className="link danger" onClick={() => onDelete(m)}>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  );
}
