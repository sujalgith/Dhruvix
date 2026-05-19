import { motion } from 'framer-motion'

const pills = [
  { ico: '⚡', color: '#a855f7', title: 'Blazing fast', desc: 'First draft in 48 hours. No endless back and forth.' },
  { ico: '🧠', color: '#60a5fa', title: 'AI-powered', desc: 'Built with cutting-edge AI on every project.' },
  { ico: '₹', color: '#34d399', title: 'Indian pricing', desc: 'Premium results at prices that make sense.' },
  { ico: '⭐', color: '#fb923c', title: 'Long-term partner', desc: 'We don\'t disappear after launch. Ever.' },
]

export default function WhyUs({ onContact }) {
  return (
    <section className="why-sec">
      <motion.div
        className="why-left"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="sec-label">Why us</div>
        <div className="sec-title">The <span>North Star</span><br />of your growth</div>
        <p>
          Most agencies give you a template and disappear. Dhruvix becomes your long-term digital partner — tracking your growth, optimising campaigns, and building AI that scales with you.
        </p>
        <button id="why-see-work" className="btn-main" onClick={onContact}>
          See how we work ↗
        </button>
      </motion.div>

      <motion.div
        className="why-right"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {pills.map((p, i) => (
          <motion.div
            key={p.title}
            className="pill"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <span className="pill-ico" style={{ color: p.color }}>{p.ico}</span>
            <div className="pill-t">{p.title}</div>
            <div className="pill-d">{p.desc}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
