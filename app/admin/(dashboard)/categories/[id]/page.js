import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CategoryForm from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function CategoryEditPage({ params }) {
  const isNew = params.id === "new";
  let initial = null;

  if (!isNew) {
    const { data, error } = await supabaseAdmin.from("categories").select("*").eq("id", params.id).single();
    if (error || !data) notFound();
    initial = data;
  }

  return (
    <div>
      <Link href="/admin/categories" className="text-muted text-[12.5px]">
        ← Categories
      </Link>
      <h2 className="text-xl font-extrabold mt-3 mb-4">{isNew ? "Add" : "Edit"} Category</h2>
      <CategoryForm initial={initial} />
    </div>
  );
}
