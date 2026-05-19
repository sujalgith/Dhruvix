const items = [
  'Websites', 'Digital Ads', 'AI Agents', 'SEO', 'Branding',
  'Automation', 'Chatbots', 'Lead Gen', 'UI Design',
  'WhatsApp Bots', 'Landing Pages', 'Google Ads',
]

// Duplicate enough times for seamless loop
const repeated = [...items, ...items, ...items, ...items]

export default function Marquee() {
  return (
    <div className="marquee-section">
      <div className="mq-track">
        {repeated.map((w, i) => (
          <span key={i} className="mq-item">
            {w}<span className="mq-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
