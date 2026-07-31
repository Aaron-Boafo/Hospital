import { useState, useEffect } from 'react';
import { usePrescriptions, usePatients, useMedicines, useCreatePrescription, useDispensePrescription } from '../hooks';
import {
  FiSearch, FiPlus, FiX, FiCheckCircle, FiClock, FiUser,
  FiPackage, FiDollarSign, FiAlertCircle, FiTrash2
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { notify } from '../lib/notify';

const EMPTY_ITEM = { medicineId: '', dosage: '', frequency: '', duration: '', quantity: 1 };

const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '—');

export default function Prescriptions() {
  const { data: prescriptions = [], isLoading, error, refetch } = usePrescriptions();
  const { data: patients = [] } = usePatients();
  const { data: medicines = [] } = useMedicines();
  const createMutation = useCreatePrescription();
  const dispenseMutation = useDispensePrescription();

  useEffect(() => {
    if (error) notify.retry('Failed to load prescriptions', () => refetch());
  }, [error, refetch]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formPatientId, setFormPatientId] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [prxItems, setPrxItems] = useState([EMPTY_ITEM]);

  const filtered = prescriptions.filter(p => {
    const matchSearch = p.patient.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePatientChange = (e) => {
    setFormPatientId(e.target.value);
  };

  const updateItem = (index, field, value) => {
    setPrxItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setPrxItems(prev => [...prev, EMPTY_ITEM]);
  };

  const removeItem = (index) => {
    if (prxItems.length <= 1) return;
    setPrxItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = prxItems.reduce((sum, item) => {
    const med = medicines.find(m => m.id === item.medicineId);
    return sum + (med ? med.unitPrice * (parseInt(item.quantity) || 0) : 0);
  }, 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formPatientId || prxItems.some(i => !i.medicineId || !i.dosage)) return;
    notify.promise(createMutation.mutateAsync({
      patientId: formPatientId,
      doctorName: formDoctor || undefined,
      items: prxItems.map(i => ({
        medicineId: i.medicineId,
        dosage: i.dosage,
        quantity: parseInt(i.quantity) || 1,
        frequency: i.frequency || undefined,
        duration: i.duration || undefined,
      })),
    }), {
      loading: 'Creating prescription...',
      success: 'Prescription created successfully',
    }).then(ok => {
      if (ok) {
        setShowCreateModal(false);
        setFormPatientId('');
        setFormDoctor('');
        setPrxItems([EMPTY_ITEM]);
      }
    });
  };

  const handleDispense = (id) => {
    if (confirm('Dispense this prescription? Stock will be deducted and a bill will be created.')) {
      notify.promise(dispenseMutation.mutateAsync(id), {
        loading: 'Dispensing prescription...',
        success: 'Prescription dispensed',
      });
    }
  };

  const statusColors = { PENDING: 'badge-warning', DISPENSED: 'badge-success', PARTIAL: 'badge-info' };

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Create and dispense medication prescriptions" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="PENDING">Pending</option>
              <option value="DISPENSED">Dispensed</option>
              <option value="PARTIAL">Partial</option>
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {prescriptions.filter(p => p.status === 'PENDING').length} pending • {filtered.length} total
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search by patient or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><FiPlus /> New Prescription</button>
            </div>
          </div>
        </div>

        {!isLoading && filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiPackage /></div>
            <h3>No prescriptions found</h3>
            <p>Create a new prescription to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isLoading && (
              <p className="text-muted" style={{ padding: 24 }}>Loading…</p>
            )}
            {filtered.map(p => (
              <div key={p.id} className="card" style={{
                borderLeft: `3px solid ${p.status === 'DISPENSED' ? 'var(--color-success)' : p.status === 'PARTIAL' ? 'var(--color-info)' : 'var(--color-warning)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span className="badge badge-accent">{p.id}</span>
                      <span className={`badge ${statusColors[p.status]}`}>{titleCase(p.status)}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                      <FiUser style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }} />
                      <strong>{p.patient.name}</strong>
                      {p.doctorName && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>— {p.doctorName}</span>}
                    </div>
                  </div>
                  {p.status === 'PENDING' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleDispense(p.id)} disabled={dispenseMutation.isPending}>
                      <FiCheckCircle /> Dispense
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                  {p.items.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                    }}>
                      <span style={{ fontWeight: 600, flex: 2 }}>{item.medicine.name}</span>
                      <span style={{ color: 'var(--color-text-muted)', flex: 1 }}>{item.dosage}</span>
                      <span style={{ color: 'var(--color-text-muted)', flex: 1 }}>{item.frequency}</span>
                      <span style={{ color: 'var(--color-text-muted)', flex: 1 }}>x{item.quantity}</span>
                      {item.dispensed && <span style={{ color: item.dispensed === 'DISPENSED' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>{titleCase(item.dispensed)}</span>}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'right', marginTop: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Total: GH₵{p.items.reduce((s, i) => s + (i.total || 0), 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2>New Prescription</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient *</label>
                    <select className="form-control" value={formPatientId} onChange={handlePatientChange} required>
                      <option value="">Select patient</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Doctor</label>
                    <input className="form-control" value={formDoctor} onChange={e => setFormDoctor(e.target.value)} placeholder="Prescribing doctor" />
                  </div>
                </div>

                <div style={{ marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Medications *</div>

                {prxItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                      <select className="form-control" value={item.medicineId} onChange={e => updateItem(i, 'medicineId', e.target.value)} required style={{ fontSize: '0.82rem' }}>
                        <option value="">Select medicine</option>
                        {medicines.filter(m => m.quantity > 0).map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <input className="form-control" placeholder="Dosage" value={item.dosage} onChange={e => updateItem(i, 'dosage', e.target.value)} required style={{ fontSize: '0.82rem' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <input className="form-control" placeholder="Frequency" value={item.frequency} onChange={e => updateItem(i, 'frequency', e.target.value)} style={{ fontSize: '0.82rem' }} />
                    </div>
                    <div className="form-group" style={{ flex: 0.5, marginBottom: 0 }}>
                      <input className="form-control" type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{ fontSize: '0.82rem' }} />
                    </div>
                    {prxItems.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(i)}><FiTrash2 /></button>
                    )}
                  </div>
                ))}

                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 16 }}><FiPlus /> Add Medication</button>

                <div style={{
                  padding: '12px 16px', background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between',
                  fontWeight: 700, fontSize: '1rem',
                }}>
                  <span>Total:</span>
                  <span style={{ color: 'var(--color-accent)' }}>GH₵{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating…' : 'Create Prescription'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
