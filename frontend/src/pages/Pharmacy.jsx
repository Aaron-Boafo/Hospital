import { useState } from 'react';
import { useMedicines, useCreateMedicine, useUpdateMedicine, useDeleteMedicine } from '../hooks';
import { MEDICINE_CATEGORIES } from '../services/medicines';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiPackage,
  FiAlertTriangle, FiClock, FiDollarSign
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

const INITIAL_FORM = { name: '', category: MEDICINE_CATEGORIES[0], unitPrice: '', quantity: '', reorderLevel: '', expiryDate: '', supplier: '' };

const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '—');

export default function Pharmacy() {
  const { data: medicines = [], isLoading, error, refetch } = useMedicines();
  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();
  const deleteMutation = useDeleteMedicine();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(medicines.map(m => m.category))];

  const openAdd = () => { setEditing(null); setForm(INITIAL_FORM); setShowModal(true); };
  const openEdit = (m) => {
    setEditing(m.id);
    setForm({ name: m.name, category: m.category, unitPrice: String(m.unitPrice), quantity: String(m.quantity), reorderLevel: String(m.reorderLevel), expiryDate: m.expiryDate || '', supplier: m.supplier || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.unitPrice || form.quantity === '') return;
    const input = {
      name: form.name,
      category: form.category,
      unitPrice: parseFloat(form.unitPrice),
      quantity: parseInt(form.quantity),
      reorderLevel: parseInt(form.reorderLevel) || 0,
      expiryDate: form.expiryDate || undefined,
      supplier: form.supplier || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing, input }, { onSuccess: closeModal });
    } else {
      createMutation.mutate(input, { onSuccess: closeModal });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Delete this medicine?')) deleteMutation.mutate(id);
  };

  const submitError = editing ? updateMutation.error : createMutation.error;
  const mutating = editing ? updateMutation.isPending : createMutation.isPending;

  return (
    <>
      <PageHeader title="Pharmacy" subtitle="Medicine catalog and inventory management" />

      <div className="page-body fade-in">
        {error && (
          <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span>Failed to load medicines: {error.message}</span>
            <button className="btn btn-sm btn-secondary" onClick={() => refetch()}>Retry</button>
          </div>
        )}
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 180 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option>All</option>
              {categories.map(c => <option key={c}>{titleCase(c)}</option>)}
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {filtered.length} items • {medicines.filter(m => m.isLowStock).length} low stock
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Medicine</button>
            </div>
          </div>
        </div>

        {!isLoading && filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiPackage /></div>
            <h3>No medicines found</h3>
            <p>Try adjusting filters or add a new medicine</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {isLoading && (
              <p className="text-muted" style={{ padding: 24 }}>Loading…</p>
            )}
            {filtered.map(m => (
              <div key={m.id} className="card" style={{
                border: m.isExpired ? '1px solid var(--color-danger)' :
                  m.isLowStock ? '1px solid var(--color-warning)' : undefined,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: 2 }}>{m.name}</h4>
                    <span className="badge badge-accent">{titleCase(m.category)}</span>
                  </div>
                  {m.isExpired && <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>EXPIRED</span>}
                  {m.isExpiringSoon && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Expiring</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  <div><FiDollarSign style={{ verticalAlign: 'middle', marginRight: 4 }} /> GH₵{m.unitPrice}</div>
                  <div style={{ color: m.isLowStock ? 'var(--color-danger)' : 'var(--color-text-secondary)', fontWeight: m.isLowStock ? 600 : 400 }}>
                    <FiPackage style={{ verticalAlign: 'middle', marginRight: 4 }} /> Stock: {m.quantity}
                  </div>
                  <div><FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} /> {m.expiryDate || 'No expiry'}</div>
                  <div>Reorder: {m.reorderLevel}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}><FiEdit2 /> Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}><FiTrash2 /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {submitError && (
                  <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: 16 }}>
                    {submitError.message}
                  </div>
                )}
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amoxicillin 500mg" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {MEDICINE_CATEGORIES.map(c => <option key={c} value={c}>{titleCase(c)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unit Price (GH₵) *</label>
                    <input className="form-control" type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input className="form-control" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Reorder Level</label>
                    <input className="form-control" type="number" min="0" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input className="form-control" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Supplier</label>
                    <input className="form-control" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={mutating}>{mutating ? 'Saving…' : (editing ? 'Save Changes' : 'Add Medicine')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
