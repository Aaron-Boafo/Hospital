import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
  const { stats, activities, appointments } = useData();
  const { user } = useAuth();

  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments.filter(a => a.date === today);

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 2 }}>
            Welcome back, {user?.name}
          </p>
        </div>
        <span className="badge badge-accent">{user?.role}</span>
      </div>

      <div className="page-body fade-in">
        <div className="stats-grid">
          <div className="stat-card accent">
            <div className="stat-icon accent"><FiUsers /></div>
            <div className="stat-info">
              <h4>Total Patients</h4>
              <div className="stat-value">{stats.totalPatients}</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon info"><FiCalendar /></div>
            <div className="stat-info">
              <h4>Today's Appointments</h4>
              <div className="stat-value">{stats.todaysAppointments}</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon success"><FiDollarSign /></div>
            <div className="stat-info">
              <h4>Today's Revenue</h4>
              <div className="stat-value">GH₵{stats.todaysRevenue.toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon warning"><FiTrendingUp /></div>
            <div className="stat-info">
              <h4>New Patients Today</h4>
              <div className="stat-value">{stats.todaysPatients}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          {/* Today's Appointments */}
          <div className="card">
            <div className="card-header">
              <h3>Today's Appointments</h3>
              <span className="badge badge-info">{todaysAppointments.length}</span>
            </div>
            {todaysAppointments.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <p className="text-muted">No appointments today</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map(apt => (
                      <tr key={apt.id}>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{apt.time}</td>
                        <td>{apt.patientName}</td>
                        <td>{apt.doctorName}</td>
                        <td>
                          <span className={`badge ${
                            apt.status === 'Completed' ? 'badge-success' :
                            apt.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            <ul className="activity-list">
              {activities.slice(0, 8).map(act => (
                <li key={act.id} className="activity-item">
                  <div className={`activity-dot ${act.type}`} />
                  <div>
                    <div className="activity-text">{act.text}</div>
                    <div className="activity-time">{formatTime(act.time)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
