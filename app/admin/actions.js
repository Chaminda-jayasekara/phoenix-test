"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import {
  createSessionToken,
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  createAttemptToken,
  verifyAttemptToken,
  ATTEMPTS_COOKIE_NAME,
  MAX_ATTEMPTS,
} from "@/lib/adminAuth";

export async function adminLogin(prevState, formData) {
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "Server is not configured with an admin password." };
  }

  const attemptsCookie = cookies().get(ATTEMPTS_COOKIE_NAME)?.value;
  const { count, windowStart } = await verifyAttemptToken(attemptsCookie);

  if (count >= MAX_ATTEMPTS) {
    return { error: "Too many attempts. Please wait about 15 minutes and try again." };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    const nextCount = count + 1;
    const nextToken = await createAttemptToken(nextCount, windowStart);
    cookies().set(ATTEMPTS_COOKIE_NAME, nextToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    const remaining = MAX_ATTEMPTS - nextCount;
    return {
      error:
        remaining > 0
          ? `Incorrect password. ${remaining} attempt${remaining === 1 ? "" : "s"} left before a short lockout.`
          : "Incorrect password. Too many attempts — please wait about 15 minutes.",
    };
  }

  // Correct password — clear any attempt count and start a real session.
  cookies().delete(ATTEMPTS_COOKIE_NAME);

  const token = await createSessionToken();
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/admin");
}

export async function adminLogout() {
  cookies().delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function upsertCategory(prevState, formData) {
  const id = formData.get("id");

  const ageCategories = String(formData.get("ageCategories") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const subCategoriesRaw = String(formData.get("subCategories") || "").trim();
  const subCategories = subCategoriesRaw
    ? subCategoriesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const nestedRaw = String(formData.get("nestedSubCategories") || "").trim();
  let nestedSubCategories = null;
  if (nestedRaw) {
    try {
      nestedSubCategories = JSON.parse(nestedRaw);
    } catch {
      return { error: "Nested sub-categories must be valid JSON (or leave it blank)." };
    }
  }

  // Custom fields arrive as a JSON string built client-side by
  // CustomFieldsBuilder (one hidden input holding the whole array).
  const customFieldsRaw = String(formData.get("customFields") || "[]").trim();
  let customFields = [];
  try {
    customFields = customFieldsRaw ? JSON.parse(customFieldsRaw) : [];
    if (!Array.isArray(customFields)) throw new Error("not an array");
  } catch {
    return { error: "Custom fields data was malformed — please re-add them." };
  }
  customFields = customFields
    .map((f) => ({
      key: String(f.key || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, ""),
      label: String(f.label || "").trim(),
      type: ["text", "textarea", "number", "email", "tel", "url", "select", "checkbox"].includes(f.type)
        ? f.type
        : "text",
      required: !!f.required,
      options: String(f.options || "").trim(),
      hint: String(f.hint || "").trim(),
    }))
    .filter((f) => f.key && f.label);

  const seenKeys = new Set();
  for (const f of customFields) {
    if (seenKeys.has(f.key)) {
      return { error: `Duplicate custom field key: "${f.key}". Each field needs a unique key.` };
    }
    seenKeys.add(f.key);
    if (f.type === "select" && !f.options) {
      return { error: `Custom field "${f.label}" is a dropdown but has no options.` };
    }
  }

  const payload = {
    slug: String(formData.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-"),
    label: String(formData.get("label") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    age_categories: ageCategories,
    sub_categories: subCategories,
    nested_sub_categories: nestedSubCategories,
    supports_group_entry: formData.get("supportsGroupEntry") === "on",
    has_submission: formData.get("hasSubmission") === "on",
    submission_label: String(formData.get("submissionLabel") || "Submission link"),
    submission_hint: String(formData.get("submissionHint") || ""),
    rules_video_url: String(formData.get("rulesVideoUrl") || ""),
    rules_pdf_url: String(formData.get("rulesPdfUrl") || ""),
    whatsapp_group_link: String(formData.get("whatsappGroupLink") || ""),
    sort_order: Number(formData.get("sortOrder") || 0),
    is_open: formData.get("isOpen") === "on",
    custom_fields: customFields,
  };

  if (!payload.slug || !payload.label) {
    return { error: "Slug and label are required." };
  }
  if (ageCategories.length === 0) {
    return { error: "At least one age category is required." };
  }

  let error;
  if (id) {
    ({ error } = await supabaseAdmin.from("categories").update(payload).eq("id", id));
  } else {
    ({ error } = await supabaseAdmin.from("categories").insert(payload));
  }

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id) {
  await supabaseAdmin.from("categories").delete().eq("id", id);
  revalidatePath("/categories");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
}

// Bulk open/close — lets the admin hide every category from the site
// in one click (e.g. when registrations close site-wide) instead of
// editing each one individually.
export async function setAllCategoriesOpen(open) {
  const { data: rows, error: fetchError } = await supabaseAdmin.from("categories").select("id");
  if (fetchError) return { error: fetchError.message };

  const ids = (rows || []).map((r) => r.id);
  if (ids.length > 0) {
    const { error } = await supabaseAdmin.from("categories").update({ is_open: open }).in("id", ids);
    if (error) return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateSiteSettings(prevState, formData) {
  const eventDateRaw = formData.get("eventDate");
  const payload = {
    event_date: eventDateRaw ? sriLankaLocalToUtcIso(eventDateRaw) : null,
    hero_description: String(formData.get("heroDescription") || ""),
    general_rules_video_url: String(formData.get("generalRulesVideoUrl") || ""),
    general_rules_pdf_url: String(formData.get("generalRulesPdfUrl") || ""),
    school_whatsapp_link: String(formData.get("schoolWhatsappLink") || ""),
    university_whatsapp_link: String(formData.get("universityWhatsappLink") || ""),
    school_registration_open: formData.get("schoolRegistrationOpen") === "on",
    university_registration_open: formData.get("universityRegistrationOpen") === "on",
  };

  const { error } = await supabaseAdmin.from("site_settings").update(payload).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/register/school");
  revalidatePath("/register/university");
  return { success: true };
}

// The event happens in Sri Lanka, so the date/time picked in the admin
// Settings page is always treated as Sri Lanka time (UTC+5:30) — not
// whatever timezone the server happens to run in (Vercel runs in UTC).
// Without this, a date meant as "9:00 AM Sri Lanka time" could get
// stored as "9:00 AM UTC", which is a different moment entirely and
// can make the countdown think the event already happened.
function sriLankaLocalToUtcIso(localDateTimeStr) {
  const [datePart, timePart] = localDateTimeStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart || "00:00").split(":").map(Number);
  const SRI_LANKA_OFFSET_MINUTES = 5 * 60 + 30;
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - SRI_LANKA_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs).toISOString();
}
