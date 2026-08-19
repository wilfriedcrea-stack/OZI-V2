import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import { ArrowLeft, Shield, FileText, Lock, Scale } from 'lucide-react';

export const LegalPagesView: React.FC = () => {
  const { setActiveView } = useOzi();
  const [activeTab, setActiveTab] = useState<'mentions' | 'privacy' | 'cgu'>('mentions');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <button
        onClick={() => setActiveView('landing')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à l'accueil</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4" />
          <span>Cadre Juridique & Conformité</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
          Informations Légales & Confidentialité
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Transparence, respect de la vie privée et conditions d'accès aux services de lecture OZI.
        </p>
      </div>

      {/* TABS */}
      <div className="border-b border-slate-800 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('mentions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'mentions'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mentions Légales</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Politique de Confidentialité (RGPD)</span>
        </button>

        <button
          onClick={() => setActiveTab('cgu')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'cgu'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Conditions Générales d'Utilisation (CGU)</span>
        </button>
      </div>

      {/* CONTENT: MENTIONS LÉGALES */}
      {activeTab === 'mentions' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              1. Éditeur de la Plateforme
            </h2>
            <p>
              Le site web et l'application <strong>OZI</strong> sont édités par la société <strong>OZI SAS</strong>, 
              société par actions simplifiée au capital de 50 000 €, immatriculée au Registre du Commerce et des Sociétés sous le numéro RCS Paris B 987 654 321.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Siège social : 124 Avenue des Gobelins, 75013 Paris, France</li>
              <li>Directeur de la publication : Équipe de Direction OZI</li>
              <li>Email de contact : contact@ozi-webtoons.com</li>
              <li>Téléphone : +33 (0)1 42 00 00 00</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              2. Hébergement de l'Infrastructure
            </h2>
            <p>
              La plateforme OZI est hébergée sur des serveurs sécurisés conformes aux normes européennes :
            </p>
            <p className="text-slate-400">
              Google Cloud Platform France (Région europe-west9 / Paris), 8 Rue de Londres, 75009 Paris.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              3. Propriété Intellectuelle
            </h2>
            <p>
              L'ensemble des œuvres (webtoons, mangas, bandes dessinées, illustrations, logos, charte graphique et articles) 
              présentés sur OZI sont protégés par le droit d'auteur et les traités internationaux relatifs à la propriété intellectuelle.
              Toute reproduction, diffusion ou exploitation non autorisée fait l'objet de poursuites judiciaires.
            </p>
          </section>
        </div>
      )}

      {/* CONTENT: POLITIQUE DE CONFIDENTIALITÉ */}
      {activeTab === 'privacy' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              1. Données collectées
            </h2>
            <p>
              Dans le cadre de l'utilisation de l'application et du site web OZI, nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Données d'identification : adresse e-mail, pseudonyme, photo de profil.</li>
              <li>Données d'utilisation : historique de lecture, chapitres marqués comme favoris, commentaires publiés.</li>
              <li>Abonnement Newsletter : adresse e-mail avec consentement explicite (opt-in).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              2. Finalités des traitements
            </h2>
            <p>
              Vos données sont traitées pour vous permettre d'accéder au catalogue d’œuvres, de synchroniser votre historique de lecture entre vos appareils, de voter et commenter les épisodes, et de recevoir les actualités si vous y avez consenti.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              3. Vos droits RGPD & Suppression de compte
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et d'effacement de vos données personnelles.
            </p>
            <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-300">
              ⚡ <strong>Droit à l'oubli :</strong> Vous pouvez à tout moment supprimer l'ensemble de votre compte et de vos données directement depuis l'onglet "Profil & Paramètres" de l'application OZI.
            </p>
          </section>
        </div>
      )}

      {/* CONTENT: CGU */}
      {activeTab === 'cgu' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              1. Objet du Service
            </h2>
            <p>
              OZI met à disposition des internautes une plateforme numérique dédiée à la lecture gratuite d’œuvres graphiques (mangas, webtoons et bandes dessinées) ainsi qu'à la participation communautaire via des espaces de commentaires et mini-jeux tiers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              2. Règles de Conduite et Modération
            </h2>
            <p>
              Les utilisateurs s'engagent à tenir des propos respectueux dans la section des commentaires. Tout contenu injurieux, diffamatoire, haineux, illégal ou comportant des spoilers non masqués pourra être masqué ou supprimé par notre équipe de modération, et le compte de son auteur suspendu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              3. Mini-Jeux Tiers Embarqués
            </h2>
            <p>
              Les jeux proposés dans la section Arcade sont intégrés pour le divertissement des lecteurs. OZI ne saurait être tenu responsable des pannes ou dysfonctionnements éventuels de ces modules tiers.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
