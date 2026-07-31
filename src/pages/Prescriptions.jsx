import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  FiSearch, FiPlus, FiX, FiCheckCircle, FiClock, FiUser,
  FiPackage, FiDollarSign, FiAlertCircle, FiTrash2
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

export default function Prescriptions() {
  const { patients, medicines, prescriptions, createPrescription, dispensePrescription } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formPatientId, setFormPatientId] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [prxItems, setPrxItems] = useState([{ medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1, total: 0 }]);

  const filtered = prescriptions.filter(p => {
    const matchSearch = p.patientName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePatientChange = (e) => {
    const patient = patients.find(p => p.id === e.target.value);
    setFormPatientId(patient?.id || '');
  };

  const updateItem = (index, field, value) => {
    setPrxItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'medicineId') {
        const med = medicines.find(m => m.id === value);
        updated.medicineName = med?.name || '';
        updated.total = med ? med.unitPrice * updated.quantity : 0;
      }
      if (field === 'quantity') {
        const med = medicines.find(m => m.id === item.medicineId);
        updated.total = med ? med.unitPrice * parseInt(value || 0) : 0;
      }
      return updated;
    }));
  };

  const addItem = () => {
    setPrxItems(prev => [...prev, { medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1, total: 0 }]);
  };

  const removeItem = (index) => {
    if (prxItems.length <= 1) return;
    setPrxItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = prxItems.reduce((sum, item) => sum + item.total, 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formPatientId || prxItems.some(i => !i.medicineId || !i.dosage)) return;
    const patient = patients.find(p => p.id === formPatientId);
    createPrescription({
      patientId: formPatientId, patientName: patient?.name || '',
      doctorName: formDoctor, items: prxItems,
    });
    setShowCreateModal(false);
    setFormPatientId('');
    setFormDoctor('');
    setPrxItems([{ medicineId: '', medicineName: '', dosage: '', frequency: '', duration: '', quantity: 1, total: 0 }]);
  };

  const handleDispense = (id) => {
    if (confirm('Dispense this prescription? Stock will be deducted and a bill will be created.')) {
      dispensePrescription(id);
    }
  };

  const statusColors = { Pending: 'badge-warning', Dispensed: 'badge-success', Partial: 'badge-info' };

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Create and dispense medication prescriptions" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Pending</option>
              <option>Dispensed</option>
              <option>Partial</option>
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {prescriptions.filter(p => p.status === 'Pending').length} pending • {filtered.length} total
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

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiPackage /></div>
            <h3>No prescriptions found</h3>
            <p>Create a new prescription to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{
                borderLeft: `3px solid ${p.status === 'Dispensed' ? 'var(--color-success)' : p.status === 'Partial' ? 'var(--color-info)' : 'var(--color-warning)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span className="badge badge-accent">{p.id}</span>
                      <span className={`badge ${statusColors[p.status]}`}>{p.status}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                      <FiUser style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }} />
                      <strong>{p.patientName}</strong>
                      {p.doctorName && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>— {p.doctorName}</span>}
                    </div>
                  </div>
                  {p.status === 'Pending' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleDispense(p.id)}>
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
                      <span style={{ fontWeight: 600, flex: 2 }}>{item.medicineName}</span>
                      <span style={{ color: 'var(--color-text-muted)', flex: 1 }}>{item.dosage}</span>
                      <span style={{ color: 'var(--color-text-muted)', flex: 1 }}>{item.frequency}</span>
                      <span style={{ color: 'var(--color-text-muted)', flex: 1 }}>x{item.quantity}</span>
                      {item.dispensed && <span style={{ color: item.dispensed === 'Dispensed' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>{item.dispensed}</span>}
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
                <button type="submit" className="btn btn-primary">Create Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
