import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, API } from '../context/AuthContext'

const statusColors = { pending: '#f59e0b', in_progress: '#60a5fa', done: '#34d399' }
const statusLabels = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' }

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ phone: '', service: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => {
    API.get('/api/user/enquiries')
      .then(r => setEnquiries(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.phone) return alert('Phone number is required')
    setSubmitting(true)
    try {
      const res = await API.post('/api/contact', { ...form, name: user?.name, email: user?.email })
      setEnquiries(prev => [res.data.lead, ...prev])
      setFormSuccess(true)
      setTimeout(() => { setShowForm(false); setFormSuccess(false); setForm({ phone: '', service: '', message: '' }) }, 2000)
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit')
    } finally { setSubmitting(false) }
  }

  const stepProgress = (status) => {
    const steps = ['pending', 'in_progress', 'done']
    return steps.indexOf(status)
  }

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-logo">Dhruvix</div>
        <nav className="dash-nav">
          <a href="#enquiries" className="dash-nav-link active">📋 My Enquiries</a>
          <a href="#profile" className="dash-nav-link">👤 Profile</a>
          <Link to="/" className="dash-nav-link">🏠 Home</Link>
        </nav>
        <div className="dash-user-card">
          <div className="dash-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <div className="dash-user-name">{user?.name || 'User'}</div>
            <div className="dash-user-meta">{user?.email || user?.phone}</div>
          </div>
        </div>
        <button className="dash-logout" onClick={handleLogout}>← Logout</button>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Welcome back, <span>{user?.name?.split(' ')[0] || 'there'}</span> 👋</h1>
            <p className="dash-subtitle">Track your projects and enquiries below.</p>
          </div>
          <button className="btn-main" onClick={() => setShowForm(true)}>+ New Enquiry</button>
        </div>

        {/* Stats strip */}
        <div className="dash-stats">
          {[
            { label: 'Total Enquiries', val: enquiries.length },
            { label: 'In Progress', val: enquiries.filter(e => e.status === 'in_progress').length },
            { label: 'Completed', val: enquiries.filter(e => e.status === 'done').length },
          ].map(s => (
            <div className="dash-stat-card" key={s.label}>
              <div className="dash-stat-val">{s.val}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Enquiries */}
        <div className="dash-section" id="enquiries">
          <h2 className="dash-section-title">My Enquiries</h2>
          {loading ? (
            <div className="dash-empty"><div className="spinner" /></div>
          ) : enquiries.length === 0 ? (
            <div className="dash-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>No enquiries yet.</p>
              <button className="btn-main" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Start a project ↗</button>
            </div>
          ) : (
            <div className="enq-list">
              {enquiries.map((enq, i) => (
                <motion.div
                  key={enq._id}
                  className="enq-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="enq-top">
                    <div>
                      <div className="enq-service">{enq.service}</div>
                      <div className="enq-date">{new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <span className="enq-badge" style={{ background: statusColors[enq.status] + '22', color: statusColors[enq.status], border: `1px solid ${statusColors[enq.status]}44` }}>
                      {statusLabels[enq.status]}
                    </span>
                  </div>
                  {enq.message && <p className="enq-msg">"{enq.message}"</p>}

                  {/* Progress bar */}
                  <div className="enq-progress">
                    {['Pending', 'In Progress', 'Done'].map((s, idx) => (
                      <div key={s} className={`enq-step ${idx <= stepProgress(enq.status) ? 'done' : ''}`}>
                        <div className="enq-step-dot" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Enquiry Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            {formSuccess ? (
              <div className="form-success">
                <div className="success-icon">🚀</div>
                <div className="modal-h">Enquiry Submitted!</div>
                <p>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="modal-h">New Enquiry</div>
                <div className="modal-sub">Tell us what you need — we'll get back within 24 hours.</div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Service</label>
                    <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}>
                      <option value="">Select a service...</option>
                      <option value="Website Design & Dev">Website Design & Dev</option>
                      <option value="Performance Ads">Performance Ads</option>
                      <option value="AI Agents & Chatbots">AI Agents & Chatbots</option>
                      <option value="Full Package">Full Package</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tell us about your business</label>
                    <textarea placeholder="We run a local restaurant..." rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="form-submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Enquiry ↗'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
