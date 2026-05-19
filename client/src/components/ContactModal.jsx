import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Server error')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again or WhatsApp us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal-box"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <button id="modal-close" className="modal-close" onClick={onClose} aria-label="Close">✕</button>

          {success ? (
            <div className="form-success">
              <div className="success-icon">🚀</div>
              <div className="modal-h">We'll be in touch!</div>
              <p>Thanks for reaching out. Our team will contact you within 24 hours to schedule your free strategy call.</p>
            </div>
          ) : (
            <>
              <div className="modal-h">Start your project</div>
              <div className="modal-sub">Free strategy call — no commitment needed.</div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="contact-name">Your name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-phone">WhatsApp number</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-service">Service interested in</label>
                  <select
                    id="contact-service"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service...</option>
                    <option value="website">Website Design & Dev</option>
                    <option value="ads">Performance Ads</option>
                    <option value="ai">AI Agents & Chatbots</option>
                    <option value="full">Full Package</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Tell us about your business</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder="We run a local restaurant and want more online orders..."
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                <button
                  id="contact-submit"
                  type="submit"
                  className="form-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Sending…' : 'Book free strategy call ↗'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
