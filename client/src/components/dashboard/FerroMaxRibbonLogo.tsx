export const FerroMaxRibbonLogo = ({ className = "size-7" }: { className?: string }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M7 13.5C11 8.5 17 8.5 21 11.5C24.5 14 27.5 14 29 12.5"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M7 22.5C11 27.5 17 27.5 21 24.5C24.5 22 27.5 22 29 23.5"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      className="opacity-75"
    />
    <circle cx="18" cy="18" r="2.8" fill="currentColor" />
  </svg>
);
