import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminSettingsPage() {
  const { data } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).single();

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-4">Site Settings</h2>
      <SettingsForm initial={data} />
    </div>
  );
}
