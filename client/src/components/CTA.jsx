import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CTA() {
  const navigate = useNavigate()
  return (
    <div className="cta-sec">
      <div className="cta-glow" />
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }}>
        <div className="cta-h">Ready to grow?<br />Let's build.</div>
        <p className="cta-s">Free strategy call. No commitments. Just real clarity on how to grow your business online.</p>
        <button id="cta-book-call" className="btn-main" style={{ fontSize: '15px', padding: '16px 44px' }} onClick={() => navigate('/auth')}>
          Book a free call ↗
        </button>
      </motion.div>
    </div>
  )
}
