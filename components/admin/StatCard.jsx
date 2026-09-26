export default function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 text-center">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-muted text-[11px] uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
