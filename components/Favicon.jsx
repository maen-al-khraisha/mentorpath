export default function Favicon({ className = '' }) {
  return (
    <div className={`w-6 h-6 ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Main Path Symbol */}
        <path
          d="M12 2L20 8V16L12 22L4 16V8L12 2Z"
          fill="url(#faviconGradient)"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Path Lines */}
        <path d="M12 6L16 9V15L12 18L8 15V9L12 6Z" fill="white" fillOpacity="0.9" />
        {/* Center Dot */}
        <circle cx="12" cy="12" r="1.5" fill="url(#faviconGradient)" />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
