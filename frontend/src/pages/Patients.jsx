import { useEffect, useState } from 'react';
import { usePatients, useAppointments, useCreatePatient, useUpdatePatient, useDeletePatient } from '../hooks';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiUser } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { notify } from '../lib/notify';

const INITIAL_FORM = { name: '', dob: '', gender: 'MALE', phone: '', address: '', emergencyContact: '' };

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '—');

export default function Patients() {
  const [search, setSearch] = useState('');
  const [now] = useState(() => Date.now());
  const debouncedSearch = useDebouncedValue(search);
  const { data: patients = [], isLoading, error, refetch } = usePatients(debouncedSearch || undefined);
  const { data: appointments = [] } = useAppointments();
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  useEffect(() => {
    if (error) notify.retry('Failed to load patients', () => refetch());
  }, [error, refetch]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const openAdd = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (patient) => {
    setEditing(patient.id);
    setForm({ name: patient.name, dob: patient.dob || '', gender: patient.gender || 'MALE', phone: patient.phone, address: patient.address || '', emergencyContact: patient.emergencyContact || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const input = {
      name: form.name,
      phone: form.phone,
      dob: form.dob || undefined,
      gender: form.gender,
      address: form.address || undefined,
      emergencyContact: form.emergencyContact || undefined,
    };
    if (editing) {
      notify.promise(updateMutation.mutateAsync({ id: editing, input }), {
        loading: 'Updating patient...',
        success: 'Patient updated successfully',
      }).then(ok => { if (ok) closeModal(); });
    } else {
      notify.promise(createMutation.mutateAsync(input), {
        loading: 'Registering patient...',
        success: 'Patient registered successfully',
      }).then(ok => { if (ok) closeModal(); });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      notify.promise(deleteMutation.mutateAsync(id), {
        loading: 'Deleting patient...',
        success: 'Patient deleted',
      }).then(ok => { if (ok && viewing?.id === id) setViewing(null); });
    }
  };

  const patientAppointments = viewing
    ? appointments.filter(a => a.patient.id === viewing.id)
    : [];

  const getAge = (dob) => {
    if (!dob) return '—';
    const diff = now - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)) + ' yrs';
  };

  const mutating = editing ? updateMutation.isPending : createMutation.isPending;

  // Detail view
  if (viewing) {
    return (
      <>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setViewing(null)}>← Back</button>
            <h1>Patient Details</h1>
          </div>
        </div>
        <div className="page-body fade-in">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--color-accent), #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: '#ffffff'
                }}>
                  {viewing.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2>{viewing.name}</h2>
                  <span className="badge badge-accent">{viewing.id}</span>
                  <span className="badge badge-info" style={{ marginLeft: 8 }}>{titleCase(viewing.gender)}</span>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { openEdit(viewing); setViewing(null); }}>
                <FiEdit2 /> Edit
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Date of Birth</div>
                <div className="detail-value">{viewing.dob || '—'} ({getAge(viewing.dob)})</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{viewing.phone}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Address</div>
                <div className="detail-value">{viewing.address || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Emergency Contact</div>
                <div className="detail-value">{viewing.emergencyContact || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Registered</div>
                <div className="detail-value">{viewing.createdAt}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Visit History</h3>
              <span className="badge badge-info">{patientAppointments.length} visits</span>
            </div>
            {patientAppointments.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <p className="text-muted">No visit history</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr><th>Date</th><th>Time</th><th>Doctor</th><th>Status</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {patientAppointments.map(a => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>{a.doctor.name}</td>
                        <td>
                          <span className={`badge ${a.status === 'COMPLETED' ? 'badge-success' : a.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                            {titleCase(a.status)}
                          </span>
                        </td>
                        <td>{a.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>


        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Patients" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{patients.length} patients</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, ID, or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Patient</button>
            </div>
          </div>
        </div>

        {!isLoading && patients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiUser /></div>
            <h3>No patients found</h3>
            <p>Try a different search or add a new patient</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
                )}
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-accent">{p.id}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</td>
                    <td>{getAge(p.dob)}</td>
                    <td>{titleCase(p.gender)}</td>
                    <td>{p.phone}</td>
                    <td>{p.createdAt}</td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewing(p)} title="View">
                          <FiEye />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(p.id)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Patient' : 'Add New Patient'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input className="form-control" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option>MALE</option>
                      <option>FEMALE</option>
                      <option>OTHER</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Enter address" />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input className="form-control" value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Enter emergency contact" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={mutating}>{mutating ? 'Saving…' : (editing ? 'Save Changes' : 'Register Patient')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
