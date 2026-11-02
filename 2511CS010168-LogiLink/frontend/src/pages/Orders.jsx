import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Truck, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge, { PriorityBadge } from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Table from '../components/ui/Table.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { orderService } from '../services/orderService.js';

const statuses = ['All', 'Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'];

export default function Orders() {
  const { notify } = useApp();
  const { data, loading, setData } = useAsyncData(() => orderService.list(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  const rows = useMemo(() => (data || []).filter((order) => {
    const matchesStatus = status === 'All' || order.status === status;
    const matchesPriority = priority === 'All' || order.priority === priority;
    const text = `${order.orderId} ${order.customer} ${order.origin} ${order.destination} ${order.cargo}`.toLowerCase();
    return matchesStatus && matchesPriority && text.includes(search.toLowerCase());
  }), [data, search, status, priority]);

  const columns = [
    { key: 'orderId', label: 'Order ID', sortable: true },
    { key: 'customer', label: 'Customer' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'weight', label: 'Weight' },
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority}>{row.priority}</PriorityBadge> },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'eta', label: 'ETA' },
    { key: 'createdDate', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Link className="button secondary" to={`/orders/${row.id}`}>View</Link>
          <button className="icon-button" title="Assign vehicle" onClick={() => notify(`Vehicle assignment opened for ${row.orderId}.`)}><Truck size={16} /></button>
          <button className="icon-button" title="Assign driver" onClick={() => notify(`Driver assignment opened for ${row.orderId}.`)}><UserCheck size={16} /></button>
          <button className="icon-button" title="Cancel order" onClick={() => setConfirm(row)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  const paged = rows.slice((page - 1) * 5, page * 5);
  const totalPages = Math.max(1, Math.ceil(rows.length / 5));

  if (loading) return <LoadingState title="Loading orders" />;

  return (
    <>
      <PageHeader
        title="Order Management"
        description="Search, filter, assign, update, and cancel logistics orders from one control surface."
        actions={<Link className="button primary" to="/orders/new"><Plus size={16} /> Add order</Link>}
      />
      <Card>
        <div className="toolbar">
          <div className="filters">
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#6b7280' }} />
              <Input style={{ paddingLeft: 38 }} placeholder="Search orders..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority filter">
              {['All', 'Critical', 'High', 'Express', 'Standard'].map((item) => <option key={item}>{item}</option>)}
            </Select>
            <Input type="date" aria-label="Date filter" />
          </div>
          <Tabs tabs={statuses} active={status} onChange={(next) => { setStatus(next); setPage(1); }} />
        </div>
        <Table columns={columns} rows={paged} emptyTitle="No matching orders" />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
      {confirm && (
        <Modal
          title={`Cancel ${confirm.orderId}?`}
          confirmLabel="Cancel order"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            try {
              await orderService.updateStatus(confirm.id, 'Cancelled');
              setData(data.map((order) => order.id === confirm.id ? { ...order, status: 'Cancelled' } : order));
              notify(`${confirm.orderId} moved to Cancelled.`);
              setConfirm(null);
            } catch (error) {
              notify(error.message, 'danger');
            }
          }}
        >
          This action will move the order into Cancelled status for operations review.
        </Modal>
      )}
    </>
  );
}
