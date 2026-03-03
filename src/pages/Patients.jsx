import { useState } from 'react';
import { useData } from '../context/DataContext';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiUser } from 'react-icons/fi';

const INITIAL_FORM = { name: '', dob: '', gender: 'Male', phone: '', address: '', emergencyContact: '' };

export default function Patients() {
  const { patients, appointments, addPatient, updatePatient, deletePatient } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const openAdd = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (patient) => {
    setEditing(patient.id);
    setForm({ name: patient.name, dob: patient.dob, gender: patient.gender, phone: patient.phone, address: patient.address, emergencyContact: patient.emergencyContact });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    if (editing) {
      updatePatient(editing, form);
    } else {
      addPatient(form);
    }
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      deletePatient(id);
      if (viewing?.id === id) setViewing(null);
    }
  };

  const patientAppointments = viewing
    ? appointments.filter(a => a.patientId === viewing.id)
    : [];

  const getAge = (dob) => {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)) + ' yrs';
  };

  // Detail view
  if (viewing) {
    return (
      <>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setViewing(null)}>← Back</button>
            <h1>Patient Details</h1>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary btn-sm" onClick={() => { openEdit(viewing); setViewing(null); }}>
              <FiEdit2 /> Edit
            </button>
          </div>
        </div>
        <div className="page-body fade-in">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
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
                <span className="badge badge-info" style={{ marginLeft: 8 }}>{viewing.gender}</span>
              </div>
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
                        <td>{a.doctorName}</td>
                        <td>
                          <span className={`badge ${a.status === 'Completed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>
                            {a.status}
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
      <div className="page-header">
        <h1>Patients</h1>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Patient</button>
      </div>

      <div className="page-body fade-in">
        <div className="toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{filtered.length} patients</span>
        </div>

        {filtered.length === 0 ? (
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
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-accent">{p.id}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</td>
                    <td>{getAge(p.dob)}</td>
                    <td>{p.gender}</td>
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
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
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
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Register Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
