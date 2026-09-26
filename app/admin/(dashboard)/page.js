import { supabaseAdmin } from "@/lib/supabaseAdmin";
import StatCard from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminDashboardPage() {
  const [{ data: institutions }, { data: contestants }, { data: categories }, { data: settings }] = await Promise.all(
    [
      supabaseAdmin.from("institutions").select("id, type, created_at"),
      supabaseAdmin.from("contestants").select("id, category, is_group, created_at"),
      supabaseAdmin.from("categories").select("slug, label").order("sort_order"),
      supabaseAdmin.from("site_settings").select("event_date").eq("id", 1).single(),
    ]
  );

  const institutionsList = institutions || [];
  const contestantsList = contestants || [];
  const categoriesList = categories || [];

  const schools = institutionsList.filter((i) => i.type === "school").length;
  const universities = institutionsList.filter((i) => i.type === "university").length;
  const totalCompetitors = contestantsList.length;
  const groupEntries = contestantsList.filter((c) => c.is_group).length;

  const byCategory = categoriesList.map((cat) => ({
    label: cat.label,
    count: contestantsList.filter((c) => c.category === cat.slug).length,
  }));
  const maxCount = Math.max(1, ...byCategory.map((c) => c.count));

  const daysToEvent = settings?.event_date
    ? Math.max(0, Math.ceil((new Date(settings.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const recent = [
    ...institutionsList.map((i) => ({ type: "Institution", label: i.type, at: i.created_at })),
    ...contestantsList.map((c) => ({ type: "Competitor", label: c.category, at: c.created_at })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Dashboard</h1>
      <p className="text-muted text-[12.5px] mb-6">Overview of all PHOENIX&apos;26 registrations.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Schools" value={schools} />
        <StatCard label="Universities" value={universities} />
        <StatCard label="Competitors" value={totalCompetitors} />
        <StatCard label="Group Entries" value={groupEntries} />
      </div>

      {daysToEvent !== null && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 text-center max-w-xs">
          <div className="text-2xl font-extrabold bg-ember bg-clip-text text-transparent">{daysToEvent}</div>
          <div className="text-muted text-[11px] uppercase tracking-wide mt-1">Days to event</div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="font-bold text-sm mb-4">Competitors by category</div>
        <div className="flex flex-col gap-3">
          {byCategory.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-[12.5px] mb-1">
                <span>{c.label}</span>
                <span className="text-muted">{c.count}</span>
              </div>
              <div className="h-2 bg-surfaceAlt rounded-full overflow-hidden">
                <div className="h-full bg-ember rounded-full" style={{ width: `${(c.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
          {byCategory.length === 0 && <div className="text-muted text-sm">No categories yet.</div>}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="font-bold text-sm mb-4">Recent activity</div>
        <div className="flex flex-col gap-2">
          {recent.map((r, i) => (
            <div
              key={i}
              className="flex justify-between text-[12.5px] border-b border-border pb-2 last:border-0 last:pb-0"
            >
              <span>
                <span className="text-flame2 font-semibold">{r.type}</span> · {r.label}
              </span>
              <span className="text-muted">{new Date(r.at).toLocaleString()}</span>
            </div>
          ))}
          {recent.length === 0 && <div className="text-muted text-sm">No activity yet.</div>}
        </div>
      </div>
    </div>
  );
}
