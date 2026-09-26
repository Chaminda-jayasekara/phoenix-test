"use client";

import { deleteCategory } from "@/app/admin/actions";

export default function CategoryDeleteButton({ id }) {
  return (
    <button
      onClick={() => {
        if (confirm("Delete this category? This cannot be undone.")) {
          deleteCategory(id);
        }
      }}
      className="text-danger text-[12.5px] font-semibold"
    >
      Delete
    </button>
  );
}
