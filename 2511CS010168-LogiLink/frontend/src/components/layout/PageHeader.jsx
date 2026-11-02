export default function PageHeader({ title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="filters">{actions}</div>}
    </div>
  );
}
