import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  ErreurApi,
  type DeclarationDetail,
  type Parent,
  type Piece,
} from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

interface Action {
  label: string;
  cible: string;
  danger?: boolean;
}

/** Actions proposées à l'agent selon le statut courant (le back-end fait foi). */
function actionsPour(statut: string): Action[] {
  switch (statut) {
    case 'Soumis':
      return [{ label: 'Prendre en charge', cible: 'EnVerification' }];
    case 'EnVerification':
      return [
        { label: 'Valider', cible: 'Valide' },
        { label: 'Demander des compléments', cible: 'PiecesDemandees' },
        { label: 'Refuser', cible: 'Refuse', danger: true },
      ];
    case 'Valide':
      return [{ label: "Générer l'acte", cible: 'ActeGenere' }];
    case 'ActeGenere':
      return [{ label: 'Marquer disponible', cible: 'Disponible' }];
    case 'Disponible':
      return [{ label: 'Marquer retiré', cible: 'Retire' }];
    default:
      return [];
  }
}

function BlocParent({ titre, parent }: { titre: string; parent: Parent }) {
  return (
    <div className="carte">
      <h2>{titre}</h2>
      <dl className="recap">
        <dt>Nom et prénoms</dt>
        <dd>{parent?.prenoms} {parent?.nom}</dd>
        {parent?.numeroPiece && (<><dt>N° pièce d'identité</dt><dd>{parent.numeroPiece}</dd></>)}
        {parent?.nationalite && (<><dt>Nationalité</dt><dd>{parent.nationalite}</dd></>)}
        {parent?.profession && (<><dt>Profession</dt><dd>{parent.profession}</dd></>)}
        {parent?.telephone && (<><dt>Téléphone</dt><dd>{parent.telephone}</dd></>)}
        {parent?.adresse && (<><dt>Adresse</dt><dd>{parent.adresse}</dd></>)}
      </dl>
    </div>
  );
}

export function AgentDetailDeclaration() {
  const { id } = useParams();
  const { token } = useAuth();
  const [decl, setDecl] = useState<DeclarationDetail | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(() => {
    if (!token || !id) return;
    api.obtenirAgent(id, token).then(setDecl).catch(() => setErreur('Dossier introuvable.'));
    api.listerDocuments('DeclarationNaissance', id, token).then((r) => setPieces(r.items)).catch(() => {});
  }, [id, token]);

  useEffect(() => { charger(); }, [charger]);

  async function agir(cible: string) {
    if (!token || !id) return;
    setEnCours(true);
    setErreur('');
    setMessage('');
    try {
      const misAJour = await api.changerStatut(id, cible, motif || undefined, token);
      setDecl(misAJour);
      setMotif('');
      setMessage(`Dossier mis à jour : ${misAJour.statut}.`);
      charger();
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Action impossible. Réessayez.');
    } finally {
      setEnCours(false);
    }
  }

  if (erreur && !decl) return <div className="alerte alerte--erreur">{erreur}</div>;
  if (!decl) return <p className="muet">Chargement…</p>;

  const enfant = decl.enfant as Record<string, unknown>;
  const actions = actionsPour(decl.statut);

  return (
    <>
      <p><Link to="/agent">← Retour à la file</Link></p>
      <h1>Dossier {decl.numeroSuivi}</h1>
      <p className="sous-titre">
        Statut : <span className="badge">{decl.statut}</span>
        {decl.numeroActeOfficiel && <> · Acte n° {decl.numeroActeOfficiel}</>}
      </p>

      {message && <div className="alerte alerte--succes">{message}</div>}
      {erreur && <div className="alerte alerte--erreur">{erreur}</div>}

      <div className="carte">
        <h2>Enfant</h2>
        <dl className="recap">
          <dt>Nom et prénoms</dt>
          <dd>{String(enfant.prenoms ?? '')} {String(enfant.nom ?? '')}</dd>
          <dt>Sexe</dt><dd>{String(enfant.sexe ?? '')}</dd>
          <dt>Naissance</dt>
          <dd>
            {String(enfant.dateNaissance ?? '')}
            {enfant.heureNaissance ? ` à ${String(enfant.heureNaissance)}` : ''}
            {enfant.lieuNaissance ? ` — ${String(enfant.lieuNaissance)}` : ''}
          </dd>
          {enfant.centreSante ? (<><dt>Centre de santé</dt><dd>{String(enfant.centreSante)}</dd></>) : null}
          <dt>Déclarant</dt><dd>{decl.typeDeclarant}</dd>
        </dl>
      </div>

      <BlocParent titre="Père" parent={decl.pere} />
      <BlocParent titre="Mère" parent={decl.mere} />

      <div className="carte">
        <h2>Pièces jointes</h2>
        {pieces.length === 0 ? (
          <p className="muet">Aucune pièce téléversée.</p>
        ) : (
          <ul className="liste-dossier">
            {pieces.map((p) => (
              <li key={p.id}><span>{p.nom}</span><span className="muet">{p.mimeType}</span></li>
            ))}
          </ul>
        )}
      </div>

      {decl.motifRefus && (
        <div className="alerte alerte--erreur">Motif du refus : {decl.motifRefus}</div>
      )}

      {actions.length > 0 && (
        <div className="carte">
          <h2>Action</h2>
          <label className="champ">
            <span className="champ__label">Motif / note (obligatoire pour un refus)</span>
            <input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex. acte de naissance du père manquant"
            />
          </label>
          <div className="barre-boutons" style={{ flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' }}>
            {actions.map((a) => (
              <button
                key={a.cible}
                className={`btn ${a.danger ? 'btn--secondaire' : ''}`}
                style={a.danger ? { color: '#dc2626', borderColor: '#fecaca' } : undefined}
                disabled={enCours}
                onClick={() => agir(a.cible)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {decl.transitions && decl.transitions.length > 0 && (
        <div className="carte">
          <h2>Journal du dossier</h2>
          <ul className="liste-dossier">
            {decl.transitions.map((t) => (
              <li key={t.id}>
                <span>
                  {t.ancienStatut ? `${t.ancienStatut} → ` : ''}{t.nouveauStatut}
                  {t.motif ? ` — ${t.motif}` : ''}
                </span>
                <span className="muet">{new Date(t.creeLe).toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
