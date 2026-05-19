import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="nav-logo" onClick={() => navigate('/')}>Dhruvix</div>

      <ul className="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#process">Process</a></li>
        <li><a href="#services">Pricing</a></li>
        {!user && <li><Link to="/auth">Login / Sign Up</Link></li>}
        {user && (
          <li>
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
              {user.role === 'admin' ? '⚡ Admin Panel' : '📋 Dashboard'}
            </Link>
          </li>
        )}
      </ul>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff'
            }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: 13, color: 'var(--t)' }}>{user.name?.split(' ')[0]}</span>
          </div>
          <button id="nav-logout" className="nav-cta" onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--td)' }}>
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <button id="nav-start-project" className="nav-cta" onClick={() => navigate('/auth')}>
          <span>Start Project ↗</span>
        </button>
      )}
    </motion.nav>
  )
}
