import { motion } from 'framer-motion'

const steps = [
  { no: '01', title: 'Discovery', desc: 'We learn your goals & audience', color: '#a855f7' },
  { no: '02', title: 'Strategy', desc: 'Custom plan for your market', color: '#818cf8' },
  { no: '03', title: 'Build', desc: 'Site, ads & AI in parallel', color: '#60a5fa' },
  { no: '04', title: 'Launch', desc: 'Go live, fully set up', color: '#34d399' },
  { no: '05', title: 'Grow', desc: 'Monthly reports & optimise', color: '#10b981' },
]

export default function Process() {
  return (
    <section className="process-sec" id="process">
      <div className="sec-label" style={{ justifyContent: 'center' }}>How it works</div>
      <div className="sec-title">From zero to <span>launched</span> in days</div>

      <div className="proc-wrap">
        {/* Connecting gradient line */}
        <div className="proc-line">
          <motion.div
            className="proc-line-inner"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
          />
        </div>

        {steps.map((s, i) => (
          <motion.div
            key={s.no}
            className="proc-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
          >
            <div
              className="proc-circle"
              style={{ '--pc': s.color }}
            >
              {s.no}
            </div>
            <div className="proc-t">{s.title}</div>
            <div className="proc-d">{s.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
