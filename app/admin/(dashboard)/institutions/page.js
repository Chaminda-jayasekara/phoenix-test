import { supabaseAdmin } from "@/lib/supabaseAdmin";
import InstitutionsTable from "@/components/admin/InstitutionsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminInstitutionsPage() {
  const { data: institutions, error } = await supabaseAdmin
    .from("institutions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-extrabold mb-2">Registered Institutions</h1>
        <p className="text-danger text-sm">Failed to load: {error.message}</p>
      </div>
    );
  }

  const ids = (institutions || []).map((i) => i.id);
  let bearers = [];
  if (ids.length > 0) {
    const res = await supabaseAdmin.from("office_bearers").select("*").in("institution_id", ids);
    bearers = res.data || [];
  }
  // Group bearers by institution once (O(n)) instead of re-scanning the
  // whole bearers array for every institution (O(n×m)) — matters once
  // there are thousands of rows.
  const bearersByInstitution = new Map();
  for (const b of bearers) {
    if (!bearersByInstitution.has(b.institution_id)) bearersByInstitution.set(b.institution_id, []);
    bearersByInstitution.get(b.institution_id).push(b);
  }
  const merged = (institutions || []).map((inst) => ({
    ...inst,
    office_bearers: bearersByInstitution.get(inst.id) || [],
  }));

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1">Registered Institutions</h1>
      <p className="text-muted text-[12.5px] mb-5">
        {merged.length} total registration{merged.length === 1 ? "" : "s"}.
      </p>
      <InstitutionsTable institutions={merged} />
    </div>
  );
}
