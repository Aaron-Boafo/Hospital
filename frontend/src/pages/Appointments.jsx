import { useState, useEffect, useMemo } from 'react';
import { useAppointments, usePatients, useDoctors, useCreateAppointment, useUpdateAppointment, useUpdateAppointmentStatus, useDeleteAppointment } from '../hooks';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCalendar, FiCheck, FiXCircle,
  FiList, FiChevronLeft, FiChevronRight, FiClock, FiUser
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { DAYS, MONTHS } from '../constants';
import { notify } from '../lib/notify';

const INITIAL_FORM = { patientId: '', doctorId: '', date: '', time: '', notes: '' };

const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '—');

function CalendarView({ appointments, onDayClick, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const aptMap = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}><FiChevronLeft /></button>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{MONTHS[month]} {year}</h3>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}><FiChevronRight /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '10px 4px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} style={{ minHeight: 90, borderRight: (i % 7) < 6 ? '1px solid var(--color-border)' : 'none', borderBottom: '1px solid var(--color-border)' }} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const apts = aptMap[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              style={{
                minHeight: 90, padding: 6, cursor: 'pointer',
                borderRight: (i % 7) < 6 ? '1px solid var(--color-border)' : 'none',
                borderBottom: i < cells.length - 1 ? '1px solid var(--color-border)' : 'none',
                background: isSelected ? 'var(--color-accent-light)' : isToday ? 'var(--color-bg-tertiary)' : 'transparent',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = isToday ? 'var(--color-bg-tertiary)' : 'transparent'; }}
            >
              <div style={{
                fontSize: '0.78rem', fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--color-accent)' : 'var(--color-text-primary)',
                marginBottom: 4, textAlign: 'right',
              }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {apts.slice(0, 3).map(a => (
                  <div key={a.id} style={{
                    fontSize: '0.62rem', padding: '2px 4px', borderRadius: 'var(--radius-sm)',
                    background: a.status === 'COMPLETED' ? 'var(--color-success-bg)' :
                      a.status === 'CANCELLED' ? 'var(--color-danger-bg)' : 'var(--color-info-bg)',
                    color: a.status === 'COMPLETED' ? 'var(--color-success)' :
                      a.status === 'CANCELLED' ? 'var(--color-danger)' : 'var(--color-info)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4,
                  }}>
                    {a.time} {a.patient.name.split(' ')[0]}
                  </div>
                ))}
                {apts.length > 3 && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', paddingLeft: 4 }}>+{apts.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayDetail({ date, appointments, onClose, onEdit, onDelete, onStatusChange }) {
  const apts = appointments.filter(a => a.date === date);
  const dateObj = new Date(date + 'T00:00:00');
  const label = `${DAYS[dateObj.getDay()]}, ${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiCalendar style={{ color: 'var(--color-accent)' }} /> {label}
        </h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX /></button>
      </div>
      {apts.length === 0 ? (
        <div className="empty-state" style={{ padding: 30 }}>
          <p className="text-muted">No appointments on this day</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
          {apts.sort((a, b) => a.time.localeCompare(b.time)).map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderLeft: `3px solid ${a.status === 'COMPLETED' ? 'var(--color-success)' : a.status === 'CANCELLED' ? 'var(--color-danger)' : 'var(--color-info)'}`,
              background: 'var(--color-bg-tertiary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            }}>
              <div style={{ textAlign: 'center', minWidth: 50 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{a.time}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{a.patient.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiUser style={{ fontSize: '0.7rem' }} /> {a.doctor.name}
                </div>
                {a.notes && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{a.notes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`badge ${a.status === 'COMPLETED' ? 'badge-success' : a.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                  {titleCase(a.status)}
                </span>
                {a.status === 'SCHEDULED' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => onStatusChange(a.id, 'COMPLETED')} title="Complete"><FiCheck /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(a.id, 'CANCELLED')} title="Cancel"><FiXCircle /></button>
                  </>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(a)} title="Edit"><FiEdit2 /></button>
                <button className="btn btn-ghost btn-sm text-danger" onClick={() => onDelete(a.id)} title="Delete"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Appointments() {
  const { data: appointments = [], isLoading, error, refetch } = useAppointments();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const statusMutation = useUpdateAppointmentStatus();
  const deleteMutation = useDeleteAppointment();

  useEffect(() => {
    if (error) notify.retry('Failed to load appointments', () => refetch());
  }, [error, refetch]);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [view, setView] = useState('table');
  const [calSelectedDate, setCalSelectedDate] = useState(null);

  const activeDoctors = doctors.filter(d => d.active);

  const filtered = appointments.filter(a => {
    const matchSearch = a.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || a.date === dateFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const openAdd = (date) => {
    setEditing(null);
    setForm({ ...INITIAL_FORM, date: date || dateFilter || new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  };

  const openEdit = (apt) => {
    setEditing(apt.id);
    setForm({
      patientId: apt.patient.id,
      doctorId: apt.doctor.id,
      date: apt.date, time: apt.time, notes: apt.notes || ''
    });
    setShowModal(true);
  };

  const handlePatientChange = (e) => {
    setForm(f => ({ ...f, patientId: e.target.value }));
  };

  const handleDoctorChange = (e) => {
    setForm(f => ({ ...f, doctorId: e.target.value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) return;
    const input = { patientId: form.patientId, doctorId: form.doctorId, date: form.date, time: form.time, notes: form.notes || undefined };
    if (editing) {
      notify.promise(updateMutation.mutateAsync({ id: editing, input }), {
        loading: 'Updating appointment...',
        success: 'Appointment updated successfully',
      }).then(ok => { if (ok) closeModal(); });
    } else {
      notify.promise(createMutation.mutateAsync(input), {
        loading: 'Scheduling appointment...',
        success: 'Appointment scheduled successfully',
      }).then(ok => { if (ok) closeModal(); });
    }
  };

  const handleStatusChange = (id, status) => {
    const completed = status === 'COMPLETED';
    notify.promise(statusMutation.mutateAsync({ id, status }), {
      loading: completed ? 'Completing appointment...' : 'Cancelling appointment...',
      success: completed ? 'Appointment completed' : 'Appointment cancelled',
    });
  };

  const handleDeleteApt = (id) => {
    if (confirm('Delete this appointment?')) {
      notify.promise(deleteMutation.mutateAsync(id), {
        loading: 'Deleting appointment...',
        success: 'Appointment deleted',
      });
    }
  };

  const mutating = editing ? updateMutation.isPending : createMutation.isPending;

  return (
    <>
      <PageHeader title="Appointments" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="date"
              className="form-control"
              style={{ width: 180 }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {view === 'table' ? `${filtered.length} results` : `${appointments.length} total`}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}><FiList /> List</button>
              <button className={`btn btn-sm ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('calendar')}><FiCalendar /> Calendar</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={() => openAdd()}><FiPlus /> New Appointment</button>
            </div>
          </div>
        </div>

        {view === 'table' ? (
          !isLoading && filtered.length === 0 ? (
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
                  {isLoading && (
                    <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
                  )}
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td><span className="badge badge-accent">{a.id}</span></td>
                      <td>{a.date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{a.time}</td>
                      <td>{a.patient.name}</td>
                      <td>{a.doctor.name}</td>
                      <td>
                        <span className={`badge ${
                          a.status === 'COMPLETED' ? 'badge-success' :
                          a.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'
                        }`}>{titleCase(a.status)}</span>
                      </td>
                      <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes || '—'}</td>
                      <td>
                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                          {a.status === 'SCHEDULED' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(a.id, 'COMPLETED')} title="Complete">
                                <FiCheck />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(a.id, 'CANCELLED')} title="Cancel">
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
          )
        ) : (
          <>
            <CalendarView
              appointments={appointments}
              onDayClick={(date) => { setCalSelectedDate(date); setDateFilter(date); }}
              selectedDate={calSelectedDate}
            />
            {calSelectedDate && (
              <DayDetail
                date={calSelectedDate}
                appointments={appointments}
                onClose={() => setCalSelectedDate(null)}
                onEdit={openEdit}
                onDelete={handleDeleteApt}
                onStatusChange={handleStatusChange}
              />
            )}
          </>
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
                    {activeDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {titleCase(d.department)}</option>)}
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
                <button type="submit" className="btn btn-primary" disabled={mutating}>{mutating ? 'Saving…' : (editing ? 'Save Changes' : 'Schedule')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
