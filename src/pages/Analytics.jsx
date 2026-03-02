import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { useApplications } from "../hooks/useApplications";

export default function Analytics() {
  const { user } = useAuth();
  const { apps, loading, error } = useApplications(user);

  const stats = useMemo(() => {
    const total = apps.length;
    const applied = apps.filter((a) => a.status === "applied").length;
    const interview = apps.filter((a) => a.status === "interview").length;
    const offer = apps.filter((a) => a.status === "offer").length;

    const conversionRate = applied ? interview / applied : 0;
    const offerRate = total ? offer / total : 0;

    return { total, applied, interview, offer, conversionRate, offerRate };
  }, [apps]);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Advanced analytics</h1>
        <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>
          ← Back
        </Link>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p style={{ opacity: 0.8 }}>Loading analytics...</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                border: "1px solid #eaeaea",
                borderRadius: 14,
                padding: 12,
                background: "white",
                color: "#111827",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ opacity: 0.8, color: "#374151" }}>
                Conversion rate (Interview / Applied)
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>
                {Math.round(stats.conversionRate * 100)}%
              </div>
            </div>

            <div
              style={{
                border: "1px solid #eaeaea",
                borderRadius: 14,
                padding: 12,
                background: "white",
                color: "#111827",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ opacity: 0.8, color: "#374151" }}>
                Offer rate (Offer / Total)
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>
                {Math.round(stats.offerRate * 100)}%
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #eaeaea",
              borderRadius: 14,
              padding: 12,
              background: "white",
              color: "#111827",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ opacity: 0.8, marginBottom: 8, color: "#374151" }}>
              Counts
            </div>
            <div>Total: {stats.total}</div>
            <div>Applied: {stats.applied}</div>
            <div>Interview: {stats.interview}</div>
            <div>Offer: {stats.offer}</div>
          </div>

          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: 14,
              padding: 12,
            }}
          >
            Next: chart “Applications per month”
          </div>
        </div>
      )}
    </div>
  );
}