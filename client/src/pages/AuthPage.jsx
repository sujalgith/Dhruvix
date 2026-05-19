import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { API } from '../context/AuthContext'

// ── 6-box OTP Input ──────────────────────────────────────────────
function OTPInput({ onComplete }) {
  const [digits, setDigits] = useState(Array(6).fill(''))
  const refs = useRef([])

  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
    if (next.every(d => d)) onComplete(next.join(''))
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setDigits(text.split(''))
      onComplete(text)
      refs.current[5]?.focus()
    }
  }

  return (
    <div className="otp-inputs">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          className="otp-box"
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          maxLength={1}
          inputMode="numeric"
        />
      ))}
    </div>
  )
}

// ── Auth Page ────────────────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [tab, setTab] = useState('login')       // 'login' | 'signup'
  const [method, setMethod] = useState('email') // 'email' | 'phone'
  const [value, setValue] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState('input')     // 'input' | 'otp'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const placeholder = method === 'email' ? 'you@example.com' : '+91 98765 43210'
  const label = method === 'email' ? 'Email Address' : 'Mobile Number'

  const switchTab = (t) => {
    setTab(t); setStep('input'); setError(''); setSent(false); setValue(''); setName('')
  }
  const switchMethod = (m) => {
    setMethod(m); setStep('input'); setError(''); setSent(false); setValue('')
  }

  const handleSendOTP = async () => {
    if (!value.trim()) return setError(`Please enter your ${label.toLowerCase()}`)
    if (tab === 'signup' && !name.trim()) return setError('Please enter your name')
    setLoading(true); setError('')
    try {
      await API.post('/api/auth/send-otp', { method, value: value.trim() })
      setStep('otp'); setSent(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send OTP. Try again.')
    } finally { setLoading(false) }
  }

  const handleVerify = async (otpVal) => {
    const code = otpVal || otp
    if (code.length < 6) return setError('Enter all 6 digits')
    setLoading(true); setError('')
    try {
      const res = await API.post('/api/auth/verify-otp', {
        method, value: value.trim(), otp: code,
        name: name.trim() || undefined,
      })
      login(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (e) {
      setError(e.response?.data?.error || 'Wrong OTP. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      {/* Background glow orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <Link to="/" className="auth-logo">Dhruvix</Link>
        <p className="auth-tagline">Your digital growth partner</p>

        {/* Tabs */}
        <div className="auth-tabs">
          {['login', 'signup'].map(t => (
            <button
              key={t}
              className={`auth-tab ${tab === t ? 'active' : ''}`}
              onClick={() => switchTab(t)}
            >
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab + step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'input' ? (
              <>
                {/* Name field for sign up */}
                {tab === 'signup' && (
                  <div className="auth-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    />
                  </div>
                )}

                {/* Method toggle */}
                <div className="method-toggle">
                  <button
                    className={method === 'email' ? 'active' : ''}
                    onClick={() => switchMethod('email')}
                  >
                    📧 Email
                  </button>
                  <button
                    className={method === 'phone' ? 'active' : ''}
                    onClick={() => switchMethod('phone')}
                  >
                    📱 Mobile
                  </button>
                </div>

                <div className="auth-field">
                  <label>{label}</label>
                  <input
                    type={method === 'email' ? 'email' : 'tel'}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    autoFocus
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-btn" onClick={handleSendOTP} disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : `Send OTP →`}
                </button>

                <p className="auth-switch">
                  {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}>
                    {tab === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </>
            ) : (
              <>
                <div className="otp-sent-msg">
                  <span>✅</span>
                  <div>
                    <strong>OTP sent!</strong>
                    <p>Check your {method === 'email' ? 'email' : 'mobile'} — <em>{value}</em></p>
                  </div>
                </div>

                <label className="otp-label">Enter 6-digit OTP</label>
                <OTPInput onComplete={(v) => { setOtp(v); handleVerify(v) }} />

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-btn" onClick={() => handleVerify(otp)} disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Verify & Continue →'}
                </button>

                <button className="auth-resend" onClick={() => { setStep('input'); setSent(false); setError('') }}>
                  ← Change {method === 'email' ? 'email' : 'number'}
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
