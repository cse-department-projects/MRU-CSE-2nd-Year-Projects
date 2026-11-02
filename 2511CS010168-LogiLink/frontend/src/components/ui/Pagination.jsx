import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button.jsx';

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} /> Previous
      </Button>
      <span>
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next <ChevronRight size={16} />
      </Button>
    </div>
  );
}
