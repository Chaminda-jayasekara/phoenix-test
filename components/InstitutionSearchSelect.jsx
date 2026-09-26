"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { formatInstitutionLabel } from "@/lib/institutions";

const MAX_RESULTS = 50;

export default function InstitutionSearchSelect({ institutions, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);

  const selected = institutions.find((i) => i.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? institutions.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.district || "").toLowerCase().includes(q) ||
            (i.club_name || "").toLowerCase().includes(q) ||
            (i.representative_name || "").toLowerCase().includes(q)
        )
      : institutions;
    return list.slice(0, MAX_RESULTS);
  }, [institutions, query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlighted(0);
  }, [query, open]);

  function selectInstitution(inst) {
    onChange(inst.id);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) selectInstitution(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const displayValue = open ? query : selected ? formatInstitutionLabel(selected) : query;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type to search your institution…"
        autoComplete="off"
        className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-surface border border-border rounded-lg shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-muted text-sm">No institutions match &quot;{query}&quot;</div>
          ) : (
            <>
              {filtered.map((inst, i) => (
                <button
                  key={inst.id}
                  type="button"
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => selectInstitution(inst)}
                  className={`w-full text-left px-3 py-2.5 text-sm border-b border-border last:border-0 ${
                    i === highlighted ? "bg-surfaceAlt" : ""
                  }`}
                >
                  {formatInstitutionLabel(inst)}
                  {inst.district && <span className="text-muted text-[11px]"> ({inst.district})</span>}
                </button>
              ))}
              {institutions.length > MAX_RESULTS && filtered.length === MAX_RESULTS && (
                <div className="px-3 py-2 text-muted text-[11px] text-center">
                  Showing first {MAX_RESULTS} — keep typing to narrow it down
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
