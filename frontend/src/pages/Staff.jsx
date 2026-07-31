import { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiUserPlus, FiToggleLeft, FiToggleRight, FiShield, FiAlertTriangle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

const INITIAL_FORM = { name: '', username: '', email: '', phone: '', role: 'receptionist', password: '' };

export default function Staff() {
  const { users, registerUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (staff) => {
    setEditing(staff.id);
    setForm({ name: staff.name, username: staff.username, email: staff.email, phone: staff.phone || '', role: staff.role, password: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.username || !form.email || !form.role) {
      setError('Please fill in all required fields');
      return;
    }

    if (editing) {
      const updates = { name: form.name, username: form.username, email: form.email, phone: form.phone, role: form.role };
      if (form.password) {
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        updates.password = form.password;
      }
      updateUser(editing, updates);
    } else {
      if (!form.password) {
        setError('Password is required for new accounts');
        return;
      }
      const result = registerUser(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
    }
    setShowModal(false);
    setForm(INITIAL_FORM);
    setEditing(null);
    setError('');
  };

  const handleDelete = (id) => {
    if (id === currentUser.id) {
      alert('You cannot delete your own account');
      return;
    }
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteUser(id);
    }
  };

  const handleToggleActive = (id) => {
    if (id === currentUser.id) {
      alert('You cannot deactivate your own account');
      return;
    }
    const staff = users.find(u => u.id === id);
    updateUser(id, { active: !staff.active });
  };

  const roleColors = {
    admin: 'badge-danger',
    doctor: 'badge-info',
    receptionist: 'badge-success',
    accountant: 'badge-warning',
  };

  return (
    <>
      <PageHeader title="Staff Management" subtitle="Manage user accounts and role assignments" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option>All</option>
              {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{filtered.length} staff</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search by name, username, or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Staff</button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiUserPlus /></div>
            <h3>No staff members found</h3>
            <p>Try adjusting filters or add a new staff member</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ opacity: s.active ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.name}</td>
                    <td><span className="badge badge-accent">{s.username}</span></td>
                    <td>{s.email}</td>
                    <td>
                      <span className={`badge ${roleColors[s.role] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
                        {s.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{s.createdAt || '—'}</td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button
                          className={`btn btn-sm ${s.active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleActive(s.id)}
                          title={s.active ? 'Deactivate' : 'Activate'}
                          disabled={s.id === currentUser.id}
                        >
                          {s.active ? <FiToggleLeft /> : <FiToggleRight />}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => handleDelete(s.id)}
                          title="Delete"
                          disabled={s.id === currentUser.id}
                        >
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Staff Account' : 'Add New Staff'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    backgroundColor: 'var(--color-danger-bg)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    marginBottom: 16, fontSize: '0.85rem', fontWeight: 500,
                  }}>
                    <FiAlertTriangle /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Jane Smith" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="login username" required disabled={!!editing} />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
                      {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@medicare.com" required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label>{editing ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input
                    className="form-control"
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder={editing ? 'Enter new password' : 'Minimum 6 characters'}
                    required={!editing}
                    minLength={6}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
