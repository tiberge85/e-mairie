/**
 * Logo « institution » (fronton à colonnes) dans une pastille ronde.
 * Repris de l'identité « Lumière Citoyenne » du prototype.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`logo ${className ?? ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 1 8v2h22V8L12 2zm-7 9v7H3v3h18v-3h-2v-7h-2v7h-2.5v-7h-2v7h-2v-7h-2v7H7v-7H5z" />
      </svg>
    </span>
  );
}
