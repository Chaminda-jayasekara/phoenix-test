"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const MAX_RESULTS = 50;

// A type-to-search combobox over a plain list of strings — e.g. the
// government university list on the institution registration form.
// Mirrors InstitutionSearchSelect's interaction (type to filter,
// arrow keys + Enter to pick, click outside to close) but works off
// plain option strings instead of institution objects with ids.
export default function SearchableSelect({ options, value, onChange, placeholder = "Type to search…" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return list.slice(0, MAX_RESULTS);
  }, [options, query]);

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

  function selectOption(opt) {
    onChange(opt);
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
      if (filtered[highlighted]) selectOption(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const displayValue = open ? query : value || query;

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
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-surfaceAlt border border-border rounded-lg px-3 py-2.5 text-white text-sm outline-none"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-surface border border-border rounded-lg shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-muted text-sm">No match for &quot;{query}&quot;</div>
          ) : (
            <>
              {filtered.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => selectOption(opt)}
                  className={`w-full text-left px-3 py-2.5 text-sm border-b border-border last:border-0 ${
                    i === highlighted ? "bg-surfaceAlt" : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
              {options.length > MAX_RESULTS && filtered.length === MAX_RESULTS && (
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
