import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, API } from '../context/AuthContext'

const STATUS_OPTIONS = ['pending', 'in_progress', 'done']
const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' }
const STATUS_COLORS = { pending: '#f59e0b', in_progress: '#60a5fa', done: '#34d399' }

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('leads')
  const [stats, setStats] = useState({ totalUsers: 0, totalLeads: 0, pendingLeads: 0 })
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/leads'),
      API.get('/api/admin/users'),
    ]).then(([s, l, u]) => {
      setStats(s.data)
      setLeads(l.data)
      setUsers(u.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const updateLeadStatus = async (id, status) => {
    try {
      const res = await API.patch(`/api/admin/leads/${id}`, { status })
      setLeads(prev => prev.map(l => l._id === id ? res.data : l))
      setStats(prev => ({
        ...prev,
        pendingLeads: leads.filter(l => l._id !== id ? l.status === 'pending' : status === 'pending').length
      }))
    } catch { alert('Failed to update status') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      await API.delete(`/api/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
    } catch { alert('Failed to delete user') }
  }

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-logo">Dhruvix</div>
        <div className="admin-badge">⚡ Admin Panel</div>
        <nav className="dash-nav">
          <button className={`dash-nav-link ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>📋 Enquiries</button>
          <button className={`dash-nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</button>
          <Link to="/" className="dash-nav-link">🏠 Home</Link>
        </nav>
        <div className="dash-user-card">
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className="dash-user-name">{user?.name || 'Admin'}</div>
            <div className="dash-user-meta" style={{ color: '#a855f7' }}>Administrator</div>
          </div>
        </div>
        <button className="dash-logout" onClick={handleLogout}>← Logout</button>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Admin <span>Dashboard</span></h1>
            <p className="dash-subtitle">Manage all leads, users, and projects.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { label: 'Total Users', val: stats.totalUsers, icon: '👥', color: '#a855f7' },
            { label: 'Total Enquiries', val: stats.totalLeads, icon: '📋', color: '#60a5fa' },
            { label: 'Pending', val: stats.pendingLeads, icon: '⏳', color: '#f59e0b' },
          ].map(s => (
            <motion.div
              key={s.label}
              className="dash-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ borderTop: `2px solid ${s.color}` }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div className="dash-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="dash-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="dash-empty"><div className="spinner" /></div>
        ) : activeTab === 'leads' ? (
          <div className="dash-section">
            <h2 className="dash-section-title">All Enquiries <span className="count-pill">{leads.length}</span></h2>
            {leads.length === 0 ? (
              <div className="dash-empty"><p>No enquiries yet.</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Phone</th><th>Service</th><th>Message</th><th>Date</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l._id}>
                        <td><strong>{l.name}</strong><br /><span style={{ color: 'var(--td)', fontSize: 11 }}>{l.email}</span></td>
                        <td>{l.phone}</td>
                        <td><span className="tag">{l.service}</span></td>
                        <td style={{ maxWidth: 200 }}><span style={{ color: 'var(--td)', fontSize: 12 }}>{l.message || '—'}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--td)' }}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <select
                            className="status-select"
                            value={l.status}
                            onChange={e => updateLeadStatus(l._id, e.target.value)}
                            style={{ color: STATUS_COLORS[l.status] }}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="dash-section">
            <h2 className="dash-section-title">All Users <span className="count-pill">{users.length}</span></h2>
            {users.length === 0 ? (
              <div className="dash-empty"><p>No users yet.</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td style={{ color: 'var(--td)' }}>{u.email || '—'}</td>
                        <td style={{ color: 'var(--td)' }}>{u.phone || '—'}</td>
                        <td>
                          <span className="role-badge" style={{ background: u.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(96,165,250,0.1)', color: u.role === 'admin' ? '#a855f7' : '#60a5fa' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--td)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button className="del-btn" onClick={() => deleteUser(u._id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
