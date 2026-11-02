import { X } from 'lucide-react';
import Button from './Button.jsx';

export default function Modal({ open = true, title, children, confirmLabel = 'Confirm', onConfirm, onClose, danger, actions }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {actions ? (
          <div className="modal-footer">{actions}</div>
        ) : onConfirm ? (
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
