import { useEffect, useState } from "react";
import { addDoc, collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Answer, Diagnosis, Plan, PlanStatus } from "./types";

type Stamp = { toDate: () => Date };
export type SavedDiagnosis = { id: string; createdAt?: Stamp; data: Diagnosis };
export type SavedInterview = { id: string; diagnosisId: string; answers: Answer[] };
export type PlanDoc = { id: string; status: PlanStatus; version: number; content: Plan; diagnosisId?: string; createdAt?: Stamp };

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado");
  return db;
}

export function useLatestDiagnosis(uid: string) {
  const [saved, setSaved] = useState<SavedDiagnosis | null>(null);
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users", uid, "diagnoses"), orderBy("createdAt", "desc"), limit(1));
    return onSnapshot(q, (snap) => {
      const d = snap.docs[0];
      setSaved(d ? { id: d.id, ...(d.data() as Omit<SavedDiagnosis, "id">) } : null);
    });
  }, [uid]);
  return saved;
}

export function useLatestInterview(uid: string) {
  const [saved, setSaved] = useState<SavedInterview | null>(null);
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users", uid, "interviews"), orderBy("createdAt", "desc"), limit(1));
    return onSnapshot(q, (snap) => {
      const d = snap.docs[0];
      setSaved(d ? { id: d.id, ...(d.data() as Omit<SavedInterview, "id">) } : null);
    });
  }, [uid]);
  return saved;
}

export function usePlans(uid: string) {
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users", uid, "plans"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(
      q,
      (snap) => {
        setPlans(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PlanDoc, "id">) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [uid]);
  return { plans, loading };
}

export const saveInterview = (uid: string, diagnosisId: string, answers: Answer[]) =>
  addDoc(collection(requireDb(), "users", uid, "interviews"), { diagnosisId, answers, createdAt: serverTimestamp() });

export const saveProposal = (uid: string, plan: Plan, diagnosisId: string, version: number) =>
  addDoc(collection(requireDb(), "users", uid, "plans"), {
    type: "training",
    status: "propuesta",
    version,
    content: plan,
    diagnosisId,
    createdAt: serverTimestamp(),
  });

/** Solo el usuario activa un plan; el anterior queda archivado con su historial. */
export async function approvePlan(uid: string, plans: PlanDoc[], id: string) {
  const d = requireDb();
  const batch = writeBatch(d);
  for (const p of plans) {
    if (p.status === "activo" && p.id !== id) batch.update(doc(d, "users", uid, "plans", p.id), { status: "archivado" });
  }
  batch.update(doc(d, "users", uid, "plans", id), { status: "activo", approvedAt: serverTimestamp() });
  await batch.commit();
}

export async function setPlanStatus(uid: string, id: string, status: PlanStatus) {
  const d = requireDb();
  const batch = writeBatch(d);
  batch.update(doc(d, "users", uid, "plans", id), { status });
  await batch.commit();
}
