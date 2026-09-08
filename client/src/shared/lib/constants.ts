export const DEFAULT_PRODUCT_IMAGE =
  "/placeholder-product.svg";

export const FALLBACK_PRODUCT_IMAGE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ferromaxBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf9" />
      <stop offset="100%" stop-color="#f1eae3" />
    </linearGradient>
    <linearGradient id="ferromaxAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#ferromaxBg)" />
  <rect x="20" y="20" width="360" height="360" rx="28" fill="none" stroke="#e8ded4" stroke-width="2" stroke-dasharray="6 6" />
  <g transform="translate(130, 110)">
    <rect x="0" y="0" width="140" height="120" rx="20" fill="#ffffff" stroke="#e2d6ca" stroke-width="3" />
    <path d="M15 95 L50 55 L80 85 L105 60 L125 95 Z" fill="#eaddd0" opacity="0.8" />
    <circle cx="45" cy="40" r="14" fill="url(#ferromaxAccent)" />
    <rect x="90" y="75" width="42" height="42" rx="12" fill="#ea580c" />
    <path d="M117 87 C115 85 112 85 110 87 L105 92 C104 93 103 94 103 96 L98 101 C97 102 97 104 98 105 L101 108 C102 109 104 109 105 108 L110 103 C112 103 113 102 114 101 L119 96 C121 94 121 91 119 89 L117 87 Z" fill="#ffffff" />
  </g>
  <text x="200" y="270" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#7a6a5c">
    Sin imagen disponible
  </text>
  <text x="200" y="292" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ea580c" letter-spacing="1.5">
    FERROMAX
  </text>
</svg>`);
