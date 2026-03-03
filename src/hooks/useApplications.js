import { useCallback, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export function useApplications(user) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // READ realtime
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError("");

    const appsRef = collection(db, "users", user.uid, "applications");
    const q = query(appsRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setApps(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err?.message || "Error loading applications");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // CREATE
  const addApplication = useCallback(
    async ({ company, role, status }) => {
      if (!user) return;

      setError("");

      const appsRef = collection(db, "users", user.uid, "applications");
      const now = Timestamp.now(); // ✅ permitido dentro de arrays

      await addDoc(appsRef, {
        company: company.trim(),
        role: role.trim(),
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [{ status, at: now }],
      });
    },
    [user]
  );

// UPDATE (status + statusHistory) - no duplicates + auto-complete (Option C)
const updateStatus = useCallback(
  async (appId, newStatus) => {
    if (!user) return;

    setError("");

    const ref = doc(db, "users", user.uid, "applications", appId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("Application not found");

      const data = snap.data();
      const history = Array.isArray(data?.statusHistory) ? data.statusHistory : [];

      // Usamos el último status real del historial como fuente de verdad (si existe)
      const lastStatus = history.length ? history[history.length - 1]?.status : data?.status;

      // No-op si no hay cambio
      if (lastStatus === newStatus) return;

      // Pipeline canónico
      const PIPELINE = ["applied", "interview", "offer"];

      const fromIdx = PIPELINE.indexOf(lastStatus);
      const toIdx = PIPELINE.indexOf(newStatus);

      const baseMs = Date.now();
      const eventsToAppend = [];

      // Auto-complete solo si es salto hacia adelante dentro del pipeline
      // (ej: applied -> offer). Si es rejected, no forzamos intermedios.
      if (fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx) {
        for (let i = fromIdx + 1; i <= toIdx; i++) {
          eventsToAppend.push({
            status: PIPELINE[i],
            at: Timestamp.fromMillis(baseMs + (i - (fromIdx + 1))), // 0ms,1ms...
          });
        }
      } else {
        // Caso normal: append solo el nuevoStatus
        eventsToAppend.push({
          status: newStatus,
          at: Timestamp.fromMillis(baseMs),
        });
      }

      tx.update(ref, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        statusHistory: [...history, ...eventsToAppend],
      });
    });
  },
  [user]
);

  // DELETE
  const deleteApplication = useCallback(
    async (appId) => {
      if (!user) return;

      setError("");
      await deleteDoc(doc(db, "users", user.uid, "applications", appId));
    },
    [user]
  );

  return {
    apps,
    loading,
    error,
    setError,
    addApplication,
    updateStatus,
    deleteApplication,
  };
}