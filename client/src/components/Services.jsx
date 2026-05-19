import { motion } from 'framer-motion'

const services = [
  {
    no: '01',
    ico: '🌐',
    icoClass: 'ico1',
    title: 'Website Design & Dev',
    desc: 'Lightning-fast, mobile-first websites. Designed to convert visitors into paying customers. Delivered in 5–7 days.',
    price: 'Starting ₹8,000',
  },
  {
    no: '02',
    ico: '📈',
    icoClass: 'ico2',
    title: 'Performance Ads',
    desc: "Google & Meta campaigns with real ROI tracking. We don\u0027t just run ads \u2014 we bring you actual leads with data you can see.",
    price: 'Starting ₹5,000',
  },
  {
    no: '03',
    ico: '🤖',
    icoClass: 'ico3',
    title: 'AI Agents & Chatbots',
    desc: 'Custom AI-powered WhatsApp & website bots that capture leads, answer queries and book appointments 24/7.',
    price: 'Starting ₹10,000',
  },
]

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="sec-label">What we build</div>
      <div className="sec-title">Our <span>Services</span></div>
      <div className="svc-wrap">
        {services.map((s, i) => (
          <motion.div
            key={s.no}
            className="svc"
            custom={i}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -6 }}
          >
            <div className="svc-no">{s.no}</div>
            <div className={`svc-ico ${s.icoClass}`}>{s.ico}</div>
            <div className="svc-t">{s.title}</div>
            <div className="svc-d">{s.desc}</div>
            <span className="svc-price">{s.price}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
