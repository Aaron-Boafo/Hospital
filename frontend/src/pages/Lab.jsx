import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { LAB_TESTS } from '../constants';
import { usePatients } from '../hooks';
import {
  FiSearch, FiPlus, FiX, FiCheckCircle, FiClock, FiUser,
  FiAlertCircle, FiActivity, FiFileText
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

export default function Lab() {
  const { labTests, labResults, orderLabTest, submitLabResult } = useData();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null);
  const [orderForm, setOrderForm] = useState({ patientId: '', patientName: '', testType: LAB_TESTS[0], orderedBy: '' });
  const [resultData, setResultData] = useState({ results: '', notes: '' });

  const filtered = labTests.filter(t => {
    const matchSearch = t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.testType.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getResult = (testId) => labResults.find(r => r.testId === testId);

  const openOrder = () => {
    setOrderForm({ patientId: '', patientName: '', testType: LAB_TESTS[0], orderedBy: '' });
    setShowOrderModal(true);
  };

  const handlePatientChange = (e) => {
    const patient = patients.find(p => p.id === e.target.value);
    setOrderForm(f => ({ ...f, patientId: patient?.id || '', patientName: patient?.name || '' }));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!orderForm.patientId || !orderForm.testType) return;
    orderLabTest(orderForm);
    setShowOrderModal(false);
  };

  const handleResultSubmit = (e) => {
    e.preventDefault();
    if (!resultData.results) return;
    submitLabResult(showResultModal.id, resultData.results, resultData.notes);
    setShowResultModal(null);
    setResultData({ results: '', notes: '' });
  };

  return (
    <>
      <PageHeader title="Laboratory" subtitle="Manage lab test orders and results" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {filtered.filter(t => t.status === 'Pending').length} pending / {filtered.length} total
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search by patient or test type..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={openOrder}><FiPlus /> Order Test</button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiActivity /></div>
            <h3>No lab tests found</h3>
            <p>Order a test to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Test Type</th>
                  <th>Status</th>
                  <th>Results</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const result = getResult(t.id);
                  return (
                    <tr key={t.id}>
                      <td><span className="badge badge-accent">{t.id}</span></td>
                      <td>{t.orderedDate}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.patientName}</td>
                      <td>{t.testType}</td>
                      <td>
                        <span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {t.status === 'Completed' ? <><FiCheckCircle style={{ verticalAlign: 'middle', marginRight: 4 }} /> Completed</> : <><FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} /> Pending</>}
                        </span>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {result ? result.results : '—'}
                      </td>
                      <td>
                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                          {t.status === 'Pending' && (
                            <button className="btn btn-success btn-sm" onClick={() => { setShowResultModal(t); setResultData({ results: '', notes: '' }); }}>
                              <FiCheckCircle /> Enter Result
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Test Modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Order Lab Test</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowOrderModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleOrderSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient *</label>
                  <select className="form-control" value={orderForm.patientId} onChange={handlePatientChange} required>
                    <option value="">Select a patient</option>
                    {patientsLoading && <option value="">Loading patients…</option>}
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Test Type *</label>
                  <select className="form-control" value={orderForm.testType} onChange={e => setOrderForm({ ...orderForm, testType: e.target.value })} required>
                    {LAB_TESTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ordered By</label>
                  <input className="form-control" value={orderForm.orderedBy} onChange={e => setOrderForm({ ...orderForm, orderedBy: e.target.value })} placeholder="Doctor name" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Order Test</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {showResultModal && (
        <div className="modal-overlay" onClick={() => setShowResultModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>Enter Lab Result</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowResultModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleResultSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                  Test: <strong>{showResultModal.testType}</strong> for <strong>{showResultModal.patientName}</strong>
                </p>
                <div className="form-group">
                  <label>Results / Values *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="e.g. WBC: 7.2 x10^9/L (Normal), Hemoglobin: 13.5 g/dL (Normal), Platelets: 250 x10^9/L (Normal)"
                    value={resultData.results}
                    onChange={e => setResultData({ ...resultData, results: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Additional observations..."
                    value={resultData.notes}
                    onChange={e => setResultData({ ...resultData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResultModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Submit Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
