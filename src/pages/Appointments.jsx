import { useState } from 'react';
import { useData } from '../context/DataContext';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCalendar, FiCheck, FiXCircle } from 'react-icons/fi';

const INITIAL_FORM = { patientId: '', patientName: '', doctorId: '', doctorName: '', date: '', time: '', notes: '' };

export default function Appointments() {
  const { appointments, patients, doctors, addAppointment, updateAppointment, deleteAppointment } = useData();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const activeDoctors = doctors.filter(d => d.active);

  const filtered = appointments.filter(a => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || a.date === dateFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM, date: dateFilter || new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  };

  const openEdit = (apt) => {
    setEditing(apt.id);
    setForm({
      patientId: apt.patientId, patientName: apt.patientName,
      doctorId: apt.doctorId, doctorName: apt.doctorName,
      date: apt.date, time: apt.time, notes: apt.notes || ''
    });
    setShowModal(true);
  };

  const handlePatientChange = (e) => {
    const patient = patients.find(p => p.id === e.target.value);
    setForm(f => ({ ...f, patientId: patient?.id || '', patientName: patient?.name || '' }));
  };

  const handleDoctorChange = (e) => {
    const doctor = activeDoctors.find(d => d.id === e.target.value);
    setForm(f => ({ ...f, doctorId: doctor?.id || '', doctorName: doctor?.name || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) return;
    if (editing) {
      updateAppointment(editing, form);
    } else {
      addAppointment(form);
    }
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const handleStatusChange = (id, status) => {
    updateAppointment(id, { status });
  };

  const handleDeleteApt = (id) => {
    if (confirm('Delete this appointment?')) deleteAppointment(id);
  };

  return (
    <>
      <div className="page-header">
        <h1>Appointments</h1>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> New Appointment</button>
      </div>

      <div className="page-body fade-in">
        <div className="toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input
            type="date"
            className="form-control"
            style={{ width: 180 }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>{filtered.length} results</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiCalendar /></div>
            <h3>No appointments found</h3>
            <p>Try adjusting the date or filters</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><span className="badge badge-accent">{a.id}</span></td>
                    <td>{a.date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{a.time}</td>
                    <td>{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td>
                      <span className={`badge ${
                        a.status === 'Completed' ? 'badge-success' :
                        a.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                      }`}>{a.status}</span>
                    </td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes || '—'}</td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        {a.status === 'Scheduled' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(a.id, 'Completed')} title="Complete">
                              <FiCheck />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(a.id, 'Cancelled')} title="Cancel">
                              <FiXCircle />
                            </button>
                          </>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDeleteApt(a.id)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Appointment' : 'Schedule Appointment'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient *</label>
                  <select className="form-control" value={form.patientId} onChange={handlePatientChange} required>
                    <option value="">Select a patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor *</label>
                  <select className="form-control" value={form.doctorId} onChange={handleDoctorChange} required>
                    <option value="">Select a doctor</option>
                    {activeDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.department}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <input className="form-control" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
