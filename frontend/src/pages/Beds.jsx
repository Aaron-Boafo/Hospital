import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { usePatients } from '../hooks';
import {
  FiGrid, FiUser, FiX, FiCheck, FiAlertCircle, FiHome,
  FiPlus, FiSearch, FiSettings, FiTrash2, FiEdit2, FiSave
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { BED_STATUS_STYLES } from '../constants';
import { notify } from '../lib/notify';

export default function Beds() {
  const { wards, beds, admitPatient, dischargePatient, addWard, removeWard, updateWard, addBed, removeBed } = useData();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('All');

  // Manage wards modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageView, setManageView] = useState('list');
  const [editingWard, setEditingWard] = useState(null);
  const [manageForm, setManageForm] = useState({ name: '', totalBeds: 10 });
  const [manageError, setManageError] = useState('');

  // Inline admit
  const [admittingBed, setAdmittingBed] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');

  const filteredBeds = beds.filter(b => {
    const matchSearch = b.id.toLowerCase().includes(search.toLowerCase()) ||
      (b.patientName || '').toLowerCase().includes(search.toLowerCase());
    const matchWard = wardFilter === 'All' || b.wardId === wardFilter;
    return matchSearch && matchWard;
  });

  const grouped = useMemo(() => {
    const map = {};
    filteredBeds.forEach(b => {
      if (!map[b.wardId]) map[b.wardId] = [];
      map[b.wardId].push(b);
    });
    return map;
  }, [filteredBeds]);

  const wardTotals = useMemo(() => {
    const stats = {};
    wards.forEach(w => {
      const wardBeds = beds.filter(b => b.wardId === w.id);
      stats[w.id] = {
        total: wardBeds.length,
        occupied: wardBeds.filter(b => b.status === 'Occupied').length,
        available: wardBeds.filter(b => b.status === 'Available').length,
        maintenance: wardBeds.filter(b => b.status === 'Maintenance').length,
      };
    });
    return stats;
  }, [wards, beds]);

  const handleAdmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !admittingBed) return;
    const patient = patients.find(p => p.id === selectedPatient);
    admitPatient(admittingBed.id, patient.id, patient.name);
    notify.success(`${patient.name} admitted to ${admittingBed.id}`);
    setAdmittingBed(null);
    setSelectedPatient('');
  };

  // Manage wards handlers
  const openAddWard = () => {
    setManageForm({ name: '', totalBeds: 10 });
    setManageError('');
    setEditingWard(null);
    setManageView('add');
  };

  const openEditWard = (ward) => {
    setManageForm({ name: ward.name, totalBeds: ward.totalBeds });
    setManageError('');
    setEditingWard(ward);
    setManageView('edit');
  };

  const handleManageSubmit = (e) => {
    e.preventDefault();
    setManageError('');

    if (!manageForm.name.trim()) {
      setManageError('Ward name is required');
      return;
    }
    if (parseInt(manageForm.totalBeds) < 1) {
      setManageError('At least 1 bed required');
      return;
    }

    if (editingWard) {
      const result = updateWard(editingWard.id, manageForm);
      if (!result.success) {
        setManageError(result.error);
        return;
      }
      notify.success('Ward updated successfully');
    } else {
      addWard(manageForm.name.trim(), manageForm.totalBeds);
      notify.success('Ward added successfully');
    }
    setManageView('list');
  };

  const handleDeleteWard = (wardId) => {
    const result = removeWard(wardId);
    if (!result.success) {
      setManageError(result.error);
      return;
    }
    notify.success('Ward deleted');
  };

  const handleAddBed = (wardId) => {
    addBed(wardId);
    notify.success('Bed added');
  };

  const handleRemoveBed = (bedId) => {
    const result = removeBed(bedId);
    if (!result.success) {
      notify.error(result.error);
    }
  };

  const totOcc = beds.filter(b => b.status === 'Occupied').length;
  const totAvail = beds.filter(b => b.status === 'Available').length;
  const totMaint = beds.filter(b => b.status === 'Maintenance').length;
  const occRate = beds.length > 0 ? Math.round((totOcc / beds.length) * 100) : 0;

  return (
    <>
      <PageHeader title="Bed & Ward Management" subtitle="Track bed occupancy and patient admissions" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select className="form-control" style={{ width: 200 }} value={wardFilter} onChange={e => setWardFilter(e.target.value)}>
              <option>All</option>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({wardTotals[w.id]?.available || 0}/{w.totalBeds} free)</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowManageModal(true); setManageView('list'); setManageError(''); }}>
              <FiSettings /> Manage Wards
            </button>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {totOcc} occupied / {beds.length} beds ({occRate}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search by bed ID or patient name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiGrid /></div>
            <h3>No beds found</h3>
            <p>Add a ward to get started</p>
            <button className="btn btn-primary" onClick={() => { setShowManageModal(true); setManageView('list'); }}>
              <FiPlus /> Add Ward
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([wardId, wardBeds]) => {
            const ward = wards.find(w => w.id === wardId);
            const wt = wardTotals[wardId] || { total: 0, occupied: 0, available: 0, maintenance: 0 };
            const occPct = wt.total > 0 ? Math.round((wt.occupied / wt.total) * 100) : 0;
            return (
              <div key={wardId} style={{ marginBottom: 28 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <FiHome style={{ color: 'var(--color-accent)' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{ward?.name || wardId}</h3>
                    <span className="badge badge-info">{wt.occupied} occ</span>
                    <span className="badge badge-success">{wt.available} free</span>
                    {wt.maintenance > 0 && <span className="badge badge-warning">{wt.maintenance} maint</span>}
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{wt.total} beds</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 'var(--radius-full)',
                      width: `${occPct}%`,
                      background: occPct > 80 ? 'var(--color-danger)' : occPct > 50 ? 'var(--color-warning)' : 'var(--color-success)',
                      transition: 'width var(--transition-normal)',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {wardBeds.map(b => (
                    <div key={b.id}
                      onClick={() => {
                        if (b.status === 'Available') setAdmittingBed(admittingBed?.id === b.id ? null : b);
                        else if (b.status === 'Occupied' && confirm(`Discharge ${b.patientName} from ${b.id}?`)) { dischargePatient(b.id); notify.success(`${b.patientName} discharged from ${b.id}`); }
                      }}
                      style={{
                        padding: '14px 10px', borderRadius: 'var(--radius-md)',
                        background: BED_STATUS_STYLES[b.status].bg,
                        borderLeft: `3px solid ${BED_STATUS_STYLES[b.status].border}`,
                        cursor: b.status === 'Maintenance' ? 'default' : 'pointer',
                        textAlign: 'center', position: 'relative',
                        boxShadow: admittingBed?.id === b.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={e => { if (admittingBed?.id !== b.id) e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseLeave={e => { if (admittingBed?.id !== b.id) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: BED_STATUS_STYLES[b.status].color, marginBottom: 6 }}>
                        {b.id}
                      </div>
                      <span className={`badge ${b.status === 'Available' ? 'badge-success' : b.status === 'Occupied' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                        {b.status}
                      </span>
                      {b.patientName && (
                        <div style={{
                          fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)',
                          marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          <FiUser style={{ fontSize: '0.7rem', marginRight: 4, verticalAlign: 'middle' }} />
                          {b.patientName}
                        </div>
                      )}
                      {admittingBed?.id === b.id && (
                        <form onSubmit={handleAdmit} onClick={e => e.stopPropagation()} style={{ marginTop: 10, borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                          <select className="form-control" style={{ fontSize: '0.75rem', padding: '4px 6px', marginBottom: 6 }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
                            <option value="">Select patient</option>
                            {patientsLoading && <option value="">Loading patients…</option>}
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button type="submit" className="btn btn-success btn-sm" style={{ fontSize: '0.7rem', padding: '3px 8px', flex: 1 }}><FiCheck /> Admit</button>
                            <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem', padding: '3px 8px' }} onClick={() => setAdmittingBed(null)}><FiX /></button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manage Wards Modal */}
      {showManageModal && (
        <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>{manageView === 'list' ? 'Manage Wards' : manageView === 'add' ? 'Add Ward' : 'Edit Ward'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowManageModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              {manageError && (
                <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '0.82rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiAlertCircle /> {manageError}
                </div>
              )}

              {manageView === 'list' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {wards.map(w => {
                      const wt = wardTotals[w.id];
                      return (
                        <div key={w.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-tertiary)',
                        }}>
                          <FiHome style={{ color: 'var(--color-accent)' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{w.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{w.totalBeds} beds ({wt?.occupied || 0} occupied, {wt?.available || 0} free)</div>
                          </div>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditWard(w)} title="Edit"><FiEdit2 /></button>
                          <button className="btn btn-ghost btn-sm text-danger" onClick={() => {
                            if (wt?.occupied > 0) { setManageError('Cannot delete ward with occupied beds'); return; }
                            if (confirm(`Delete ${w.name} and all its beds?`)) handleDeleteWard(w.id);
                          }} title={wt?.occupied > 0 ? 'Ward has occupied beds' : 'Delete ward'}><FiTrash2 /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleAddBed(w.id)} title="Add bed"><FiPlus /></button>
                        </div>
                      );
                    })}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={openAddWard}><FiPlus /> Add Ward</button>
                </>
              )}

              {manageView !== 'list' && (
                <form onSubmit={handleManageSubmit}>
                  <div className="form-group">
                    <label>Ward Name *</label>
                    <input className="form-control" value={manageForm.name} onChange={e => setManageForm({ ...manageForm, name: e.target.value })} placeholder="e.g. Cardiology" required autoFocus />
                  </div>
                  <div className="form-group">
                    <label>Number of Beds *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setManageForm({ ...manageForm, totalBeds: Math.max(1, manageForm.totalBeds - 1) })}>–</button>
                      <input className="form-control" type="number" min="1" max="999" style={{ textAlign: 'center', width: 80 }} value={manageForm.totalBeds} onChange={e => setManageForm({ ...manageForm, totalBeds: parseInt(e.target.value) || 1 })} required />
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setManageForm({ ...manageForm, totalBeds: manageForm.totalBeds + 1 })}>+</button>
                    </div>
                  </div>
                  <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--color-border)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setManageView('list')}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><FiSave /> {editingWard ? 'Save Changes' : 'Create Ward'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
