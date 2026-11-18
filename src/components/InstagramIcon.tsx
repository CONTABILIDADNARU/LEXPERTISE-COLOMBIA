/** Ícono de Instagram. lucide-react ya no incluye íconos de marcas, por eso se dibuja aquí. */
export function InstagramIcon({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number; "aria-hidden"?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
