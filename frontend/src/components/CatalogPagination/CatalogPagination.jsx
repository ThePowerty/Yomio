import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CatalogPagination({ page, size, sizeOptions, totalItems, totalPages, disabled, onPageChange, onSizeChange }) {
  const { t } = useTranslation();
  if (totalItems === 0) return null;

  const pages = visiblePages(page, totalPages);
  const firstItem = page * size + 1;
  const lastItem = Math.min((page + 1) * size, totalItems);

  return (
    <nav className="catalog-pagination" aria-label={t("pagination.label")}>
      <span className="catalog-pagination-summary">
        {t("pagination.summary", { first: firstItem, last: lastItem, total: totalItems })}
      </span>
      <div className="catalog-pagination-pages">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={disabled || page === 0} aria-label={t("pagination.previous")}>
          <ChevronLeft size={17} />
        </button>
        {pages.map((item, index) => item === "ellipsis" ? (
          <span className="pagination-ellipsis" key={`ellipsis-${index}`}>…</span>
        ) : (
          <button type="button" className={item === page ? "active" : ""} key={item}
            onClick={() => onPageChange(item)} disabled={disabled} aria-current={item === page ? "page" : undefined}>
            {item + 1}
          </button>
        ))}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages - 1} aria-label={t("pagination.next")}>
          <ChevronRight size={17} />
        </button>
      </div>
      <label className="catalog-page-size">
        {t("pagination.perPage")}
        <select value={size} onChange={(event) => onSizeChange(Number(event.target.value))} disabled={disabled}>
          {sizeOptions.map((value) => <option value={value} key={value}>{value}</option>)}
        </select>
      </label>
    </nav>
  );
}

function visiblePages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index);
  const values = new Set([0, total - 1, current - 1, current, current + 1]);
  const sorted = [...values].filter((value) => value >= 0 && value < total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(value);
  });
  return result;
}
