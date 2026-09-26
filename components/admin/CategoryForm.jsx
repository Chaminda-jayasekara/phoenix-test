"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertCategory } from "@/app/admin/actions";
import { Field, Input, Button, ErrorText } from "@/components/ui";
import CustomFieldsBuilder from "@/components/admin/CustomFieldsBuilder";

const textareaClass =
  "w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none font-mono";

export default function CategoryForm({ initial }) {
  const [state, formAction] = useFormState(upsertCategory, {});
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push("/admin/categories");
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Slug" required hint="Used in the URL — lowercase, hyphens only, e.g. graphic-design">
        <Input name="slug" defaultValue={initial?.slug} required />
      </Field>
      <Field label="Label" required hint="Shown to visitors, e.g. Graphic Design">
        <Input name="label" defaultValue={initial?.label} required />
      </Field>
      <Field label="Description">
        <Input name="description" defaultValue={initial?.description} />
      </Field>
      <Field label="Age categories" required hint="Comma-separated, e.g. Intermediate, Senior, University">
        <Input name="ageCategories" defaultValue={(initial?.age_categories || []).join(", ")} />
      </Field>
      <Field label="Sub-categories" hint="Comma-separated, optional — e.g. for Photography's themes. Leave blank if none.">
        <Input name="subCategories" defaultValue={(initial?.sub_categories || []).join(", ")} />
      </Field>
      <Field
        label="Nested sub-categories (advanced)"
        hint='Optional JSON, only for setups like Broadcasting where each event has its own languages. Example: {"Announcing":["Sinhala","English"]}. Leave blank otherwise.'
      >
        <textarea
          name="nestedSubCategories"
          defaultValue={initial?.nested_sub_categories ? JSON.stringify(initial.nested_sub_categories, null, 2) : ""}
          className={textareaClass}
          rows={4}
        />
      </Field>

      <div className="flex items-center gap-2 my-2">
        <input
          type="checkbox"
          name="supportsGroupEntry"
          id="supportsGroupEntry"
          defaultChecked={initial?.supports_group_entry}
          className="accent-flame1"
        />
        <label htmlFor="supportsGroupEntry" className="text-sm">
          Allow group/team entries
        </label>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          name="hasSubmission"
          id="hasSubmission"
          defaultChecked={initial ? initial.has_submission !== false : true}
          className="accent-flame1"
        />
        <label htmlFor="hasSubmission" className="text-sm">
          Requires an online submission link
        </label>
      </div>

      <Field label="Submission link label">
        <Input name="submissionLabel" defaultValue={initial?.submission_label || "Submission link"} />
      </Field>
      <Field label="Submission link hint">
        <Input name="submissionHint" defaultValue={initial?.submission_hint} />
      </Field>
      <Field label="Rules video URL" hint="YouTube link, in any format">
        <Input name="rulesVideoUrl" defaultValue={initial?.rules_video_url} />
      </Field>
      <Field label="Rules PDF URL" hint="Direct link, or a Google Drive share link">
        <Input name="rulesPdfUrl" defaultValue={initial?.rules_pdf_url} />
      </Field>
      <Field label="WhatsApp group link" hint="Real invite link for this category's group chat, shown after a contestant registers">
        <Input name="whatsappGroupLink" defaultValue={initial?.whatsapp_group_link} placeholder="https://chat.whatsapp.com/..." />
      </Field>
      <Field label="Sort order" hint="Lower numbers appear first on the categories page">
        <Input name="sortOrder" type="number" defaultValue={initial?.sort_order ?? 0} />
      </Field>

      <div className="flex items-center gap-2 mb-4 mt-1 pt-3 border-t border-border">
        <input
          type="checkbox"
          name="isOpen"
          id="isOpen"
          defaultChecked={initial ? initial.is_open !== false : true}
          className="accent-flame1"
        />
        <label htmlFor="isOpen" className="text-sm">
          Registration open
        </label>
        <span className="text-muted text-[11px] ml-1">— turn off to remove this category from the site</span>
      </div>

      <CustomFieldsBuilder initial={initial?.custom_fields} />

      {state?.error && <ErrorText>{state.error}</ErrorText>}
      <div className="mt-4">
        <Button type="submit">Save category</Button>
      </div>
    </form>
  );
}
