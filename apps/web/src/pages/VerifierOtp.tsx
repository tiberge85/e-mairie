import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificationOtpSchema } from '@e-mairie/shared';
import { Champ } from '../components/Champ';
import { MarqueHero } from '../components/MarqueHero';
import { api } from '../lib/api';
import { appliquerErreursServeur } from '../lib/erreurs';
import { useAuth } from '../auth/AuthContext';

export function VerifierOtp() {
  const naviguer = useNavigate();
  const { connexion } = useAuth();
  const { state } = useLocation() as { state?: { identifiant?: string } };
  const [erreurGlobale, setErreurGlobale] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verificationOtpSchema) as never,
    defaultValues: { identifiant: state?.identifiant ?? '', code: '' },
  });

  const soumettre = handleSubmit(async (valeurs) => {
    setErreurGlobale('');
    try {
      const { jeton, citoyen } = await api.verifierOtp(valeurs);
      connexion(jeton, citoyen);
      naviguer(citoyen.role === 'CITOYEN' ? '/' : '/agent');
    } catch (e) {
      setErreurGlobale(appliquerErreursServeur(e, setError));
    }
  });

  return (
    <>
      <MarqueHero
        titre="Vérification"
        soustitre="Saisissez le code à 6 chiffres reçu par SMS. (En démo, le code s'affiche dans les logs du serveur.)"
      />
      <div className="carte">
      {erreurGlobale && <div className="alerte alerte--erreur">{erreurGlobale}</div>}

      <form onSubmit={soumettre} noValidate>
        <Champ label="Téléphone ou email" requis erreur={errors.identifiant?.message}>
          <input {...register('identifiant')} />
        </Champ>
        <Champ label="Code de vérification" requis erreur={errors.code?.message}>
          <input inputMode="numeric" maxLength={6} {...register('code')} placeholder="000000" />
        </Champ>
        <button className="btn btn--bloc" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Vérification…' : 'Valider'}
        </button>
      </form>
      </div>
    </>
  );
}
