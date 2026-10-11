import { useEffect, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export type Measurement = {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  hipCm?: number;
  thighCm?: number;
  armCm?: number;
  chestCm?: number;
  calfCm?: number;
};
export type MeasurementInput = Omit<Measurement, "id">;

export type Profile = {
  age?: number;
  heightCm?: number;
  strengths?: string;
  freeText?: string;
};

function requireDb() {
  if (!db) throw new Error("Firebase no está configurado");
  return db;
}

const measurementsCol = (uid: string) => collection(requireDb(), "users", uid, "measurements");

/** Quita campos undefined: Firestore no los acepta. */
function clean<T extends Record<string, unknown>>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export const addMeasurement = (uid: string, m: MeasurementInput) =>
  addDoc(measurementsCol(uid), { ...clean(m), createdAt: serverTimestamp() });

export const updateMeasurement = (uid: string, id: string, m: MeasurementInput) =>
  updateDoc(doc(requireDb(), "users", uid, "measurements", id), { ...clean(m), updatedAt: serverTimestamp() });

export const deleteMeasurement = (uid: string, id: string) =>
  deleteDoc(doc(requireDb(), "users", uid, "measurements", id));

export const saveProfile = (uid: string, p: Profile) =>
  setDoc(doc(requireDb(), "users", uid), { ...clean(p), updatedAt: serverTimestamp() }, { merge: true });

export function useMeasurements(uid: string | undefined) {
  const [items, setItems] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !db) return;
    const q = query(measurementsCol(uid), orderBy("date", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as MeasurementInput) })));
        setLoading(false);
      },
      () => {
        setError("No se pudieron cargar tus medidas.");
        setLoading(false);
      }
    );
  }, [uid]);

  return { items, loading, error };
}

export function useProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !db) return;
    return onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        setProfile((snap.data() as Profile | undefined) ?? {});
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [uid]);

  return { profile, loading };
}
