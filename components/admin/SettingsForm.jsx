"use client";

import { useFormState } from "react-dom";
import { updateSiteSettings } from "@/app/admin/actions";
import { Field, Input, Button, ErrorText } from "@/components/ui";

const textareaClass =
  "w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none";

export default function SettingsForm({ initial }) {
  const [state, formAction] = useFormState(updateSiteSettings, {});
  const eventDateValue = initial?.event_date ? toSriLankaLocalInputValue(initial.event_date) : "";

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <Field label="Event date & time" hint="Sri Lanka time (UTC+5:30) — the homepage countdown counts down to this moment">
        <Input type="datetime-local" name="eventDate" defaultValue={eventDateValue} />
      </Field>
      <Field label="Homepage description">
        <textarea name="heroDescription" defaultValue={initial?.hero_description} className={textareaClass} rows={4} />
      </Field>
      <Field label="General rules video URL" hint="YouTube link, shown on the homepage">
        <Input name="generalRulesVideoUrl" defaultValue={initial?.general_rules_video_url} />
      </Field>
      <Field label="General rules PDF URL" hint="Direct link, or a Google Drive share link">
        <Input name="generalRulesPdfUrl" defaultValue={initial?.general_rules_pdf_url} />
      </Field>
      <Field label="School coordinators WhatsApp link" hint="Shown to schools after institution registration">
        <Input
          name="schoolWhatsappLink"
          defaultValue={initial?.school_whatsapp_link}
          placeholder="https://chat.whatsapp.com/..."
        />
      </Field>
      <Field label="University coordinators WhatsApp link" hint="Shown to universities after institution registration">
        <Input
          name="universityWhatsappLink"
          defaultValue={initial?.university_whatsapp_link}
          placeholder="https://chat.whatsapp.com/..."
        />
      </Field>

      <div className="mt-2 pt-4 border-t border-border">
        <div className="text-[12.5px] text-muted mb-3 font-semibold">Registration availability</div>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            name="schoolRegistrationOpen"
            id="schoolRegistrationOpen"
            defaultChecked={initial ? initial.school_registration_open !== false : true}
            className="accent-flame1"
          />
          <label htmlFor="schoolRegistrationOpen" className="text-sm">
            School registration open
          </label>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            name="universityRegistrationOpen"
            id="universityRegistrationOpen"
            defaultChecked={initial ? initial.university_registration_open !== false : true}
            className="accent-flame1"
          />
          <label htmlFor="universityRegistrationOpen" className="text-sm">
            University registration open
          </label>
        </div>
        <p className="text-muted text-[11px] mt-1">
          Turning one off immediately removes that registration option from the homepage and blocks new
          submissions — for both, and for anyone posting directly to the API.
        </p>
      </div>

      {state?.error && <ErrorText>{state.error}</ErrorText>}
      {state?.success && <div className="text-teal text-[12.5px] mt-1">Saved.</div>}
      <div className="mt-4">
        <Button type="submit">Save settings</Button>
      </div>
    </form>
  );
}

// Converts a stored UTC ISO string back to what should show in the
// datetime-local input, expressed in Sri Lanka time — the mirror image
// of sriLankaLocalToUtcIso() in app/admin/actions.js. Uses the UTC*
// getters on a manually-shifted timestamp so this is correct no matter
// what timezone the browser itself is in.
function toSriLankaLocalInputValue(isoString) {
  const SRI_LANKA_OFFSET_MINUTES = 5 * 60 + 30;
  const shiftedMs = new Date(isoString).getTime() + SRI_LANKA_OFFSET_MINUTES * 60 * 1000;
  const d = new Date(shiftedMs);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes()
  )}`;
}
