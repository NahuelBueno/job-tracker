export default function FunnelChart({ total, reachedInterview, reachedOffer }) {
  const stages = [
    { label: "Applied", value: total },
    { label: "Interview", value: reachedInterview },
    { label: "Offer", value: reachedOffer },
  ];

  const max = Math.max(total || 0, 1);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {stages.map((s) => {
        const pct = Math.round((s.value / max) * 100);

        return (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontWeight: 700 }}>{s.label}</div>
              <div style={{ opacity: 0.8 }}>
                {s.value} ({pct}%)
              </div>
            </div>

            <div
              style={{
                height: 14,
                borderRadius: 999,
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "#111827",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}