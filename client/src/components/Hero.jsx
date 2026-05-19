import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const words = ['websites that convert.', 'ads that get results.', 'AI agents that work 24/7.', 'digital growth systems.', 'brands that stand out.']

function useTypewriter(wordList, typingSpeed = 60, deletingSpeed = 40, pauseMs = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = wordList[wordIndex]
    let timeout
    if (!deleting && display.length < word.length) timeout = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), typingSpeed)
    else if (!deleting && display.length === word.length) timeout = setTimeout(() => setDeleting(true), pauseMs)
    else if (deleting && display.length > 0) timeout = setTimeout(() => setDisplay(word.slice(0, display.length - 1)), deletingSpeed)
    else if (deleting && display.length === 0) { setDeleting(false); setWordIndex(i => (i + 1) % wordList.length) }
    return () => clearTimeout(timeout)
  }, [display, deleting, wordIndex, wordList, typingSpeed, deletingSpeed, pauseMs])
  return display
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const lineVariant = { hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }

export default function Hero() {
  const navigate = useNavigate()
  const typed = useTypewriter(words)

  return (
    <section className="hero">
      <motion.div className="hero-badge" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
        <span className="live-dot" />Now taking clients — Indore, India
      </motion.div>
      <motion.h1 className="hero-h" variants={containerVariants} initial="hidden" animate="visible">
        <span className="line-wrap"><motion.span className="l1" variants={lineVariant}>WE BUILD</motion.span></span>
        <span className="line-wrap"><motion.span className="l2" variants={lineVariant}>DIGITAL</motion.span></span>
        <span className="line-wrap"><motion.span className="l3" variants={lineVariant}>EMPIRES.</motion.span></span>
      </motion.h1>
      <motion.div className="typed-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7 }}>
        We create <span className="typed-word">{typed}</span><span className="cursor-blink">|</span>
      </motion.div>
      <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.7 }}>
        Websites that stop the scroll. Ads that bring real leads. AI agents that work while you sleep. All for small businesses ready to grow.
      </motion.p>
      <motion.div className="hero-btns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: 0.7 }}>
        <button id="hero-strategy-call" className="btn-main" onClick={() => navigate('/auth')}>Get a free strategy call ↗</button>
        <button id="hero-view-work" className="btn-ghost2" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>View our work</button>
      </motion.div>
      <motion.div className="scroll-ind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
        <div className="scroll-line" /><span className="scroll-txt">Scroll</span>
      </motion.div>
    </section>
  )
}
