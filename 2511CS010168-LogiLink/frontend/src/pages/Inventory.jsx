import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, CheckCircle2, Layers, Package, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Table from '../components/ui/Table.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { inventoryService } from '../services/inventoryService.js';
import { productService } from '../services/productService.js';
import { warehouseService } from '../services/warehouseService.js';

export default function Inventory() {
  const { notify } = useApp();
  const { data, loading, error, reload, setData } = useAsyncData(() => inventoryService.list(), []);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');

  // Modals state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [newQty, setNewQty] = useState(0);
  const [newReserved, setNewReserved] = useState(0);
  const [newReorder, setNewReorder] = useState(0);
  const [adjustError, setAdjustError] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Add Inventory Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [warehousesList, setWarehousesList] = useState([]);
  const [selectedProd, setSelectedProd] = useState('');
  const [selectedWh, setSelectedWh] = useState('');
  const [formQty, setFormQty] = useState(100);
  const [formReserved, setFormReserved] = useState(0);
  const [formReorder, setFormReorder] = useState(20);
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Create Product inline modal
  const [isNewProdOpen, setIsNewProdOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('General');
  const [newProdUnit, setNewProdUnit] = useState('units');
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdError, setNewProdError] = useState('');
  const [isCreatingProd, setIsCreatingProd] = useState(false);

  // Delete Modal state
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load products and warehouses for dropdowns
  useEffect(() => {
    if (isAddOpen) {
      productService.list().then((res) => {
        setProductsList(res || []);
        if (res && res.length > 0 && !selectedProd) setSelectedProd(res[0].id || res[0].sku);
      }).catch(() => {});

      warehouseService.list().then((res) => {
        setWarehousesList(res || []);
        if (res && res.length > 0 && !selectedWh) setSelectedWh(res[0].id);
      }).catch(() => {});
    }
  }, [isAddOpen]);

  const items = data || [];

  // Extract unique warehouse list for filtering
  const uniqueWarehouses = useMemo(() => {
    const set = new Set();
    items.forEach((it) => { if (it.warehouse) set.add(it.warehouse); });
    return Array.from(set);
  }, [items]);

  const rows = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = status === 'All' || item.status === status;
      const matchesWh = selectedWarehouse === 'All' || item.warehouse === selectedWarehouse;
      const text = `${item.sku || ''} ${item.product || ''} ${item.category || ''} ${item.warehouse || ''}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      return matchesStatus && matchesWh && matchesSearch;
    });
  }, [items, search, status, selectedWarehouse]);

  // KPIs
  const totalQuantity = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const totalAvailable = items.reduce((sum, it) => sum + (it.available || 0), 0);
  const totalReserved = items.reduce((sum, it) => sum + (it.reserved || 0), 0);
  const lowStockCount = items.filter((it) => it.status === 'Low Stock' || it.status === 'Out of Stock').length;

  const openAdjust = (item) => {
    setAdjustItem(item);
    setNewQty(item.quantity || 0);
    setNewReserved(item.reserved || 0);
    setNewReorder(item.reorderLevel || 0);
    setAdjustError('');
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async () => {
    if (!adjustItem) return;
    if (Number(newQty) < 0) {
      setAdjustError('Quantity cannot be negative.');
      return;
    }
    if (Number(newReserved) < 0) {
      setAdjustError('Reserved quantity cannot be negative.');
      return;
    }
    if (Number(newReserved) > Number(newQty)) {
      setAdjustError('Reserved quantity cannot exceed total quantity.');
      return;
    }

    setAdjustError('');
    setIsAdjusting(true);
    try {
      const id = adjustItem.itemId || adjustItem.id;
      const payload = {
        quantity: Number(newQty),
        reserved: Number(newReserved),
        reorderLevel: Number(newReorder),
      };
      const updated = await inventoryService.adjust(id, payload);
      setData(items.map((it) => (it.itemId === adjustItem.itemId || it.id === adjustItem.id ? updated : it)));
      notify(`Stock updated for ${adjustItem.sku}.`);
      setIsAdjustOpen(false);
    } catch (err) {
      setAdjustError(err.message || 'Failed to adjust stock.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleAddInventory = async () => {
    if (!selectedProd) {
      setAddError('Please select a product.');
      return;
    }
    if (!selectedWh) {
      setAddError('Please select a warehouse.');
      return;
    }
    if (Number(formQty) < 0) {
      setAddError('Quantity cannot be negative.');
      return;
    }
    if (Number(formReserved) < 0) {
      setAddError('Reserved cannot be negative.');
      return;
    }
    if (Number(formReserved) > Number(formQty)) {
      setAddError('Reserved cannot exceed total quantity.');
      return;
    }

    setAddError('');
    setIsAdding(true);
    try {
      const payload = {
        productId: selectedProd,
        warehouseId: selectedWh,
        quantity: Number(formQty),
        reserved: Number(formReserved),
        reorderLevel: Number(formReorder),
      };
      const created = await inventoryService.create(payload);
      setData([created, ...items]);
      notify(`Inventory record created for ${created.sku} in ${created.warehouse}.`);
      setIsAddOpen(false);
    } catch (err) {
      setAddError(err.message || 'Failed to add inventory.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProdName.trim()) {
      setNewProdError('Product name is required.');
      return;
    }
    setNewProdError('');
    setIsCreatingProd(true);
    try {
      const payload = {
        name: newProdName.trim(),
        sku: newProdSku.trim() || undefined,
        category: newProdCategory.trim() || 'General',
        unit: newProdUnit.trim() || 'units',
        price: Number(newProdPrice) || 0,
        status: 'Active',
      };
      const created = await productService.create(payload);
      setProductsList([created, ...productsList]);
      setSelectedProd(created.sku || created.id);
      notify(`Product ${created.name} (${created.sku}) created.`);
      setIsNewProdOpen(false);
      setNewProdName('');
      setNewProdSku('');
    } catch (err) {
      setNewProdError(err.message || 'Failed to create product.');
    } finally {
      setIsCreatingProd(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const id = deleteItem.itemId || deleteItem.id;
      await inventoryService.delete(id);
      setData(items.filter((it) => it.itemId !== deleteItem.itemId && it.id !== deleteItem.id));
      notify(`Inventory item ${deleteItem.sku} deleted.`);
      setDeleteItem(null);
    } catch (err) {
      notify(err.message || 'Failed to delete inventory item.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingState title="Loading inventory" />;
  if (error) return <ErrorState title="Failed to load inventory" description={error.message} onRetry={reload} />;

  const getBadgeVariant = (st) => {
    if (st === 'In Stock') return 'success';
    if (st === 'Low Stock') return 'warning';
    return 'danger';
  };

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      render: (row) => <strong>{row.sku}</strong>,
    },
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    {
      key: 'warehouse',
      label: 'Warehouse',
      render: (row) => (
        <Link
          to={`/warehouse/${row.warehouseCode || row.warehouseId || row.warehouse}`}
          style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
        >
          {row.warehouse}
        </Link>
      ),
    },
    {
      key: 'quantity',
      label: 'Total Qty',
      render: (row) => `${(row.quantity || 0).toLocaleString()} ${row.unit || 'units'}`,
    },
    {
      key: 'reserved',
      label: 'Reserved',
      render: (row) => (row.reserved || 0).toLocaleString(),
    },
    {
      key: 'available',
      label: 'Available',
      render: (row) => (
        <strong style={{ color: (row.available || 0) <= (row.reorderLevel || 0) ? '#d97706' : 'inherit' }}>
          {(row.available || 0).toLocaleString()}
        </strong>
      ),
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      render: (row) => (row.reorderLevel || 0).toLocaleString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={getBadgeVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="secondary" onClick={() => openAdjust(row)}>
            <SlidersHorizontal size={14} /> Adjust
          </Button>
          <Button variant="ghost" onClick={() => setDeleteItem(row)} title="Delete item">
            <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Inventory Management"
        description="Monitor SKU availability, reservations, reorder thresholds, and stock exceptions across warehouses."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon={Package} onClick={() => { setIsNewProdOpen(true); setNewProdError(''); }}>
              New Product
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => { setIsAddOpen(true); setAddError(''); }}>
              Add Inventory
            </Button>
          </div>
        }
      />

      <div className="grid cols-4">
        <KpiCard icon={Boxes} label="Total Stock Units" value={totalQuantity.toLocaleString()} trend="+4%" support="across network" />
        <KpiCard icon={CheckCircle2} label="Available Stock" value={totalAvailable.toLocaleString()} trend="+2%" support="ready to allocate" />
        <KpiCard icon={Layers} label="Reserved Units" value={totalReserved.toLocaleString()} trend="+12" support="staged for orders" />
        <KpiCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={lowStockCount}
          trend={lowStockCount > 0 ? `${lowStockCount} items` : 'Optimal'}
          trendDirection={lowStockCount > 0 ? 'down' : 'up'}
          support="reorder alerts"
        />
      </div>

      <Card style={{ marginTop: 16 }}>
        <div className="toolbar" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            <Input
              style={{ minWidth: 240 }}
              placeholder="Search SKU, product, warehouse..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Inventory status">
              {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            {uniqueWarehouses.length > 0 && (
              <Select value={selectedWarehouse} onChange={(event) => setSelectedWarehouse(event.target.value)} aria-label="Filter warehouse">
                <option value="All">All Warehouses</option>
                {uniqueWarehouses.map((wh) => (
                  <option key={wh} value={wh}>{wh}</option>
                ))}
              </Select>
            )}
          </div>
        </div>

        <Table columns={columns} rows={rows} emptyTitle="No inventory matches filters" />
      </Card>

      {/* Stock Adjustment Modal */}
      {isAdjustOpen && adjustItem && (
        <Modal
          title={`Stock Adjustment: ${adjustItem.sku} (${adjustItem.product})`}
          confirmLabel={isAdjusting ? 'Saving...' : 'Save Stock Adjustment'}
          onConfirm={handleAdjustSubmit}
          onClose={() => setIsAdjustOpen(false)}
        >
          {adjustError && <div style={{ color: 'var(--color-danger)', marginBottom: 12, fontSize: '0.875rem' }}>{adjustError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '8px 12px', background: 'var(--color-surface-subtle, rgba(255,255,255,0.04))', borderRadius: 6, fontSize: '0.875rem' }}>
              <div><strong>Facility:</strong> {adjustItem.warehouse}</div>
              <div><strong>Category:</strong> {adjustItem.category}</div>
            </div>

            <Field label="Total Physical Quantity" required>
              <Input
                type="number"
                min="0"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
              />
            </Field>

            <Field label="Reserved for Orders">
              <Input
                type="number"
                min="0"
                max={newQty}
                value={newReserved}
                onChange={(e) => setNewReserved(e.target.value)}
              />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Net Available Stock:</span>
              <strong style={{ color: Number(newQty) - Number(newReserved) <= Number(newReorder) ? '#d97706' : '#10b981' }}>
                {Math.max(0, Number(newQty) - Number(newReserved))} {adjustItem.unit || 'units'}
              </strong>
            </div>

            <Field label="Reorder Threshold Alert">
              <Input
                type="number"
                min="0"
                value={newReorder}
                onChange={(e) => setNewReorder(e.target.value)}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Add Inventory Modal */}
      {isAddOpen && (
        <Modal
          title="Add Inventory Item"
          confirmLabel={isAdding ? 'Adding...' : 'Add to Warehouse'}
          onConfirm={handleAddInventory}
          onClose={() => setIsAddOpen(false)}
        >
          {addError && <div style={{ color: 'var(--color-danger)', marginBottom: 12, fontSize: '0.875rem' }}>{addError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Select Product" required>
              <Select value={selectedProd} onChange={(e) => setSelectedProd(e.target.value)}>
                {productsList.map((p) => (
                  <option key={p.id || p.sku} value={p.sku || p.id}>
                    {p.sku} — {p.name} ({p.category})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Target Warehouse" required>
              <Select value={selectedWh} onChange={(e) => setSelectedWh(e.target.value)}>
                {warehousesList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} — {w.name} ({w.location})
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Initial Quantity" required>
                <Input
                  type="number"
                  min="0"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                />
              </Field>

              <Field label="Reserved Quantity">
                <Input
                  type="number"
                  min="0"
                  value={formReserved}
                  onChange={(e) => setFormReserved(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Reorder Threshold Alert">
              <Input
                type="number"
                min="0"
                value={formReorder}
                onChange={(e) => setFormReorder(e.target.value)}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* New Product Modal */}
      {isNewProdOpen && (
        <Modal
          title="Create New Product Catalog Item"
          confirmLabel={isCreatingProd ? 'Creating...' : 'Create Product'}
          onConfirm={handleCreateProduct}
          onClose={() => setIsNewProdOpen(false)}
        >
          {newProdError && <div style={{ color: 'var(--color-danger)', marginBottom: 12, fontSize: '0.875rem' }}>{newProdError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Product Name" required>
              <Input
                placeholder="e.g. Industrial Solar Panels"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
              />
            </Field>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="SKU Code (Auto-generated if blank)">
                <Input
                  placeholder="e.g. SKU-SOL-9901"
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                />
              </Field>

              <Field label="Category">
                <Input
                  placeholder="e.g. Energy / Solar"
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Unit of Measure">
                <Input
                  placeholder="e.g. units, crates, rolls"
                  value={newProdUnit}
                  onChange={(e) => setNewProdUnit(e.target.value)}
                />
              </Field>

              <Field label="Unit Price ($)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <Modal
          title={`Remove Inventory Record?`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Remove Record'}
          danger
          onConfirm={handleDeleteItem}
          onClose={() => setDeleteItem(null)}
        >
          <p>
            Are you sure you want to remove the inventory record for <strong>{deleteItem.sku} ({deleteItem.product})</strong> at <strong>{deleteItem.warehouse}</strong>?
          </p>
        </Modal>
      )}
    </>
  );
}
