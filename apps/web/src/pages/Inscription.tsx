import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { inscriptionCitoyenSchema } from '@e-mairie/shared';
import { Champ } from '../components/Champ';
import { MarqueHero } from '../components/MarqueHero';
import { api } from '../lib/api';
import { appliquerErreursServeur } from '../lib/erreurs';

export function Inscription() {
  const naviguer = useNavigate();
  const [erreurGlobale, setErreurGlobale] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inscriptionCitoyenSchema) as never,
    defaultValues: {
      nom: '', prenoms: '', dateNaissance: '', telephone: '', email: '',
      motDePasse: '', confirmationMotDePasse: '',
    },
  });

  const soumettre = handleSubmit(async (valeurs) => {
    setErreurGlobale('');
    try {
      await api.inscription(valeurs);
      naviguer('/otp', { state: { identifiant: valeurs.telephone } });
    } catch (e) {
      setErreurGlobale(appliquerErreursServeur(e, setError));
    }
  });

  return (
    <>
      <MarqueHero titre="Créer un compte" soustitre="Préparez vos démarches en quelques minutes." />
      <div className="carte">
      {erreurGlobale && <div className="alerte alerte--erreur">{erreurGlobale}</div>}

      <form onSubmit={soumettre} noValidate>
        <div className="grille-2">
          <Champ label="Nom" requis erreur={errors.nom?.message}>
            <input {...register('nom')} autoComplete="family-name" />
          </Champ>
          <Champ label="Prénom(s)" requis erreur={errors.prenoms?.message}>
            <input {...register('prenoms')} autoComplete="given-name" />
          </Champ>
        </div>
        <Champ label="Date de naissance" requis erreur={errors.dateNaissance?.message}>
          <input type="date" {...register('dateNaissance')} />
        </Champ>
        <Champ label="Téléphone" requis erreur={errors.telephone?.message}>
          <input type="tel" {...register('telephone')} autoComplete="tel" placeholder="+225 07 00 00 00" />
        </Champ>
        <Champ label="Email (facultatif)" erreur={errors.email?.message}>
          <input type="email" {...register('email')} autoComplete="email" />
        </Champ>
        <div className="grille-2">
          <Champ label="Mot de passe" requis erreur={errors.motDePasse?.message}>
            <input type="password" {...register('motDePasse')} autoComplete="new-password" />
          </Champ>
          <Champ label="Confirmation" requis erreur={errors.confirmationMotDePasse?.message}>
            <input type="password" {...register('confirmationMotDePasse')} autoComplete="new-password" />
          </Champ>
        </div>

        <button className="btn btn--bloc" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="muet" style={{ marginTop: 16 }}>
        Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
      </p>
      </div>
    </>
  );
}
