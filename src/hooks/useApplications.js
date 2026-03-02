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
  serverTimestamp,
  updateDoc,
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
      await addDoc(appsRef, {
        company: company.trim(),
        role: role.trim(),
        status,
        createdAt: serverTimestamp(),
      });
    },
    [user]
  );

  // UPDATE
  const updateStatus = useCallback(
    async (appId, newStatus) => {
      if (!user) return;

      setError("");
      await updateDoc(doc(db, "users", user.uid, "applications", appId), {
        status: newStatus,
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