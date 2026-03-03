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

const PIPELINE = ["applied", "interview", "offer"];

export function useApplications(user) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearError = useCallback(() => setError(""), []);

  // READ realtime
  useEffect(() => {
    // Si no hay user, reseteamos estado de manera prolija
    if (!user) {
      setApps([]);
      setLoading(false);
      setError("");
      return;
    }

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
      if (!user) throw new Error("Not authenticated");

      const companyClean = (company || "").trim();
      const roleClean = (role || "").trim();

      if (!companyClean || !roleClean) {
        throw new Error("Company and role are required");
      }

      clearError();

      const appsRef = collection(db, "users", user.uid, "applications");
      const now = Timestamp.now(); // ok para arrays

      await addDoc(appsRef, {
        company: companyClean,
        role: roleClean,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [{ status, at: now }],
      });
    },
    [user, clearError]
  );

  // UPDATE (status + statusHistory) - no duplicates + auto-complete (Option C)
  const updateStatus = useCallback(
    async (appId, newStatus) => {
      if (!user) throw new Error("Not authenticated");

      clearError();

      const ref = doc(db, "users", user.uid, "applications", appId);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Application not found");

        const data = snap.data();
        const history = Array.isArray(data?.statusHistory) ? data.statusHistory : [];

        // Fuente de verdad: último status del historial
        const lastStatus = history.length
          ? history[history.length - 1]?.status
          : data?.status;

        if (lastStatus === newStatus) return;

        const fromIdx = PIPELINE.indexOf(lastStatus);
        const toIdx = PIPELINE.indexOf(newStatus);

        const baseMs = Timestamp.now().toMillis();
        const eventsToAppend = [];

        // Auto-complete SOLO si es salto hacia adelante dentro del pipeline
        // Ej: applied -> offer agrega interview.
        if (fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx) {
          for (let i = fromIdx + 1; i <= toIdx; i++) {
            eventsToAppend.push({
              status: PIPELINE[i],
              at: Timestamp.fromMillis(baseMs + (i - (fromIdx + 1))), // 0ms,1ms...
            });
          }
        } else {
          // Caso normal (incluye rejected): agregar solo el nuevo status
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
    [user, clearError]
  );

  // DELETE
  const deleteApplication = useCallback(
    async (appId) => {
      if (!user) throw new Error("Not authenticated");

      clearError();
      await deleteDoc(doc(db, "users", user.uid, "applications", appId));
    },
    [user, clearError]
  );

  return {
    apps,
    loading,
    error,
    clearError,
    addApplication,
    updateStatus,
    deleteApplication,
    setError,
  };
}