import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CategoryDeleteButton from "@/components/admin/CategoryDeleteButton";
import CategoryBulkActions from "@/components/admin/CategoryBulkActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminCategoriesPage() {
  const { data: categories, error } = await supabaseAdmin.from("categories").select("*").order("sort_order");

  return (
    <div>
      <div className="flex items-center justify-between mt-3 mb-1">
        <h2 className="text-xl font-extrabold">Categories</h2>
        <Link href="/admin/categories/new" className="text-flame2 text-[13px] font-semibold">
          + Add category
        </Link>
      </div>

      {(categories || []).length > 0 && (
        <div className="flex justify-end mb-4">
          <CategoryBulkActions />
        </div>
      )}

      {error && <p className="text-danger text-sm">Failed to load: {error.message}</p>}

      <div className="flex flex-col gap-3">
        {(categories || []).map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                {c.label}
                {c.is_open === false && (
                  <span className="text-danger text-[10.5px] font-semibold border border-danger rounded-full px-2 py-0.5">
                    CLOSED
                  </span>
                )}
              </div>
              <div className="text-muted text-[11.5px] mt-0.5">
                /{c.slug} · order {c.sort_order}
                {c.has_submission === false && " · no submission"}
                {c.supports_group_entry && " · group entries"}
                {Array.isArray(c.custom_fields) && c.custom_fields.length > 0 &&
                  ` · ${c.custom_fields.length} custom field${c.custom_fields.length === 1 ? "" : "s"}`}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Link href={`/admin/categories/${c.id}`} className="text-teal text-[12.5px] font-semibold">
                Edit
              </Link>
              <CategoryDeleteButton id={c.id} />
            </div>
          </div>
        ))}
        {(categories || []).length === 0 && (
          <div className="text-muted text-sm text-center py-6">No categories yet.</div>
        )}
      </div>
    </div>
  );
}
