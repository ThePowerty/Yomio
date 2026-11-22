import "./LoadingSkeleton.css";

function Bone({ className = "" }) {
  return <span className={`skeleton-bone${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}

function MediaCardSkeleton() {
  return <article className="skeleton-media-card" aria-hidden="true"><Bone className="skeleton-media-image" /><div><Bone className="skeleton-line short" /><Bone className="skeleton-line" /><Bone className="skeleton-line medium" /></div></article>;
}

function ListItemSkeleton() {
  return <div className="skeleton-list-item" aria-hidden="true"><Bone className="skeleton-thumbnail" /><div><Bone className="skeleton-line medium" /><Bone className="skeleton-line" /><Bone className="skeleton-line short" /></div></div>;
}

export function LoadingSkeleton({ variant = "list", count, label = "Cargando…", compact = false }) {
  const className = `loading-skeleton loading-skeleton-${variant}${compact ? " compact" : ""}`;
  let content;

  if (variant === "media-grid") {
    content = Array.from({ length: count ?? 8 }, (_, index) => <MediaCardSkeleton key={index} />);
  } else if (variant === "stats") {
    content = Array.from({ length: count ?? 4 }, (_, index) => <div className="skeleton-stat-card" key={index} aria-hidden="true"><Bone className="skeleton-icon" /><Bone className="skeleton-line medium" /><Bone className="skeleton-value" /><Bone className="skeleton-line" /></div>);
  } else if (variant === "table") {
    content = <div className="skeleton-table" aria-hidden="true">{Array.from({ length: count ?? 6 }, (_, row) => <div className="skeleton-table-row" key={row}>{Array.from({ length: 5 }, (_, column) => <Bone className={`skeleton-line${column === 1 ? " long" : column > 2 ? " short" : ""}`} key={column} />)}</div>)}</div>;
  } else if (variant === "calendar") {
    content = <div className="skeleton-calendar" aria-hidden="true">{Array.from({ length: 42 }, (_, index) => <Bone className="skeleton-calendar-day" key={index} />)}</div>;
  } else if (variant === "detail") {
    content = <div className="skeleton-detail" aria-hidden="true"><Bone className="skeleton-detail-cover" /><div className="skeleton-detail-copy"><Bone className="skeleton-line short" /><Bone className="skeleton-heading" /><Bone className="skeleton-line medium" /><Bone className="skeleton-line" /><Bone className="skeleton-line" /><Bone className="skeleton-line medium" /></div></div>;
  } else {
    content = Array.from({ length: count ?? 3 }, (_, index) => <ListItemSkeleton key={index} />);
  }

  return <div className={className} role="status" aria-live="polite" aria-label={label}><span className="sr-only">{label}</span>{content}</div>;
}
