import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  FiDollarSign, FiCalendar, FiUsers, FiTrendingUp,
  FiDownload, FiFilter, FiBarChart2, FiClock, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

function getRange(period) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (period === 'today') return { start: today, end: today };
  if (period === 'week') {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    return { start: start.toISOString().slice(0, 10), end: today };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: start.toISOString().slice(0, 10), end: today };
  }
  return { start: '2000-01-01', end: today };
}

function BarChart({ data, maxVal, labelKey, valueKey, color }) {
  const max = maxVal || Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{d[valueKey]}</span>
          <div style={{
            width: '100%', maxWidth: 48, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: color || 'var(--color-accent)',
            height: `${(d[valueKey] / max) * 100}%`, minHeight: d[valueKey] > 0 ? 4 : 0,
            transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function DonutLegend({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }} />
          <span style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{item.label}</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const { patients, doctors, appointments, bills, activities, bedStats } = useData();
  const [period, setPeriod] = useState('today');

  const range = useMemo(() => getRange(period), [period]);

  const filteredAppointments = useMemo(() =>
    appointments.filter(a => a.date >= range.start && a.date <= range.end),
    [appointments, range]
  );

  const filteredBills = useMemo(() =>
    bills.filter(b => b.date >= range.start && b.date <= range.end),
    [bills, range]
  );

  const filteredPatients = useMemo(() =>
    patients.filter(p => p.createdAt >= range.start && p.createdAt <= range.end),
    [patients, range]
  );

  const totalRevenue = filteredBills.reduce((sum, b) => sum + b.paid, 0);
  const totalBilled = filteredBills.reduce((sum, b) => sum + b.total, 0);
  const outstanding = totalBilled - totalRevenue;

  const completedApts = filteredAppointments.filter(a => a.status === 'Completed').length;
  const scheduledApts = filteredAppointments.filter(a => a.status === 'Scheduled').length;
  const cancelledApts = filteredAppointments.filter(a => a.status === 'Cancelled').length;

  const deptData = useMemo(() => {
    const deptMap = {};
    filteredAppointments.forEach(a => {
      const doc = doctors.find(d => d.id === a.doctorId);
      const dept = doc?.department || 'Unknown';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAppointments, doctors]);

  const doctorData = useMemo(() => {
    const docMap = {};
    filteredAppointments.forEach(a => {
      docMap[a.doctorName] = (docMap[a.doctorName] || 0) + 1;
    });
    return Object.entries(docMap)
      .map(([name, count]) => ({ name: name.replace('Dr. ', ''), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredAppointments]);

  const dailyRevenue = useMemo(() => {
    const map = {};
    filteredBills.forEach(b => {
      map[b.date] = (map[b.date] || 0) + b.paid;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, amount]) => ({ label: date.slice(5), amount }));
  }, [filteredBills]);

  const dailyPatients = useMemo(() => {
    const map = {};
    filteredPatients.forEach(p => {
      map[p.createdAt] = (map[p.createdAt] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({ label: date.slice(5), count }));
  }, [filteredPatients]);

  const avgRevenuePerDay = dailyRevenue.length > 0
    ? Math.round(dailyRevenue.reduce((s, d) => s + d.amount, 0) / dailyRevenue.length)
    : 0;

  const paymentMethodData = useMemo(() => {
    const map = {};
    filteredBills.forEach(b => {
      if (b.paymentMethod) map[b.paymentMethod] = (map[b.paymentMethod] || 0) + b.paid;
    });
    const colors = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)', '#8b5cf6'];
    return Object.entries(map)
      .map(([method, amount], i) => ({ label: method, value: `GH₵${amount.toLocaleString()}`, color: colors[i % colors.length] }));
  }, [filteredBills]);

  const handleExport = () => {
    const rows = [
      ['Report', `Reports & Analytics — ${PERIODS.find(p => p.value === period)?.label}`],
      ['Generated', new Date().toLocaleString()],
      [],
      ['SUMMARY'],
      ['Revenue Collected', `GH₵${totalRevenue}`],
      ['Total Billed', `GH₵${totalBilled}`],
      ['Outstanding', `GH₵${outstanding}`],
      ['Total Appointments', filteredAppointments.length],
      ['Completed', completedApts],
      ['Scheduled', scheduledApts],
      ['Cancelled', cancelledApts],
      ['New Patients', filteredPatients.length],
      ['Active Doctors', doctors.filter(d => d.active).length],
      [],
      ['APPOINTMENTS'],
      ['ID', 'Date', 'Time', 'Patient', 'Doctor', 'Status', 'Notes'],
      ...filteredAppointments.map(a => [a.id, a.date, a.time, a.patientName, a.doctorName, a.status, a.notes || '']),
      [],
      ['BILLS'],
      ['ID', 'Date', 'Patient', 'Total', 'Paid', 'Balance', 'Status', 'Payment Method'],
      ...filteredBills.map(b => [b.id, b.date, b.patientName, b.total, b.paid, b.total - b.paid, b.status, b.paymentMethod || '']),
      [],
      ['DEPARTMENT BREAKDOWN'],
      ['Department', 'Appointments'],
      ...deptData.map(d => [d.name, d.count]),
    ];

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle="Track performance, revenue, and operational metrics" />

      <div className="page-body fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <FiFilter style={{ color: 'var(--color-text-muted)' }} />
          {PERIODS.map(p => (
            <button
              key={p.value}
              className={`btn btn-sm ${period === p.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary btn-sm" onClick={handleExport}><FiDownload /> Export</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card accent">
            <div className="stat-icon accent"><FiDollarSign /></div>
            <div className="stat-info">
              <h4>Revenue Collected</h4>
              <div className="stat-value">GH₵{totalRevenue.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon success"><FiCalendar /></div>
            <div className="stat-info">
              <h4>Appointments</h4>
              <div className="stat-value">{filteredAppointments.length}</div>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon info"><FiUsers /></div>
            <div className="stat-info">
              <h4>Bed Occupancy</h4>
              <div className="stat-value">{bedStats?.occupied || 0}/{bedStats?.total || 0}</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon warning"><FiTrendingUp /></div>
            <div className="stat-info">
              <h4>Outstanding</h4>
              <div className="stat-value">GH₵{outstanding.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Row 2: Revenue Trend + Appointment Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3><FiBarChart2 style={{ marginRight: 8, verticalAlign: 'middle' }} /> Revenue Trend</h3>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>Avg: GH₵{avgRevenuePerDay.toLocaleString()}/day</span>
            </div>
            {dailyRevenue.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}><p className="text-muted">No revenue data</p></div>
            ) : (
              <BarChart
                data={dailyRevenue}
                maxVal={Math.max(...dailyRevenue.map(d => d.amount))}
                labelKey="label"
                valueKey="amount"
                color="var(--color-success)"
              />
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3>Appointment Status</h3></div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%', position: 'relative',
                  background: `conic-gradient(
                    var(--color-success) 0deg ${(completedApts / Math.max(filteredAppointments.length, 1)) * 360}deg,
                    var(--color-info) ${(completedApts / Math.max(filteredAppointments.length, 1)) * 360}deg ${((completedApts + scheduledApts) / Math.max(filteredAppointments.length, 1)) * 360}deg,
                    var(--color-danger) ${((completedApts + scheduledApts) / Math.max(filteredAppointments.length, 1)) * 360}deg 360deg
                  )`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--color-bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{filteredAppointments.length}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Total</span>
                  </div>
                </div>
              </div>
              <DonutLegend items={[
                { label: 'Completed', value: completedApts, color: 'var(--color-success)' },
                { label: 'Scheduled', value: scheduledApts, color: 'var(--color-info)' },
                { label: 'Cancelled', value: cancelledApts, color: 'var(--color-danger)' },
              ]} />
            </div>
          </div>
        </div>

        {/* Row 3: Department + Top Doctors + Payment Methods */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h3>By Department</h3></div>
            {deptData.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}><p className="text-muted">No data</p></div>
            ) : (
              <BarChart
                data={deptData.map(d => ({ label: d.name.split(' ')[0], count: d.count }))}
                maxVal={Math.max(...deptData.map(d => d.count))}
                labelKey="label"
                valueKey="count"
                color="var(--color-accent)"
              />
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3>Top Doctors</h3></div>
            {doctorData.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}><p className="text-muted">No data</p></div>
            ) : (
              <BarChart
                data={doctorData}
                maxVal={Math.max(...doctorData.map(d => d.count))}
                labelKey="name"
                valueKey="count"
                color="#8b5cf6"
              />
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3>Payment Methods</h3></div>
            {paymentMethodData.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}><p className="text-muted">No data</p></div>
            ) : (
              <DonutLegend items={paymentMethodData} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
