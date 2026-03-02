import { useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../lib/auth-context";
import "./Dashboard.css";
import { useApplications } from "../hooks/useApplications";

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

function useStatusCounts(apps = []) {
  return useMemo(() => {
    const counts = {
      total: apps.length,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    for (const a of apps) {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    }

    return counts;
  }, [apps]);
}

export default function Dashboard() {
  const { user } = useAuth();

  const { apps, loading, error, setError, addApplication, updateStatus, deleteApplication } =
    useApplications(user);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");
  const [setApps] = useState([]);
  const [filter, setFilter] = useState("all");
  const [setLoading] = useState(true);
  const filteredApps =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);
  // 🔹 MÉTRICAS GLOBALES
  const counts = useStatusCounts(apps);

  
  const statCardStyle = {
    border: "1px solid #eaeaea",
    borderRadius: 14,
    padding: 10,
    minWidth: 0,
    width: "100%",
    background: "white",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: 72,
  };

  const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e5e5",
  background: "white",
  color: "#111827",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e5e5",
  background: "white",
  color: "#111827",
  cursor: "pointer",
};

const buttonStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e5e5",
  background: "white",
  fontWeight: 700,
  cursor: "pointer",
  color: "#111827",
};

const dangerButtonStyle = {
  ...buttonStyle,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#991b1b",
};

      const statLabelStyle = {
        fontSize: "clamp(12px, 3vw, 14px)",
        opacity: 1,
        color: "#374151", // gris
      };

      const statValueStyle = {
        fontSize: "clamp(18px, 4vw, 26px)",
        fontWeight: 800,
        color: "#111827", // negro
      };



  // CREATE: agregar una application
  async function handleAdd(e) {
    e.preventDefault();
    setError("");

    if (!company.trim() || !role.trim()) {
      setError("Company and role are required");
      return;
    }

    try {
      const appsRef = collection(db, "users", user.uid, "applications");
      await addDoc(appsRef, {
        company: company.trim(),
        role: role.trim(),
        status,
        createdAt: serverTimestamp(),
      });

      setCompany("");
      setRole("");
      setStatus("applied");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error creating application");
    }
  }

        async function handleDelete(appId) {
        setError("");

        const ok = window.confirm("Delete this application? This action cannot be undone.");
        if (!ok) return;

        try {
          await deleteDoc(doc(db, "users", user.uid, "applications", appId));
        } catch (err) {
          console.error(err);
          setError(err?.message || "Error deleting application");
        }
      }

  // UPDATE: cambiar status
  async function handleStatusChange(appId, newStatus) {
    setError("");
    try {
      await updateDoc(doc(db, "users", user.uid, "applications", appId), {
        status: newStatus,
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error updating status");
    }
  }

  const canAdd = company.trim() && role.trim();

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Job Tracker</h1>
          <p style={{ marginTop: 6 }}>Signed in as: {user?.email}</p>
        </div>
        <div>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h2>Add application</h2>

      <form onSubmit={handleAdd} className="addForm">
        <div style={{ display: "grid", gap: 6 }}>
          <label>Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. BMW"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Role</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Status</label>
          <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={selectStyle}
              >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

          <div className="addFormButton">
          <button type="submit" style={buttonStyle}>Add</button>
        </div>
      </form>

              {error && <p style={{ color: "crimson" }}>{error}</p>}

      <hr style={{ margin: "18px 0" }} />

      <h2>My applications</h2>

                  {/* ✅ MÉTRICAS GLOBALES POR STATUS */}
            <div className="metricsGrid">
              <div style={{ ...statCardStyle, borderTop: "4px solid #6b7280" }}>
                <div style={statLabelStyle}>Total</div>
                <div style={statValueStyle}>{counts.total}</div>
              </div>

              <div style={{ ...statCardStyle, borderTop: "4px solid #6366f1" }}>
                <div style={statLabelStyle}>Applied</div>
                <div style={statValueStyle}>{counts.applied}</div>
              </div>

              <div style={{ ...statCardStyle, borderTop: "4px solid #0ea5e9" }}>
                <div style={statLabelStyle}>Interview</div>
                <div style={statValueStyle}>{counts.interview}</div>
              </div>

              <div style={{ ...statCardStyle, borderTop: "4px solid #10b981" }}>
                <div style={statLabelStyle}>Offer</div>
                <div style={statValueStyle}>{counts.offer}</div>
              </div>

              <div style={{ ...statCardStyle, borderTop: "4px solid #ef4444" }}>
                <div style={statLabelStyle}>Rejected</div>
                <div style={statValueStyle}>{counts.rejected}</div>
              </div>
            </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <strong>Filter:</strong>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

                 {loading ? (
                <p style={{ opacity: 0.8 }}>Loading applications...</p>
              ) : filteredApps.length === 0 ? (
                <p>No applications yet. Add your first one 👆</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {filteredApps.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <strong>{a.company}</strong> — {a.role}

              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>Status:</span>

                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={dangerButtonStyle}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}