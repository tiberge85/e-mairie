import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { connexionCitoyenSchema } from '@e-mairie/shared';
import { Champ } from '../components/Champ';
import { api, ErreurApi } from '../lib/api';
import { appliquerErreursServeur } from '../lib/erreurs';
import { useAuth } from '../auth/AuthContext';

export function Connexion() {
  const naviguer = useNavigate();
  const { connexion } = useAuth();
  const [erreurGlobale, setErreurGlobale] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(connexionCitoyenSchema) as never,
    defaultValues: { identifiant: '', motDePasse: '' },
  });

  const soumettre = handleSubmit(async (valeurs) => {
    setErreurGlobale('');
    try {
      const { jeton, citoyen } = await api.connexion(valeurs);
      connexion(jeton, citoyen);
      naviguer('/');
    } catch (e) {
      // 403 = compte non vérifié : l'API a renvoyé un nouvel OTP.
      if (e instanceof ErreurApi && e.statut === 403) {
        naviguer('/otp', { state: { identifiant: getValues('identifiant') } });
        return;
      }
      setErreurGlobale(appliquerErreursServeur(e, setError));
    }
  });

  return (
    <div className="carte">
      <h1>Connexion</h1>
      <p className="sous-titre">Accédez à vos demandes et à leur suivi.</p>
      {erreurGlobale && <div className="alerte alerte--erreur">{erreurGlobale}</div>}

      <form onSubmit={soumettre} noValidate>
        <Champ label="Téléphone ou email" requis erreur={errors.identifiant?.message}>
          <input {...register('identifiant')} autoComplete="username" />
        </Champ>
        <Champ label="Mot de passe" requis erreur={errors.motDePasse?.message}>
          <input type="password" {...register('motDePasse')} autoComplete="current-password" />
        </Champ>
        <button className="btn btn--bloc" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="muet" style={{ marginTop: 16 }}>
        Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
      </p>
    </div>
  );
}
