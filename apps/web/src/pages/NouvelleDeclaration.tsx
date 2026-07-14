import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { declarationNaissanceSchema, SEXES, TYPES_DECLARANT } from '@e-mairie/shared';
import { Champ } from '../components/Champ';
import { api } from '../lib/api';
import { appliquerErreursServeur } from '../lib/erreurs';
import { lireOcr, extraireNumeroPiece } from '../lib/ocr';
import { useAuth } from '../auth/AuthContext';

type Prefixe = 'pere' | 'mere';
interface PieceParent {
  fichier: File;
  texteOcr: string;
}

const LABEL_SEXE: Record<string, string> = { M: 'Masculin', F: 'Féminin' };
const LABEL_DECLARANT: Record<string, string> = {
  Pere: 'Père', Mere: 'Mère', Tuteur: 'Tuteur',
  SageFemme: 'Sage-femme', AgentDeSante: 'Agent de santé', Autre: 'Autre',
};

const ETAPES = ["L'enfant", 'Le père', 'La mère', 'Le déclarant', 'Vérification'];

export function NouvelleDeclaration() {
  const naviguer = useNavigate();
  const { token } = useAuth();
  const [etape, setEtape] = useState(0);
  const [honneur, setHonneur] = useState(false);
  const [erreurGlobale, setErreurGlobale] = useState('');
  // Pièces d'identité téléversées, par parent, avec leur texte OCR.
  const [pieces, setPieces] = useState<Partial<Record<Prefixe, PieceParent>>>({});
  const [ocrEnCours, setOcrEnCours] = useState<Prefixe | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(declarationNaissanceSchema) as never,
    defaultValues: {
      enfant: {
        nom: '', prenoms: '', sexe: '', dateNaissance: '', heureNaissance: '',
        lieuNaissance: '', centreSante: '', poidsGrammes: '', typeAccouchement: '',
      },
      pere: { nom: '', prenoms: '', dateNaissance: '', nationalite: '', profession: '', adresse: '', telephone: '', numeroPiece: '' },
      mere: { nom: '', prenoms: '', dateNaissance: '', nationalite: '', profession: '', adresse: '', telephone: '', numeroPiece: '' },
      typeDeclarant: '',
    },
  });

  const CHAMPS_ETAPE = ['enfant', 'pere', 'mere', 'typeDeclarant'] as const;

  async function suivant() {
    const valide = await trigger(CHAMPS_ETAPE[etape] as never);
    if (valide) setEtape((e) => Math.min(e + 1, ETAPES.length - 1));
  }

  /** Lit la pièce (OCR), pré-remplit le numéro de pièce, et la garde pour l'envoi. */
  async function onFichier(prefixe: Prefixe, fichier: File | undefined) {
    if (!fichier) return;
    setOcrEnCours(prefixe);
    try {
      const texteOcr = await lireOcr(fichier);
      const numero = extraireNumeroPiece(texteOcr);
      // On ne pré-remplit que si le champ est vide, pour ne pas écraser une saisie.
      if (numero && !getValues(`${prefixe}.numeroPiece`)) {
        setValue(`${prefixe}.numeroPiece`, numero);
      }
      setPieces((p) => ({ ...p, [prefixe]: { fichier, texteOcr } }));
    } catch {
      // Échec OCR : on garde quand même la pièce (l'image source compte).
      setPieces((p) => ({ ...p, [prefixe]: { fichier, texteOcr: '' } }));
    } finally {
      setOcrEnCours(null);
    }
  }

  const envoyer = handleSubmit(async (valeurs) => {
    if (!token) return;
    setErreurGlobale('');
    try {
      const creee = await api.creerDeclaration(valeurs, token);
      // Téléversement des pièces d'identité rattachées à la déclaration.
      for (const prefixe of ['pere', 'mere'] as const) {
        const piece = pieces[prefixe];
        if (!piece) continue;
        const fd = new FormData();
        fd.append('fichier', piece.fichier);
        fd.append('entite', 'DeclarationNaissance');
        fd.append('entiteId', creee.id);
        if (piece.texteOcr) fd.append('texteOcr', piece.texteOcr);
        await api.televerser(fd, token);
      }
      const soumise = await api.soumettreDeclaration(creee.id, token);
      naviguer(`/declarations/${soumise.id}`);
    } catch (e) {
      setErreurGlobale(appliquerErreursServeur(e, setError));
    }
  });

  function blocParent(prefixe: 'pere' | 'mere') {
    const err = errors[prefixe] as Record<string, { message?: string }> | undefined;
    return (
      <>
        <div className="grille-2">
          <Champ label="Nom" requis erreur={err?.nom?.message}>
            <input {...register(`${prefixe}.nom`)} />
          </Champ>
          <Champ label="Prénom(s)" requis erreur={err?.prenoms?.message}>
            <input {...register(`${prefixe}.prenoms`)} />
          </Champ>
        </div>
        <div className="grille-2">
          <Champ label="Date de naissance" erreur={err?.dateNaissance?.message}>
            <input type="date" {...register(`${prefixe}.dateNaissance`, {
              setValueAs: (v) => (v === '' ? undefined : v),
            })} />
          </Champ>
          <Champ label="Nationalité" erreur={err?.nationalite?.message}>
            <input {...register(`${prefixe}.nationalite`)} />
          </Champ>
        </div>
        <div className="grille-2">
          <Champ label="Profession" erreur={err?.profession?.message}>
            <input {...register(`${prefixe}.profession`)} />
          </Champ>
          <Champ label="Téléphone" erreur={err?.telephone?.message}>
            <input type="tel" {...register(`${prefixe}.telephone`)} />
          </Champ>
        </div>
        <Champ label="Adresse" erreur={err?.adresse?.message}>
          <input {...register(`${prefixe}.adresse`)} />
        </Champ>
        <Champ label="Numéro de la pièce d'identité" erreur={err?.numeroPiece?.message}>
          <input {...register(`${prefixe}.numeroPiece`)} />
        </Champ>

        <Champ label="Pièce d'identité (photo ou image)">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={ocrEnCours !== null}
            onChange={(e) => onFichier(prefixe, e.target.files?.[0])}
          />
        </Champ>
        {ocrEnCours === prefixe && (
          <p className="muet">🔍 Lecture de la pièce en cours… (cela peut prendre quelques secondes)</p>
        )}
        {pieces[prefixe] && ocrEnCours !== prefixe && (
          <div className="alerte alerte--info">
            ✓ Pièce ajoutée : {pieces[prefixe]!.fichier.name}.
            {pieces[prefixe]!.texteOcr
              ? ' Le numéro a pu être pré-rempli — vérifiez et corrigez si besoin.'
              : ' (Lecture automatique indisponible, saisissez les champs à la main.)'}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <h1>Déclaration de naissance</h1>
      <p className="sous-titre">Étape {etape + 1} sur {ETAPES.length} — {ETAPES[etape]}</p>

      <div className="etapes">
        {ETAPES.map((_, i) => (
          <span key={i} className={`etape ${i <= etape ? 'etape--active' : ''}`} />
        ))}
      </div>

      {erreurGlobale && <div className="alerte alerte--erreur">{erreurGlobale}</div>}

      <form onSubmit={envoyer} noValidate className="carte">
        {etape === 0 && (
          <>
            <div className="grille-2">
              <Champ label="Nom" requis erreur={errors.enfant?.nom?.message}>
                <input {...register('enfant.nom')} />
              </Champ>
              <Champ label="Prénom(s)" requis erreur={errors.enfant?.prenoms?.message}>
                <input {...register('enfant.prenoms')} />
              </Champ>
            </div>
            <div className="grille-2">
              <Champ label="Sexe" requis erreur={errors.enfant?.sexe?.message}>
                <select {...register('enfant.sexe')}>
                  <option value="">—</option>
                  {SEXES.map((s) => <option key={s} value={s}>{LABEL_SEXE[s]}</option>)}
                </select>
              </Champ>
              <Champ label="Date de naissance" requis erreur={errors.enfant?.dateNaissance?.message}>
                <input type="date" {...register('enfant.dateNaissance')} />
              </Champ>
            </div>
            <div className="grille-2">
              <Champ label="Heure de naissance" erreur={errors.enfant?.heureNaissance?.message}>
                <input type="time" {...register('enfant.heureNaissance')} />
              </Champ>
              <Champ label="Lieu de naissance" requis erreur={errors.enfant?.lieuNaissance?.message}>
                <input {...register('enfant.lieuNaissance')} />
              </Champ>
            </div>
            <div className="grille-2">
              <Champ label="Centre de santé" erreur={errors.enfant?.centreSante?.message}>
                <input {...register('enfant.centreSante')} />
              </Champ>
              <Champ label="Poids (grammes)" erreur={errors.enfant?.poidsGrammes?.message}>
                <input type="number" {...register('enfant.poidsGrammes', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })} />
              </Champ>
            </div>
          </>
        )}

        {etape === 1 && blocParent('pere')}
        {etape === 2 && blocParent('mere')}

        {etape === 3 && (
          <Champ label="Qui déclare la naissance ?" requis erreur={errors.typeDeclarant?.message}>
            <select {...register('typeDeclarant')}>
              <option value="">—</option>
              {TYPES_DECLARANT.map((t) => <option key={t} value={t}>{LABEL_DECLARANT[t]}</option>)}
            </select>
          </Champ>
        )}

        {etape === 4 && (
          <Recapitulatif valeurs={getValues()} honneur={honneur} setHonneur={setHonneur} />
        )}

        <div className="barre-boutons">
          {etape > 0 ? (
            <button type="button" className="btn btn--secondaire" onClick={() => setEtape((e) => e - 1)}>
              Précédent
            </button>
          ) : <span />}

          {etape < ETAPES.length - 1 ? (
            <button type="button" className="btn" onClick={suivant}>Suivant</button>
          ) : (
            <button type="submit" className="btn" disabled={isSubmitting || !honneur}>
              {isSubmitting ? 'Envoi…' : 'Signer et envoyer'}
            </button>
          )}
        </div>
      </form>
    </>
  );
}

/** Récapitulatif + déclaration sur l'honneur avant envoi. */
function Recapitulatif({
  valeurs,
  honneur,
  setHonneur,
}: {
  valeurs: { enfant: Record<string, unknown>; typeDeclarant: string };
  honneur: boolean;
  setHonneur: (v: boolean) => void;
}) {
  const e = valeurs.enfant;
  return (
    <>
      <h2>Vérifiez avant d'envoyer</h2>
      <dl className="recap">
        <dt>Enfant</dt>
        <dd>{String(e.prenoms ?? '')} {String(e.nom ?? '')} — {LABEL_SEXE[String(e.sexe)] ?? ''}</dd>
        <dt>Né(e) le</dt>
        <dd>{String(e.dateNaissance ?? '')} à {String(e.lieuNaissance ?? '')}</dd>
        <dt>Déclarant</dt>
        <dd>{LABEL_DECLARANT[valeurs.typeDeclarant] ?? '—'}</dd>
      </dl>

      <label className="champ" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 16 }}>
        <input
          type="checkbox"
          style={{ width: 'auto', marginTop: 4 }}
          checked={honneur}
          onChange={(ev) => setHonneur(ev.target.checked)}
        />
        <span>
          Je déclare sur l'honneur que les informations fournies sont exactes.
        </span>
      </label>
    </>
  );
}
