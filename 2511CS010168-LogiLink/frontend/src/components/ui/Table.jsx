import { ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

export default function Table({ columns, rows, emptyTitle = 'No records found', emptyDescription, onSort }) {
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription || 'Try adjusting search or filter criteria.'} />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.sortable ? (
                  <button className="button ghost" type="button" onClick={() => onSort?.(column.key)}>
                    {column.label}
                    <ArrowUpDown size={14} />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.orderId || row.shipmentId || row.vehicleId || row.sku}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
