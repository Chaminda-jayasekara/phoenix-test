"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import TablePagination from "@/components/admin/TablePagination";

const PAGE_SIZE = 50;

function exportContestants(list, label, categories) {
  // Union of every custom field key used by categories present in this
  // export, so each gets its own column (blank where not applicable).
  const customKeys = [];
  categories.forEach((c) => {
    (c.customFields || []).forEach((f) => {
      if (!customKeys.find((k) => k.key === f.key)) customKeys.push(f);
    });
  });

  const rows = list.map((c) => {
    const row = {
      Name: c.full_name,
      "Name with Initials": c.name_with_initials,
      Category: c.category,
      "Sub-category": c.sub_category || "",
      "Age category": c.age_category,
      Contact: c.contact,
      Email: c.email,
      Institution: c.institution_name || "",
      Group: c.is_group ? "Yes" : "No",
      "Team members": c.team_members || "",
      "Submission link": c.submission_link || "",
      "Registered At": new Date(c.created_at).toLocaleString(),
    };
    customKeys.forEach((f) => {
      const val = (c.custom_field_values || {})[f.key];
      row[f.label] = f.type === "checkbox" ? (val ? "Yes" : val === false ? "No" : "") : val ?? "";
    });
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
  XLSX.writeFile(wb, `phoenix-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.xlsx`);
}

export default function CompetitorsTable({ contestants, categories }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = filter === "all" ? contestants : contestants.filter((c) => c.category === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.institution_name || "").toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contestants, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter(f) {
    setFilter(f);
    setPage(1);
  }
  function updateSearch(v) {
    setSearch(v);
    setPage(1);
  }

  const filterLabel = filter === "all" ? "All Competitors" : categoryLabel(filter, categories);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <FilterPill active={filter === "all"} onClick={() => updateFilter("all")} label="All" />
        {categories.map((c) => (
          <FilterPill
            key={c.dbCategory}
            active={filter === c.dbCategory}
            onClick={() => updateFilter(c.dbCategory)}
            label={c.label}
          />
        ))}
        <input
          placeholder="Search name, institution, email…"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="bg-surfaceAlt border border-border rounded-lg px-3 py-1.5 text-[12.5px] outline-none flex-1 min-w-[160px] text-white"
        />
        <button
          onClick={() => exportContestants(filtered, filterLabel, categories)}
          disabled={filtered.length === 0}
          className="text-[12px] px-3 py-1.5 rounded-full border border-teal text-teal font-semibold disabled:opacity-40 whitespace-nowrap"
        >
          ↓ Export Excel ({filtered.length})
        </button>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="bg-surfaceAlt text-muted text-left">
              <th className="px-3 py-2.5 font-semibold">Name</th>
              <th className="px-3 py-2.5 font-semibold">Category</th>
              <th className="px-3 py-2.5 font-semibold">Sub-category</th>
              <th className="px-3 py-2.5 font-semibold">Age</th>
              <th className="px-3 py-2.5 font-semibold">Institution</th>
              <th className="px-3 py-2.5 font-semibold">Registered</th>
              <th className="px-3 py-2.5 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c) => (
              <CompetitorRow
                key={c.id}
                c={c}
                categories={categories}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center text-muted text-sm py-8">No competitors match.</div>}
      </div>

      <TablePagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

function CompetitorRow({ c, categories, expanded, onToggle }) {
  return (
    <>
      <tr className="border-t border-border hover:bg-surfaceAlt/60 cursor-pointer" onClick={onToggle}>
        <td className="px-3 py-2.5 font-semibold">
          {c.full_name}
          {c.is_group && <span className="text-flame2 text-[10.5px] font-semibold ml-2">GROUP</span>}
        </td>
        <td className="px-3 py-2.5">{categoryLabel(c.category, categories)}</td>
        <td className="px-3 py-2.5">{c.sub_category || "—"}</td>
        <td className="px-3 py-2.5">{c.age_category}</td>
        <td className="px-3 py-2.5">{c.institution_name || "—"}</td>
        <td className="px-3 py-2.5 text-muted whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
        <td className="px-3 py-2.5 text-muted">{expanded ? "−" : "+"}</td>
      </tr>
      {expanded && (
        <tr className="border-t border-border bg-surfaceAlt/40">
          <td colSpan={7} className="px-3 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
              <div>
                <span className="text-muted">Name w/ initials: </span>
                {c.name_with_initials}
              </div>
              <div>
                <span className="text-muted">Contact: </span>
                {c.contact}
              </div>
              <div>
                <span className="text-muted">Email: </span>
                {c.email}
              </div>
              {c.is_group && c.team_members && (
                <div>
                  <span className="text-muted">Team: </span>
                  {c.team_members}
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-4">
                <span className="text-muted">Submission: </span>
                {c.submission_link ? (
                  <a href={c.submission_link} target="_blank" rel="noreferrer" className="text-teal break-all">
                    {c.submission_link}
                  </a>
                ) : (
                  "— (no submission required)"
                )}
              </div>
              {customFieldEntries(c, categories).map(({ label, value }) => (
                <div key={label}>
                  <span className="text-muted">{label}: </span>
                  {value}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function categoryLabel(dbCategory, categories) {
  return categories.find((c) => c.dbCategory === dbCategory)?.label || dbCategory;
}

function customFieldEntries(c, categories) {
  const fields = categories.find((cat) => cat.dbCategory === c.category)?.customFields || [];
  const values = c.custom_field_values || {};
  return fields
    .filter((f) => values[f.key] !== undefined && values[f.key] !== "")
    .map((f) => ({
      label: f.label,
      value: f.type === "checkbox" ? (values[f.key] ? "Yes" : "No") : String(values[f.key]),
    }));
}

function FilterPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] px-3 py-1.5 rounded-full border border-border font-semibold ${
        active ? "bg-ember text-ink" : "text-muted"
      }`}
    >
      {label}
    </button>
  );
}
