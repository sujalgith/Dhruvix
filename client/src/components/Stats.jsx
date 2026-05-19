import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: '3X', label: 'Avg. client ROI' },
  { value: '48H', label: 'First draft delivery' },
  { value: '24/7', label: 'AI agent uptime' },
  { value: '∞', label: 'Growth potential' },
]

function StatItem({ stat, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <motion.div
      className="stat"
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <div className="stat-n">{stat.value}</div>
      <div className="stat-l">{stat.label}</div>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <div className="stats-sec">
      {stats.map((s, i) => (
        <StatItem key={s.label} stat={s} index={i} />
      ))}
    </div>
  )
}
