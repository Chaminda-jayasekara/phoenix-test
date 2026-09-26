"use client";

import { useState, useTransition } from "react";
import { setAllCategoriesOpen } from "@/app/admin/actions";

// One-click "hide every category from the site" / "reopen every
// category" — instead of the admin editing each category individually
// when registrations close (or reopen) site-wide.
export default function CategoryBulkActions() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function run(open) {
    const message = open
      ? "Reopen registration for every category?"
      : "Close registration for every category? They'll all disappear from the site immediately.";
    if (!confirm(message)) return;
    setError("");
    startTransition(async () => {
      const result = await setAllCategoriesOpen(open);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => run(false)}
        disabled={isPending}
        className="text-danger text-[12.5px] font-semibold disabled:opacity-50"
      >
        Close all
      </button>
      <button
        onClick={() => run(true)}
        disabled={isPending}
        className="text-teal text-[12.5px] font-semibold disabled:opacity-50"
      >
        Open all
      </button>
      {error && <span className="text-danger text-[11.5px]">{error}</span>}
    </div>
  );
}
