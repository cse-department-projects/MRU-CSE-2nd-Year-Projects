export function Field({ label, required, error, children }) {
  return (
    <div className="field">
      {label && (
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Input(props) {
  return <input className="input" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="select" {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className="textarea" {...props} />;
}
