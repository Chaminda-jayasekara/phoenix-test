"use client";

import InstitutionSearchSelect from "@/components/InstitutionSearchSelect";
import { formatInstitutionLabel } from "@/lib/institutions";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  EmberProgress,
  Field,
  Input,
  Select,
  Card,
  Button,
  ReviewRow,
  ErrorText,
} from "@/components/ui";

export default function CategoryRegistrationForm({ category }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    entryType: "individual",
    fullName: "",
    nameWithInitials: "",
    teamMembers: "",
    contact: "",
    email: "",
    ageCategory: "",
    subCategory: "",
    eventType: "",
    language: "",
    institutionId: "",
    submissionLink: "",
    // Honeypot — see RegistrationForm.jsx for the same pattern.
    company: "",
    consent: false,
  });
  const customFields = category.customFields || [];
  const [customValues, setCustomValues] = useState(() =>
    Object.fromEntries(customFields.map((f) => [f.key, f.type === "checkbox" ? false : ""]))
  );
  function updateCustom(key, value) {
    setCustomValues((v) => ({ ...v, [key]: value }));
  }
  const [errors, setErrors] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    async function loadInstitutions() {
      const { data, error } = await supabase
        .from("institutions_public")
        .select("id, type, name, club_name, entry_type, representative_name, district, province, address, postal_code")
        .order("name");
      if (!error) setInstitutions(data || []);
      setLoadingInstitutions(false);
    }
    loadInstitutions();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedInstitution = institutions.find((i) => i.id === form.institutionId);

  function validateStep1() {
    const e = {};
    if (!form.fullName) e.fullName = "Required";
    if (!form.nameWithInitials) e.nameWithInitials = "Required";
    if (!form.contact) e.contact = "Required";
    if (!form.email) e.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.ageCategory) e.ageCategory = "Required";
    if (category.subCategories && !form.subCategory) e.subCategory = "Required";
    if (category.nestedSubCategories) {
      if (!form.eventType) e.eventType = "Required";
      if (form.eventType && !form.language) e.language = "Required";
    }
    customFields.forEach((f) => {
      if (!f.required) return;
      const val = customValues[f.key];
      if (f.type === "checkbox" ? !val : !String(val || "").trim()) {
        e[`custom_${f.key}`] = "Required";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    if (!form.institutionId) e.institutionId = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3() {
    if (category.hasSubmission === false) return true;
    const e = {};
    if (!form.submissionLink) e.submissionLink = "Required";
    else if (!/^https?:\/\//.test(form.submissionLink)) e.submissionLink = "Must be a valid link (https://...)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  async function handleSubmit() {
    if (form.company) {
      // Honeypot tripped — silently pretend success rather than tipping
      // off the bot with an error.
      setConfirmData({ id: "—", link: null });
      return;
    }
    if (!validateStep3()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const contestantId = crypto.randomUUID();
      const finalSubCategory = category.nestedSubCategories
        ? `${form.eventType} - ${form.language}`
        : form.subCategory || null;

      const { error: contestantErr } = await supabase.from("contestants").insert({
        id: contestantId,
        institution_id: form.institutionId,
        category: category.dbCategory,
        sub_category: finalSubCategory,
        age_category: form.ageCategory,
        full_name: form.fullName,
        name_with_initials: form.nameWithInitials,
        contact: form.contact,
        email: form.email,
        is_group: category.supportsGroupEntry ? form.entryType === "group" : false,
        team_members: category.supportsGroupEntry && form.entryType === "group" ? form.teamMembers || null : null,
        custom_field_values: customValues,
      });
      if (contestantErr) throw contestantErr;

      if (category.hasSubmission !== false) {
        const { error: submissionErr } = await supabase.from("submissions").insert({
          contestant_id: contestantId,
          submission_link: form.submissionLink,
        });
        if (submissionErr) throw submissionErr;
      }

      const link = category.whatsappGroupLink || null;
      setConfirmData({ id: contestantId, link });
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmData) {
    return (
      <div className="text-center pt-10">
        <div className="flex justify-center mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phoenix-mark.webp" alt="Phoenix'26" className="h-16 w-auto" />
        </div>
        <h2 className="text-[22px] font-extrabold">Entry submitted!</h2>
        <p className="text-muted text-sm mt-1.5">
          {form.fullName} is registered for {category.label}.
        </p>
        {category.hasSubmission === false && (
          <p className="text-teal text-[12.5px] mt-1">
            This category is judged live on competition day — no online submission needed.
          </p>
        )}
        <Card className="mt-6 text-left">
          <div className="text-[12px] text-muted mb-1.5">Registration ID</div>
          <div className="text-[13px] font-mono mb-4">{confirmData.id}</div>
          <div className="text-[12px] text-muted mb-1.5">WhatsApp group link</div>
          {confirmData.link ? (
            <a href={confirmData.link} className="text-[13px] text-teal break-all">
              {confirmData.link}
            </a>
          ) : (
            <div className="text-[13px] text-muted">
              Not published yet — your category coordinator will share it with you shortly.
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-extrabold">{category.label}</h2>
        <a href={`/categories/${category.slug}`} className="text-teal text-[12px] font-semibold whitespace-nowrap ml-3">
          Rules & Regulations →
        </a>
      </div>
      <p className="text-muted text-[12.5px] mb-5">{category.description}</p>

      <EmberProgress
        step={step}
        total={3}
        labels={category.hasSubmission === false ? ["Your Details", "Institution", "Review"] : ["Your Details", "Institution", "Submission"]}
      />

      {step === 1 && (
        <Card>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />
          {category.supportsGroupEntry && (
            <Field label="Entry type" required>
              <div className="flex gap-2">
                {[
                  { value: "individual", label: "Individual" },
                  { value: "group", label: "Group" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("entryType", opt.value)}
                    className={`flex-1 text-sm font-semibold py-2.5 rounded-lg border ${
                      form.entryType === opt.value
                        ? "bg-ember text-ink border-transparent"
                        : "bg-surfaceAlt text-muted border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label={form.entryType === "group" ? "Group leader name" : "Full name"} required>
            <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
          </Field>
          {form.entryType === "group" && (
            <Field label="Team members" hint="Comma-separated names, optional">
              <Input value={form.teamMembers} onChange={(e) => update("teamMembers", e.target.value)} placeholder="e.g. Kavindu, Nethmi, Sahan" />
            </Field>
          )}
          <Field label="Name with initials" required hint="As it should appear on your certificate">
            <Input value={form.nameWithInitials} onChange={(e) => update("nameWithInitials", e.target.value)} />
            {errors.nameWithInitials && <ErrorText>{errors.nameWithInitials}</ErrorText>}
          </Field>
          <Field label="Contact No (WhatsApp)" required>
            <Input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="07XXXXXXXX" />
            {errors.contact && <ErrorText>{errors.contact}</ErrorText>}
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </Field>
          <Field label="Age category" required>
            <Select value={form.ageCategory} onChange={(e) => update("ageCategory", e.target.value)}>
              <option value="">Select</option>
              {category.ageCategories.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            {errors.ageCategory && <ErrorText>{errors.ageCategory}</ErrorText>}
          </Field>
          {category.subCategories && (
            <Field label="Sub-category" required>
              <Select value={form.subCategory} onChange={(e) => update("subCategory", e.target.value)}>
                <option value="">Select</option>
                {category.subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              {errors.subCategory && <ErrorText>{errors.subCategory}</ErrorText>}
            </Field>
          )}
          {category.nestedSubCategories && (
            <>
              <Field label="Event" required>
                <Select
                  value={form.eventType}
                  onChange={(e) => {
                    update("eventType", e.target.value);
                    update("language", "");
                  }}
                >
                  <option value="">Select</option>
                  {Object.keys(category.nestedSubCategories).map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </Select>
                {errors.eventType && <ErrorText>{errors.eventType}</ErrorText>}
              </Field>
              {form.eventType && (
                <Field label="Language" required>
                  <Select value={form.language} onChange={(e) => update("language", e.target.value)}>
                    <option value="">Select</option>
                    {category.nestedSubCategories[form.eventType].map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </Select>
                  {errors.language && <ErrorText>{errors.language}</ErrorText>}
                </Field>
              )}
            </>
          )}

          {customFields.length > 0 && (
            <>
              <div className="h-px bg-border my-4" />
              {customFields.map((f) => (
                <CustomFieldInput
                  key={f.key}
                  field={f}
                  value={customValues[f.key]}
                  onChange={(v) => updateCustom(f.key, v)}
                  error={errors[`custom_${f.key}`]}
                />
              ))}
            </>
          )}

          <div className="flex justify-end mt-2">
            <Button onClick={goNext}>Continue</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Field label="School / University" required hint="Only institutions already registered on Phoenix appear here">
            {loadingInstitutions ? (
              <div className="text-muted text-sm">Loading institutions…</div>
            ) : institutions.length === 0 ? (
              <div className="text-muted text-sm">
                No institutions registered yet — your school or university needs to complete{" "}
                <a href="/" className="text-teal">
                  institution registration
                </a>{" "}
                first.
              </div>
            ) : (
              <InstitutionSearchSelect
                institutions={institutions}
                value={form.institutionId}
                onChange={(id) => update("institutionId", id)}
              />
            )}
            {errors.institutionId && <ErrorText>{errors.institutionId}</ErrorText>}
          </Field>

          {selectedInstitution && (
            <div className="text-[12.5px] text-muted mt-2 mb-2">
              {selectedInstitution.address}
              {selectedInstitution.postal_code ? `, ${selectedInstitution.postal_code}` : ""}
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="text" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button onClick={goNext} disabled={institutions.length === 0}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div className="text-[13px] text-muted mb-3">Review before submitting</div>
          <ReviewRow label={form.entryType === "group" ? "Group leader" : "Name"} value={form.fullName} />
          {form.entryType === "group" && form.teamMembers && (
            <ReviewRow label="Team members" value={form.teamMembers} />
          )}
          <ReviewRow label="Age category" value={form.ageCategory} />
          {form.subCategory && <ReviewRow label="Sub-category" value={form.subCategory} />}
          {category.nestedSubCategories && (
            <ReviewRow label="Event" value={`${form.eventType} — ${form.language}`} />
          )}
          <ReviewRow label="Institution" value={formatInstitutionLabel(selectedInstitution)} />
          <ReviewRow label="Contact" value={form.contact} />
          {customFields.map((f) => (
            <ReviewRow
              key={f.key}
              label={f.label}
              value={f.type === "checkbox" ? (customValues[f.key] ? "Yes" : "No") : customValues[f.key] || "—"}
            />
          ))}

          {category.hasSubmission !== false && (
            <div className="mt-4">
              <Field label={category.submissionLabel} required hint={category.submissionHint}>
                <Input value={form.submissionLink} onChange={(e) => update("submissionLink", e.target.value)} placeholder="https://..." />
                {errors.submissionLink && <ErrorText>{errors.submissionLink}</ErrorText>}
              </Field>
            </div>
          )}

          {submitError && <ErrorText>{submitError}</ErrorText>}
          <label className="flex items-start gap-2 mt-4 text-[12.5px] text-muted">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-0.5 accent-flame1"
            />
            <span>
              I confirm this information is accurate and agree it may be stored and used for PHOENIX&apos;26
              registration and coordination purposes. See our{" "}
              <a href="/privacy" target="_blank" className="text-teal underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          <div className="flex justify-between mt-4">
            <Button variant="text" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.consent}>
              {submitting ? "Submitting…" : "Submit entry"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Renders one admin-defined extra question, in whichever input shape
// fits its type. Kept separate from the main form so the step-1 JSX
// above stays readable even as the number of field types grows.
function CustomFieldInput({ field, value, onChange, error }) {
  if (field.type === "checkbox") {
    return (
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id={`custom-${field.key}`}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-flame1"
        />
        <label htmlFor={`custom-${field.key}`} className="text-[13px]">
          {field.label} {field.required && <span className="text-flame1">*</span>}
        </label>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    );
  }

  if (field.type === "select") {
    const options = String(field.options || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <Field label={field.label} required={field.required} hint={field.hint}>
        <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
        {error && <ErrorText>{error}</ErrorText>}
      </Field>
    );
  }

  if (field.type === "textarea") {
    return (
      <Field label={field.label} required={field.required} hint={field.hint}>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none"
        />
        {error && <ErrorText>{error}</ErrorText>}
      </Field>
    );
  }

  const inputType = ["number", "email", "tel", "url"].includes(field.type) ? field.type : "text";
  return (
    <Field label={field.label} required={field.required} hint={field.hint}>
      <Input type={inputType} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
    </Field>
  );
}
