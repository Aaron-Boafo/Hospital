import { useState, useRef, useEffect } from 'react';
import { useBills, usePatients, useCreateBill, useRecordPayment } from '../hooks';
import { PAYMENT_METHODS } from '../constants';
import { FiSearch, FiPlus, FiX, FiDollarSign, FiPrinter, FiTrash2, FiCreditCard } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { notify } from '../lib/notify';

const INITIAL_FORM = { patientId: '', items: [{ description: '', amount: '' }] };

const titleCase = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : '—');

export default function Billing() {
  const { data: bills = [], isLoading, error, refetch } = useBills();
  const { data: patients = [] } = usePatients();
  const createMutation = useCreateBill();
  const payMutation = useRecordPayment();

  useEffect(() => {
    if (error) notify.retry('Failed to load bills', () => refetch());
  }, [error, refetch]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);
  const receiptRef = useRef(null);

  const filtered = bills.filter(b => {
    const matchSearch = b.patient.name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePatientChange = (e) => {
    setForm(f => ({ ...f, patientId: e.target.value }));
  };

  const updateItem = (index, field, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { description: '', amount: '' }] }));
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  const total = form.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!form.patientId || form.items.some(it => !it.description || !it.amount)) return;
    const items = form.items.map(it => ({ description: it.description, amount: parseFloat(it.amount) }));
    notify.promise(createMutation.mutateAsync({ patientId: form.patientId, items }), {
      loading: 'Creating bill...',
      success: 'Bill created successfully',
    }).then(ok => {
      if (ok) {
        setShowCreateModal(false);
        setForm(INITIAL_FORM);
      }
    });
  };

  const handlePay = (e) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    notify.promise(payMutation.mutateAsync({ billId: showPayModal.id, input: { amount: amt, method: payMethod } }), {
      loading: 'Recording payment...',
      success: 'Payment recorded',
    }).then(ok => {
      if (ok) {
        setShowPayModal(null);
        setPayAmount('');
        setPayMethod(PAYMENT_METHODS[0]);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Receipt view
  if (showReceipt) {
    const bill = showReceipt;
    return (
      <>
        <div className="page-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setShowReceipt(null)}>← Back</button>
            <h1>Receipt</h1>
          </div>
          <button className="btn btn-primary" onClick={handlePrint}><FiPrinter /> Print</button>
        </div>
        <div className="page-body">
          <div ref={receiptRef} className="receipt" style={{ margin: '0 auto' }}>
            <h2>MediCare Hospital</h2>
            <p className="receipt-subtitle">Official Payment Receipt</p>
            <div className="receipt-line" />
            <div className="receipt-row"><span>Receipt #:</span><span>{bill.id}</span></div>
            <div className="receipt-row"><span>Date:</span><span>{bill.date}</span></div>
            <div className="receipt-row"><span>Patient:</span><span>{bill.patient.name}</span></div>
            <div className="receipt-row"><span>Patient ID:</span><span>{bill.patient.id}</span></div>
            <div className="receipt-line" />
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: '0.85rem' }}>Services:</div>
            {bill.items.map((item, i) => (
              <div key={i} className="receipt-row">
                <span>{item.description}</span>
                <span>GH₵{item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="receipt-row total">
              <span>Total</span>
              <span>GH₵{bill.total.toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span>Amount Paid</span>
              <span>GH₵{bill.paid.toFixed(2)}</span>
            </div>
            {bill.total - bill.paid > 0 && (
              <div className="receipt-row" style={{ color: '#ef4444' }}>
                <span>Balance Due</span>
                <span>GH₵{(bill.total - bill.paid).toFixed(2)}</span>
              </div>
            )}
            <div className="receipt-line" />
            <div className="receipt-row"><span>Payment Method:</span><span>{bill.paymentMethod || '—'}</span></div>
            <div className="receipt-row"><span>Status:</span><span style={{ fontWeight: 700, color: bill.status === 'PAID' ? '#22c55e' : '#f59e0b' }}>{titleCase(bill.status)}</span></div>
            <div className="receipt-line" />
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#999', marginTop: 16 }}>
              Thank you for choosing MediCare Hospital.<br />This is a computer-generated receipt.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Billing & Payments" />

      <div className="page-body fade-in">
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
            </select>
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{filtered.length} bills</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-box" style={{ maxWidth: 400 }}>
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search bills..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><FiPlus /> Create Bill</button>
            </div>
          </div>
        </div>

        {!isLoading && filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiDollarSign /></div>
            <h3>No bills found</h3>
            <p>Create a new bill to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
                )}
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><span className="badge badge-accent">{b.id}</span></td>
                    <td>{b.date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{b.patient.name}</td>
                    <td>GH₵{b.total.toFixed(2)}</td>
                    <td>GH₵{b.paid.toFixed(2)}</td>
                    <td style={{ color: b.total - b.paid > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      GH₵{(b.total - b.paid).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'PAID' ? 'badge-success' : b.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                        {titleCase(b.status)}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        {b.status !== 'PAID' && (
                          <button className="btn btn-success btn-sm" onClick={() => { setShowPayModal(b); setPayAmount(String(b.total - b.paid)); }} title="Record Payment">
                            <FiCreditCard /> Pay
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowReceipt(b)} title="Receipt">
                          <FiPrinter />
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

      {/* Create Bill Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2>Create New Bill</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateBill}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient *</label>
                  <select className="form-control" value={form.patientId} onChange={handlePatientChange} required>
                    <option value="">Select a patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Line Items *
                  </label>
                </div>

                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                    <input
                      className="form-control"
                      placeholder="Description (e.g. Consultation)"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      required
                      style={{ flex: 2 }}
                    />
                    <input
                      className="form-control"
                      placeholder="Amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount}
                      onChange={e => updateItem(i, 'amount', e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                    {form.items.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(i)}>
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 16 }}>
                  <FiPlus /> Add Line Item
                </button>

                <div style={{
                  padding: '14px 18px', background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between',
                  fontWeight: 700, fontSize: '1.1rem'
                }}>
                  <span>Total:</span>
                  <span style={{ color: 'var(--color-accent)' }}>GH₵{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating…' : 'Create Bill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowPayModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handlePay}>
              <div className="modal-body">
                <p className="text-muted" style={{ marginBottom: 16 }}>
                  Bill <strong>{showPayModal.id}</strong> for <strong>{showPayModal.patient.name}</strong><br />
                  Balance due: <strong style={{ color: 'var(--color-danger)' }}>GH₵{(showPayModal.total - showPayModal.paid).toFixed(2)}</strong>
                </p>
                <div className="form-group">
                  <label>Payment Amount *</label>
                  <input className="form-control" type="number" min="0.01" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select className="form-control" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={payMutation.isPending}>{payMutation.isPending ? 'Recording…' : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
