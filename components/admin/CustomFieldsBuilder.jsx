"use client";

import { useState } from "react";

const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "url", label: "Link" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox (yes/no)" },
];

function slugifyKey(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function emptyField() {
  return { key: "", label: "", type: "text", required: false, options: "", hint: "" };
}

// Lets the admin build the extra questions shown on this category's
// registration form — e.g. "T-shirt size" as a dropdown, "Dietary
// requirements" as optional free text. Renders its own hidden input
// (name="customFields") holding the whole list as JSON, so the parent
// <form> and its server action (upsertCategory) don't need to know
// anything about this UI — they just read one field.
export default function CustomFieldsBuilder({ initial }) {
  const [fields, setFields] = useState(() =>
    Array.isArray(initial) && initial.length > 0
      ? initial.map((f) => ({
          key: f.key || "",
          label: f.label || "",
          type: f.type || "text",
          required: !!f.required,
          options: f.options || "",
          hint: f.hint || "",
        }))
      : []
  );

  function addField() {
    setFields((list) => [...list, emptyField()]);
  }
  function removeField(idx) {
    setFields((list) => list.filter((_, i) => i !== idx));
  }
  function updateField(idx, key, value) {
    setFields((list) =>
      list.map((f, i) => {
        if (i !== idx) return f;
        const next = { ...f, [key]: value };
        // Auto-derive a machine key from the label until the admin
        // edits the key by hand — most admins will never touch it.
        if (key === "label" && !f._keyTouched) next.key = slugifyKey(value);
        return next;
      })
    );
  }
  function touchKey(idx, value) {
    setFields((list) =>
      list.map((f, i) => (i === idx ? { ...f, key: slugifyKey(value), _keyTouched: true } : f))
    );
  }
  function move(idx, dir) {
    setFields((list) => {
      const next = [...list];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return list;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  const duplicateKeys = new Set(
    fields
      .map((f) => f.key)
      .filter((k, i, arr) => k && arr.indexOf(k) !== i)
  );

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="block text-[12.5px] text-muted tracking-wide">Custom form fields</span>
        <button
          type="button"
          onClick={addField}
          className="text-flame2 text-[12.5px] font-semibold"
        >
          + Add field
        </button>
      </div>
      <p className="text-[11px] text-muted mb-3">
        Extra questions shown on this category&apos;s registration form, after the standard fields. Remove a
        field here to take it off the form — past answers already saved stay on record.
      </p>

      {fields.length === 0 && (
        <div className="text-muted text-[12.5px] border border-dashed border-border rounded-lg px-3 py-4 text-center">
          No custom fields yet.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((f, idx) => (
          <div key={idx} className="bg-surfaceAlt border border-border rounded-lg p-3">
            <div className="flex gap-2 mb-2">
              <input
                value={f.label}
                onChange={(e) => updateField(idx, "label", e.target.value)}
                placeholder="Question label, e.g. T-Shirt Size"
                className="flex-1 bg-surface border border-border rounded-md px-2.5 py-2 text-white text-[13px] outline-none"
              />
              <select
                value={f.type}
                onChange={(e) => updateField(idx, "type", e.target.value)}
                className="bg-surface border border-border rounded-md px-2 py-2 text-white text-[12.5px] outline-none"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {f.type === "select" && (
              <input
                value={f.options}
                onChange={(e) => updateField(idx, "options", e.target.value)}
                placeholder="Options, comma-separated, e.g. Small, Medium, Large"
                className="w-full bg-surface border border-border rounded-md px-2.5 py-2 text-white text-[12.5px] outline-none mb-2"
              />
            )}

            <input
              value={f.hint}
              onChange={(e) => updateField(idx, "hint", e.target.value)}
              placeholder="Optional hint text shown under the field"
              className="w-full bg-surface border border-border rounded-md px-2.5 py-2 text-white text-[12.5px] outline-none mb-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[12px] text-muted">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => updateField(idx, "required", e.target.checked)}
                    className="accent-flame1"
                  />
                  Required
                </label>
                <input
                  value={f.key}
                  onChange={(e) => touchKey(idx, e.target.value)}
                  placeholder="key"
                  title="Internal key used in exports — usually leave this alone"
                  className={`w-28 bg-surface border rounded-md px-2 py-1 text-[11px] font-mono outline-none ${
                    duplicateKeys.has(f.key) ? "border-danger text-danger" : "border-border text-muted"
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-muted text-[12px] disabled:opacity-30">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === fields.length - 1}
                  className="text-muted text-[12px] disabled:opacity-30"
                >
                  ↓
                </button>
                <button type="button" onClick={() => removeField(idx)} className="text-danger text-[12px] font-semibold">
                  Remove
                </button>
              </div>
            </div>
            {duplicateKeys.has(f.key) && (
              <div className="text-danger text-[11px] mt-1.5">
                This key is used by another field above — give it a unique key.
              </div>
            )}
          </div>
        ))}
      </div>

      <input type="hidden" name="customFields" value={JSON.stringify(fields)} />
    </div>
  );
}
