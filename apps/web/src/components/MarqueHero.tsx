import { Logo } from './Logo';

/**
 * Bloc de marque centré, en tête des écrans d'authentification :
 * logo, nom en serif, filet doré, puis le titre de la page.
 */
export function MarqueHero({ titre, soustitre }: { titre: string; soustitre?: string }) {
  return (
    <div className="marque-hero">
      <Logo />
      <div className="marque-hero__nom">e-Mairie</div>
      <div className="marque-hero__divider" />
      <h1 className="marque-hero__titre">{titre}</h1>
      {soustitre && <p className="sous-titre">{soustitre}</p>}
    </div>
  );
}
