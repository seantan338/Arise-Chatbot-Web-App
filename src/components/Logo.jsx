// Simple "rising sun over horizon" mark for Arise Real Estate — pure SVG so it
// scales crisply and needs no asset pipeline. `className` controls the size.
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Arise Real Estate">
      <defs>
        <linearGradient id="ariseSun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8A838" />
          <stop offset="100%" stopColor="#14A085" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="#095155" />
      {/* sun */}
      <circle cx="24" cy="27" r="8.5" fill="url(#ariseSun)" />
      {/* rays */}
      {[...Array(7)].map((_, i) => {
        const angle = (-90 + (i - 3) * 26) * (Math.PI / 180)
        const x1 = 24 + Math.cos(angle) * 11
        const y1 = 27 + Math.sin(angle) * 11
        const x2 = 24 + Math.cos(angle) * 15
        const y2 = 27 + Math.sin(angle) * 15
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#E8A838"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        )
      })}
      {/* horizon */}
      <rect x="9" y="33" width="30" height="2.4" rx="1.2" fill="#C0E8EA" />
    </svg>
  )
}
