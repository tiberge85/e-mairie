/**
 * Bandeau honnête signalant les données d'exemple : tant que les modules
 * correspondants (fiscalité, population, incidents…) n'existent pas, ces chiffres
 * sont illustratifs. Les KPI réels sont, eux, calculés depuis la base.
 */
import type { ReactNode } from 'react';

export function BanniereIllustrative({ children }: { children?: ReactNode }) {
  return (
    <div className="banniere-illustr">
      ⓘ {children ??
        "Aperçu de maquette : certains chiffres sont des exemples. Les indicateurs marqués « réel » proviennent de vos données."}
    </div>
  );
}
