"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PROVINCES, GOVT_UNIVERSITIES } from "@/lib/data";
import SearchableSelect from "@/components/SearchableSelect";
import {
  EmberProgress,
  Field,
  Input,
  Select,
  Card,
  Button,
  ReviewRow,
  ErrorText,
  Divider,
} from "@/components/ui";

function emptyBearer() {
  return { name: "", contact: "", email: "" };
}

function emptyForm() {
  return {
    name: "",
    otherName: "",
    entryType: "club",
    clubName: "",
    representativeName: "",
    province: "",
    district: "",
    contact: "",
    email: "",
    address: "",
    postalCode: "",
    mic: emptyBearer(),
    president: emptyBearer(),
    secretary: emptyBearer(),
    // Honeypot: real visitors never see or fill this field. Any
    // automated script that fills every input on the page will fill
    // it, which is our signal to silently reject the submission.
    company: "",
    consent: false,
  };
}

export default function RegistrationForm({ type, whatsappLink }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmData, setConfirmData] = useState(null);

  // University clubs go through the full flow (club name + three office
  // bearers). A university entering as an individual only needs their
  // own name, contact, email and address — no club name, no office
  // bearers, no postal code step. Schools are unaffected either way.
  const isIndividual = type === "university" && form.entryType === "individual";

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function updateBearer(role, key, value) {
    setForm((f) => ({ ...f, [role]: { ...f[role], [key]: value } }));
  }

  function validateStep1() {
    const e = {};
    if (!form.name) e.name = "Required";
    if (form.name === "Other" && !form.otherName) e.otherName = "Required";
    if (type === "university" && form.entryType === "club" && !form.clubName) e.clubName = "Required";
    if (isIndividual && !form.representativeName) e.representativeName = "Required";
    if (type === "school") {
      if (!form.province) e.province = "Required";
      if (!form.district) e.district = "Required";
    }
    if (!form.email) e.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if ((type === "school" || isIndividual) && !form.contact) e.contact = "Required";
    if (!form.address) e.address = "Required";
    if (!isIndividual && !form.postalCode) e.postalCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    ["mic", "president", "secretary"].forEach((role) => {
      if (!form[role].name) e[`${role}Name`] = "Required";
      if (!form[role].contact) e[`${role}Contact`] = "Required";
      if (!form[role].email) e[`${role}Email`] = "Required";
      else if (!/^\S+@\S+\.\S+$/.test(form[role].email)) e[`${role}Email`] = "Invalid email";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    // An individual entrant has nothing to fill in for the office
    // bearers step, so it's skipped entirely — straight to review.
    if (step === 1 && validateStep1()) setStep(isIndividual ? 3 : 2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  async function handleSubmit() {
    // Honeypot check: a real user never fills this field, since it's
    // never visibly rendered. Silently pretend success rather than
    // showing an error, so we don't tip off the bot about the block.
    if (form.company) {
      setConfirmData({ id: "—", link: null, name: "Registration" });
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const institutionName = form.name === "Other" ? form.otherName : form.name;

      // Generate the ID on the client so we never need to read the row
      // back from the server (anon only has INSERT permission, not
      // SELECT — this keeps registrations write-only from the public
      // side, and avoids needing a SELECT policy just to get an id back).
      const institutionId = crypto.randomUUID();

      const { error: instErr } = await supabase.from("institutions").insert({
        id: institutionId,
        type,
        name: institutionName,
        entry_type: type === "university" ? form.entryType : null,
        club_name: type === "university" && form.entryType === "club" ? form.clubName : null,
        representative_name: isIndividual ? form.representativeName : null,
        province: type === "school" ? form.province : null,
        district: type === "school" ? form.district : null,
        contact: form.contact || null,
        email: form.email,
        address: form.address,
        postal_code: isIndividual ? null : form.postalCode,
      });

      if (instErr) throw instErr;

      // Individual entrants have no office bearers — they are the sole
      // registrant, already captured on the institution row itself.
      if (!isIndividual) {
        const bearerRows = ["mic", "president", "secretary"].map((role) => ({
          institution_id: institutionId,
          role,
          name: form[role].name,
          contact: form[role].contact,
          email: form[role].email,
        }));

        const { error: bearerErr } = await supabase.from("office_bearers").insert(bearerRows);
        if (bearerErr) throw bearerErr;
      }

      const link = whatsappLink || null;
      const displayName = isIndividual
        ? `${form.representativeName} — ${institutionName}`
        : type === "university" && form.clubName
        ? `${form.clubName} — ${institutionName}`
        : institutionName;

      setConfirmData({ id: institutionId, link, name: displayName });
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong saving your registration. Please try again.");
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
        <h2 className="text-[22px] font-extrabold">You're registered!</h2>
        <p className="text-muted text-sm mt-1.5">{confirmData.name} has been added to Phoenix.</p>
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
              Not published yet — the Phoenix&apos;26 team will share it with you shortly.
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold mb-5">
        {type === "school" ? "School" : "University"} Registration
      </h2>

      {isIndividual ? (
        <EmberProgress step={step === 3 ? 2 : 1} total={2} labels={["Your Details", "Review"]} />
      ) : (
        <EmberProgress step={step} total={3} labels={["Institution", "Office Bearers", "Review"]} />
      )}

      {step === 1 && (
        <Card>
          {/* Honeypot — invisible to real users, catches basic bots that
              fill every field on a page. tabIndex/autoComplete keep it
              out of the way of keyboard users and password managers. */}
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={(e) => updateField("company", e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />
          {type === "school" ? (
            <Field label="School name" required>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Nalanda College" />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </Field>
          ) : (
            <Field label="University name" required>
              <SearchableSelect
                options={GOVT_UNIVERSITIES}
                value={form.name}
                onChange={(v) => updateField("name", v)}
                placeholder="Type to search your university…"
              />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
              {form.name === "Other" && (
                <div className="mt-2">
                  <Input value={form.otherName} onChange={(e) => updateField("otherName", e.target.value)} placeholder="Enter university name" />
                  {errors.otherName && <ErrorText>{errors.otherName}</ErrorText>}
                </div>
              )}
            </Field>
          )}

          {type === "university" && (
            <Field label="Registering as" required>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField("entryType", "club")}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                    form.entryType === "club"
                      ? "bg-ember text-[#1A0E06] border-transparent"
                      : "bg-surfaceAlt text-muted border-border"
                  }`}
                >
                  Club
                </button>
                <button
                  type="button"
                  onClick={() => updateField("entryType", "individual")}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                    form.entryType === "individual"
                      ? "bg-ember text-[#1A0E06] border-transparent"
                      : "bg-surfaceAlt text-muted border-border"
                  }`}
                >
                  Individual
                </button>
              </div>
            </Field>
          )}

          {type === "university" && form.entryType === "club" && (
            <Field label="Club name" required hint="Some universities have more than one media club — this identifies which one is registering">
              <Input value={form.clubName} onChange={(e) => updateField("clubName", e.target.value)} placeholder="e.g. Ray Media Unit" />
              {errors.clubName && <ErrorText>{errors.clubName}</ErrorText>}
            </Field>
          )}

          {isIndividual && (
            <Field label="Your full name" required>
              <Input
                value={form.representativeName}
                onChange={(e) => updateField("representativeName", e.target.value)}
                placeholder="e.g. Nimal Perera"
              />
              {errors.representativeName && <ErrorText>{errors.representativeName}</ErrorText>}
            </Field>
          )}

          {type === "school" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Province" required>
                <Select
                  value={form.province}
                  onChange={(e) => {
                    updateField("province", e.target.value);
                    updateField("district", "");
                  }}
                >
                  <option value="">Select</option>
                  {Object.keys(PROVINCES).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                {errors.province && <ErrorText>{errors.province}</ErrorText>}
              </Field>
              <Field label="District" required>
                <Select value={form.district} onChange={(e) => updateField("district", e.target.value)} disabled={!form.province}>
                  <option value="">Select</option>
                  {(PROVINCES[form.province] || []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                {errors.district && <ErrorText>{errors.district}</ErrorText>}
              </Field>
            </div>
          )}

          <Field
            label="Contact No"
            required={type === "school" || isIndividual}
            hint={type === "university" && !isIndividual ? "Optional" : undefined}
          >
            <Input value={form.contact} onChange={(e) => updateField("contact", e.target.value)} placeholder="07XXXXXXXX" />
            {errors.contact && <ErrorText>{errors.contact}</ErrorText>}
          </Field>

          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="office@institution.lk" />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </Field>

          <Field label="Address" required>
            <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            {errors.address && <ErrorText>{errors.address}</ErrorText>}
          </Field>

          {!isIndividual && (
            <Field label="Postal Code" required>
              <Input value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
              {errors.postalCode && <ErrorText>{errors.postalCode}</ErrorText>}
            </Field>
          )}

          <div className="flex justify-end mt-2">
            <Button onClick={goNext}>Continue</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <BearerBlock
            title={type === "university" ? "Senior Treasurer / MIC" : "MIC"}
            role="mic"
            form={form}
            errors={errors}
            updateBearer={updateBearer}
          />
          <Divider />
          <BearerBlock title="President" role="president" form={form} errors={errors} updateBearer={updateBearer} />
          <Divider />
          <BearerBlock title="Secretary" role="secretary" form={form} errors={errors} updateBearer={updateBearer} />

          <div className="flex justify-between mt-2">
            <Button variant="text" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div className="text-[13px] text-muted mb-3">Review before submitting</div>
          <ReviewRow label="Institution" value={form.name === "Other" ? form.otherName : form.name} />
          {type === "university" && (
            <ReviewRow label={isIndividual ? "Registering as" : "Club name"} value={isIndividual ? "Individual" : form.clubName} />
          )}
          {isIndividual && <ReviewRow label="Your name" value={form.representativeName} />}
          {type === "school" && <ReviewRow label="Location" value={`${form.district}, ${form.province}`} />}
          <ReviewRow label="Email" value={form.email} />
          <ReviewRow label="Contact" value={form.contact || "—"} />
          <ReviewRow label="Address" value={isIndividual ? form.address : `${form.address}, ${form.postalCode}`} />
          {!isIndividual &&
            ["mic", "president", "secretary"].map((role) => (
              <ReviewRow
                key={role}
                label={role === "mic" ? (type === "university" ? "Sr. Treasurer/MIC" : "MIC") : role[0].toUpperCase() + role.slice(1)}
                value={`${form[role].name} · ${form[role].contact}`}
              />
            ))}
          {submitError && <ErrorText>{submitError}</ErrorText>}
          <label className="flex items-start gap-2 mt-4 text-[12.5px] text-muted">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
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
          <div className="flex justify-between mt-5">
            <Button variant="text" onClick={() => setStep(isIndividual ? 1 : 2)}>
              ← Back
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.consent}>
              {submitting ? "Submitting…" : "Submit registration"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function BearerBlock({ title, role, form, errors, updateBearer }) {
  return (
    <div>
      <div className="font-bold text-[13.5px] mb-2.5 text-flame2">{title}</div>
      <Field label="Name" required>
        <Input value={form[role].name} onChange={(e) => updateBearer(role, "name", e.target.value)} />
        {errors[`${role}Name`] && <ErrorText>{errors[`${role}Name`]}</ErrorText>}
      </Field>
      <Field label="Contact No (WhatsApp)" required>
        <Input value={form[role].contact} onChange={(e) => updateBearer(role, "contact", e.target.value)} placeholder="07XXXXXXXX" />
        {errors[`${role}Contact`] && <ErrorText>{errors[`${role}Contact`]}</ErrorText>}
      </Field>
      <Field label="Email" required>
        <Input type="email" value={form[role].email} onChange={(e) => updateBearer(role, "email", e.target.value)} />
        {errors[`${role}Email`] && <ErrorText>{errors[`${role}Email`]}</ErrorText>}
      </Field>
    </div>
  );
}
