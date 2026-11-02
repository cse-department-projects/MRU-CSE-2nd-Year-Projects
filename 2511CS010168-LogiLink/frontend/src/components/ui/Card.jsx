export default function Card({ title, subtitle, action, children, className = '', ...props }) {
  return (
    <section className={`card ${className}`.trim()} {...props}>
      {(title || subtitle || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}
