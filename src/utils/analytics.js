export function getApplicationsPerMonth(apps) {
  const map = {};

  apps.forEach((app) => {
    if (!app.createdAt) return;

    const date = app.createdAt.toDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!map[key]) {
      map[key] = 0;
    }

    map[key]++;
  });

  return Object.entries(map)
    .map(([month, count]) => ({
      month,
      applications: count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}


export function getTransitionsPerMonth(apps) {
  const map = {}; // { "2026-03": { month, applied, interview, offer, rejected } }

  for (const app of apps) {
    const history = app.statusHistory;
    if (!Array.isArray(history)) continue;

    for (const h of history) {
      const status = h?.status;
      const at = h?.at;

      if (!status || !at || typeof at.toDate !== "function") continue;

      const d = at.toDate();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!map[key]) {
        map[key] = {
          month: key,
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
        };
      }

      if (map[key][status] !== undefined) {
        map[key][status] += 1;
      }
    }
  }

  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

