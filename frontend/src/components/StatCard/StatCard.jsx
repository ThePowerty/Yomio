export function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
