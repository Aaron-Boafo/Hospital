import { useState } from 'react';
import { useData } from '../context/DataContext';
import { FiSearch, FiPlus, FiEdit2, FiX, FiUserPlus, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

const DEPARTMENTS = ['General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Neurology', 'Dermatology', 'ENT', 'Gynecology', 'Ophthalmology'];
const INITIAL_FORM = { name: '', department: DEPARTMENTS[0], phone: '', email: '' };

export default function Doctors() {
  const { doctors, addDoctor, updateDoctor, toggleDoctorActive } = useData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || d.department === deptFilter;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (doctor) => {
    setEditing(doctor.id);
    setForm({ name: doctor.name, department: doctor.department, phone: doctor.phone, email: doctor.email });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.department) return;
    if (editing) {
      updateDoctor(editing, form);
    } else {
      addDoctor(form);
    }
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const allDepartments = [...new Set(doctors.map(d => d.department))];

  return (
    <>
      <PageHeader title="Doctors" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option>All</option>
              {allDepartments.map(d => <option key={d}>{d}</option>)}
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{filtered.length} doctors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Doctor</button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiUserPlus /></div>
            <h3>No doctors found</h3>
            <p>Try adjusting filters or add a new doctor</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(d => (
              <div key={d.id} className="card" style={{ opacity: d.active ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--radius-md)',
                      background: d.active ? 'linear-gradient(135deg, var(--color-accent), #3b82f6)' : 'var(--color-bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.95rem', color: d.active ? '#ffffff' : 'var(--color-text-muted)'
                    }}>
                      {d.name.split(' ').filter(n => n !== 'Dr.').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{d.name}</h4>
                      <span className="badge badge-accent">{d.department}</span>
                    </div>
                  </div>
                  <span className={`badge ${d.active ? 'badge-success' : 'badge-danger'}`}>
                    {d.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  📞 {d.phone || '—'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                  ✉️ {d.email || '—'}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    className={`btn btn-sm ${d.active ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => toggleDoctorActive(d.id)}
                  >
                    {d.active ? <><FiToggleLeft /> Deactivate</> : <><FiToggleRight /> Activate</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Jane Smith" required />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
