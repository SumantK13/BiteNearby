export function Spotlight({ className = "", fill = "white" }) {
  return (
    <svg
      className={`animate-pulse pointer-events-none absolute z-[1] opacity-50 ${className}`}
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter)">
        <ellipse cx="300" cy="300" rx="200" ry="150" fill={fill} fillOpacity="0.4" />
      </g>
      <defs>
        <filter id="filter" x="0" y="0" width="600" height="600" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  )
}