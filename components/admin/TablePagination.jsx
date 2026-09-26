export default function TablePagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between mt-3 text-[12.5px] text-muted">
      <div>
        Showing {start}–{end} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-border font-semibold disabled:opacity-30"
        >
          ← Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-border font-semibold disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
