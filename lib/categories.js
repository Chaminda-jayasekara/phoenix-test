import { supabase } from "@/lib/supabaseClient";

// Converts a DB row (snake_case) into the shape components already
// expect (camelCase) — keeps CategoryRegistrationForm and friends
// unchanged even though the source moved from a hardcoded array to
// the database.
export function mapDbCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    dbCategory: row.slug,
    label: row.label,
    description: row.description,
    ageCategories: row.age_categories || [],
    subCategories: row.sub_categories || null,
    nestedSubCategories: row.nested_sub_categories || null,
    supportsGroupEntry: !!row.supports_group_entry,
    hasSubmission: row.has_submission !== false,
    submissionLabel: row.submission_label || "Submission link",
    submissionHint: row.submission_hint || "",
    rulesVideoUrl: row.rules_video_url || "",
    rulesPdfUrl: row.rules_pdf_url || "",
    whatsappGroupLink: row.whatsapp_group_link || "",
    sortOrder: row.sort_order || 0,
    isOpen: row.is_open !== false,
    customFields: Array.isArray(row.custom_fields) ? row.custom_fields : [],
  };
}

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []).map(mapDbCategory);
}

export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (error) return null;
  return mapDbCategory(data);
}

export async function getSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}
