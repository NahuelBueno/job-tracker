import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { useApplications } from "../hooks/useApplications";

import ApplicationsChart from "../components/ApplicationsChart";
import TransitionsChart from "../components/TransitionsChart";
import FunnelChart from "../components/FunnelChart";

import { getApplicationsPerMonth, getTransitionsPerMonth } from "../utils/analytics";

function hasReached(history, status) {
  if (!Array.isArray(history)) return false;
  return history.some((h) => h?.status === status);
}

export default function Analytics() {
  const { user } = useAuth();
  const { apps, loading, error } = useApplications(user);
  const [transitionMetric, setTransitionMetric] = useState("interview");
  const stats = useMemo(() => {
    const total = apps.length;

    const counts = { applied: 0, interview: 0, offer: 0, rejected: 0 };
    let reachedInterview = 0;
    let reachedOffer = 0;

    for (const a of apps) {
      const s = a.status;
      if (counts[s] !== undefined) counts[s] += 1;

      const history = a.statusHistory;

      if (hasReached(history, "interview")) reachedInterview += 1;
      if (hasReached(history, "offer")) reachedOffer += 1;
    }

    const conversionRate = total ? reachedInterview / total : 0;
    const offerRate = total ? reachedOffer / total : 0;

    return {
      total,
      counts,
      reachedInterview,
      reachedOffer,
      conversionRate,
      offerRate,
    };
  }, [apps]);

  const chartData = useMemo(() => {
    return getApplicationsPerMonth(apps);
  }, [apps]);

  const transitionsData = useMemo(() => {
    return getTransitionsPerMonth(apps);
  }, [apps]);

  const cardStyle = {
    border: "1px solid #eaeaea",
    borderRadius: 14,
    padding: 12,
    background: "white",
    color: "#111827",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    minWidth: 0,
  };

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
        <div style={{ display: "grid", gap: 12, marginTop: 12, minWidth: 0 }}>
          {/* Top 2 cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              minWidth: 0,
            }}
          >
            <div style={cardStyle}>
              <div style={{ opacity: 0.8, color: "#374151" }}>
                Conversion rate (Reached Interview / Total)
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>
                {Math.round(stats.conversionRate * 100)}%
              </div>
              <div style={{ opacity: 0.8, marginTop: 4, color: "#6b7280" }}>
                {stats.reachedInterview}/{stats.total} reached interview
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ opacity: 0.8, color: "#374151" }}>
                Offer rate (Reached Offer / Total)
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>
                {Math.round(stats.offerRate * 100)}%
              </div>
              <div style={{ opacity: 0.8, marginTop: 4, color: "#6b7280" }}>
                {stats.reachedOffer}/{stats.total} reached offer
              </div>
            </div>
          </div>

          {/* Counts */}
          <div style={cardStyle}>
            <div style={{ opacity: 0.8, marginBottom: 8, color: "#374151" }}>
              Counts (current pipeline)
            </div>
            <div>Total: {stats.total}</div>
            <div>Applied: {stats.counts.applied}</div>
            <div>Interview: {stats.counts.interview}</div>
            <div>Offer: {stats.counts.offer}</div>
            <div>Rejected: {stats.counts.rejected}</div>
          </div>

          {/* Funnel */}
          <div style={cardStyle}>
            <div style={{ opacity: 0.8, marginBottom: 10, color: "#374151" }}>
              Pipeline funnel
            </div>

            <FunnelChart
              total={stats.total}
              reachedInterview={stats.reachedInterview}
              reachedOffer={stats.reachedOffer}
            />
          </div>

          {/* Applications per month */}
          <div style={cardStyle}>
            <div style={{ opacity: 0.8, marginBottom: 8, color: "#374151" }}>
              Applications per month
            </div>
            <ApplicationsChart data={chartData} />
          </div>

          {/* Transitions per month */}
<div style={cardStyle}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    }}
  >
    <div style={{ opacity: 0.8, color: "#374151" }}>
      Transitions per month (from statusHistory)
    </div>

          <select
            value={transitionMetric}
            onChange={(e) => setTransitionMetric(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#111827",
              cursor: "pointer",
            }}
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <TransitionsChart data={transitionsData} metric={transitionMetric} />
          </div>
        </div>
      )}
    </div>
  );
}