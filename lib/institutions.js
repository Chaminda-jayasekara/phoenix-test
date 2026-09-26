// A university registration alone doesn't uniquely identify who's
// registering, since some universities have more than one media club
// — or may have several individuals registering separately instead of
// a club. Everywhere an institution is shown — the search picker,
// admin tables, confirmation screens, exports — should use this so a
// university club always reads as "Club Name — University Name", an
// individual entrant reads as "Their Name (Individual) — University
// Name", and a school just shows its name.
export function formatInstitutionLabel(inst) {
  if (!inst) return "";
  if (inst.type === "university" && inst.club_name) {
    return `${inst.club_name} — ${inst.name}`;
  }
  if (inst.type === "university" && inst.entry_type === "individual" && inst.representative_name) {
    return `${inst.representative_name} (Individual) — ${inst.name}`;
  }
  return inst.name;
}
