import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  Smartphone,
  BookOpen,
  Gamepad2,
  MessageSquare,
  Sparkles,
  Download,
  ArrowRight,
  CheckCircle2,
  Layers,
  Zap,
  Shield,
  Star,
  QrCode,
  Flame,
  Globe,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OziLogo } from '../common/OziLogo';

export const LandingPage: React.FC = () => {
  const {
    works,
    setActiveView,
    openWorkDetail,
    subscribeNewsletter,
    setLegalSubView,
  } = useOzi();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<'ios' | 'android'>('ios');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = subscribeNewsletter(newsletterEmail, 'Landing Page Hero');
    setNewsletterStatus(res);
    if (res.success) {
      setNewsletterEmail('');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleDownloadClick = (store: 'ios' | 'android') => {
    setSelectedStore(store);
    setShowDownloadModal(true);
  };

  const featuredWorks = works.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Découvrez la Phase 1 d’OZI : Lecteur universel, communauté active et jeux arcade intégrés !</span>
        <button
          onClick={() => setActiveView('app_catalogue')}
          className="ml-2 font-bold underline hover:text-white cursor-pointer"
        >
          Lancer l'application web →
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-6 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              L'expérience de lecture nouvelle génération
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 font-['Outfit',sans-serif]">
              Lisez vos <span className="text-amber-400 underline decoration-amber-500/40 decoration-4">Webtoons</span>, Mangas & BD en toute liberté.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              OZI réunit le meilleur de la bande dessinée numérique : un défilement vertical ultra-fluide, des discussions animées par chapitre et des mini-jeux exclusifs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
              <button
                onClick={() => setActiveView('app_catalogue')}
                className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorer le Catalogue Web</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => handleDownloadClick('ios')}
                  className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 3.5c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.07 1.71-.93 2.74 1.01.08 2.03-.5 2.63-1.24z" />
                  </svg>
                  <span>App Store</span>
                </button>

                <button
                  onClick={() => handleDownloadClick('android')}
                  className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.23 2.23 0 0 1-.61-1.611V3.425c0-.622.22-1.196.609-1.611zm11.24 11.24l2.127 2.128-11.8 6.742 9.673-8.87zm0-2.108L5.176 2.076l11.8 6.742-2.127 2.128zm1.092 1.092l3.415 1.952c.797.455.797 1.196 0 1.651l-3.415 1.952-2.127-2.128 2.127-2.127z" />
                  </svg>
                  <span>Google Play</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-xl mx-auto text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</div>
                <div className="text-xs text-slate-400">Gratuit en Phase 1</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">3 Types</div>
                <div className="text-xs text-slate-400">Webtoons, Mangas & BD</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">Jeux</div>
                <div className="text-xs text-slate-400">Arcade & Défis intégrés</div>
              </div>
            </div>
          </div>

          {/* APP PREVIEW SHOWCASE MOCKUP */}
          <div className="relative max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-2 sm:p-4 shadow-2xl border border-slate-700/80">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/60 mb-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <span className="text-[11px] text-slate-400 ml-2">ozi-reader-engine-v1.0.app</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                FLUTTER & WEB COMPATIBLE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Preview 1: Featured cover */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer" onClick={() => openWorkDetail('work-1')}>
                <img
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"
                  alt="Shadow Monarch"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-black rounded self-start mb-1">
                    WEBTOON #1
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight">Shadow Monarch Rebirth</h4>
                  <p className="text-[11px] text-slate-300">Action • 142k lectures</p>
                </div>
              </div>

              {/* Preview 2: Mobile Reader Simulator */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-200">Lecteur Vertical Fluide</span>
                    <span className="text-[10px] text-emerald-400 font-mono">60 FPS</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 bg-slate-900 rounded-lg p-2 border border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-900/60 rounded-md flex items-center justify-center text-purple-300 font-bold text-xs">
                        Ch. 1
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-white truncate max-w-[150px]">Le Portale Noir</div>
                        <div className="text-[10px] text-slate-400">1 420 likes • 4 planches</div>
                      </div>
                    </div>
                    <div className="h-16 bg-slate-900 rounded-lg p-2 border border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-900/60 rounded-md flex items-center justify-center text-purple-300 font-bold text-xs">
                        Ch. 2
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-white truncate max-w-[150px]">Soldats d’Ombre</div>
                        <div className="text-[10px] text-slate-400">1 280 likes • 3 planches</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('app_catalogue')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 rounded-lg transition-colors mt-3 text-center"
                >
                  Tester le lecteur en direct →
                </button>
              </div>

              {/* Preview 3: Games Arcade Card */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-500/30 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-2">
                    <Gamepad2 className="w-4 h-4" />
                    <span>ESPACE JEUX INTÉGRÉ</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-1">Shadow Dash Arcade</h4>
                  <p className="text-xs text-slate-300 leading-snug">
                    Jouez sans quitter l'application à des mini-jeux développés par nos studios partenaires.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('app_games')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer text-center"
                >
                  Jouer maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE BENEFITS & FEATURES SECTION */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-almodobar tracking-wide">
              Pourquoi choisir la plateforme OZI ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Conçue spécialement pour les passionnés de lecture graphique et séquentielle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Catalogue Multiformat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Naviguez librement entre Webtoons au défilement continu, Mangas en lecture droite-gauche et albums de Bandes Dessinées européennes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Commentaires & Échanges Imbriqués</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Réagissez case par case, votez pour vos chapitres favoris et échangez avec les auteurs et la communauté avec masquage anti-spoiler.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Section Jeux HTML5</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Une arcade embarquée dans l'application avec des runner games, puzzles et quiz pour prolonger l'univers de vos séries préférées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR WORKS SHOWCASE */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4" />
                <span>Tendances du moment</span>
              </div>
            <h2 className="text-2xl font-extrabold text-white font-almodobar tracking-wide">
                Les séries les plus lues sur OZI
              </h2>
            </div>
            <button
              onClick={() => setActiveView('app_catalogue')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Voir tout le catalogue ({works.length} séries) →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredWorks.map((work) => (
              <div
                key={work.id}
                onClick={() => openWorkDetail(work.id)}
                className="group bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
                  <img
                    src={work.coverUrl}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-bold text-amber-400 uppercase">
                    {work.type}
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{work.rating}</span>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate font-almodobar tracking-wide">
                    {work.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">{work.genres.slice(0, 2).join(' • ')}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{work.totalChapters} chapitres</span>
                    <span className="text-amber-400 font-semibold">Lire →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER REGISTRATION SECTION */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-[#0c0f18] border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">
                Restez informés
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-almodobar tracking-wide">
                Inscrivez-vous à la Newsletter OZI
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                Recevez chaque semaine les sorties des nouveaux chapitres, les interviews d'auteurs et les accès exclusifs aux nouveaux mini-jeux.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre adresse email (ex: alex@exemple.com)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  S'abonner gratuitement
                </button>
              </form>

              {newsletterStatus && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    newsletterStatus.success
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/60 border border-red-500/40 text-red-300'
                  }`}
                >
                  {newsletterStatus.success && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  <span>{newsletterStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER WITH LEGAL LINKS & APP DOWNLOADS */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-3">
                <OziLogo size="md" showText={true} />
              </div>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-4">
                Plateforme web et mobile de lecture de webtoons, mangas et bandes dessinées. Phase 1 du projet OZI.
              </p>
              <p className="text-[11px] text-slate-500">
                © {new Date().getFullYear()} OZI Publishing. Tous droits réservés.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActiveView('app_catalogue')} className="hover:text-amber-400 transition-colors">
                    Catalogue des œuvres
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('app_games')} className="hover:text-amber-400 transition-colors">
                    Espace Jeux Arcade
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('app_articles')} className="hover:text-amber-400 transition-colors">
                    Carnets de création & Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveView('admin')} className="hover:text-purple-400 transition-colors">
                    Accès Back-Office Admin
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Informations Légales</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setLegalSubView('mentions');
                      setActiveView('legal');
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Mentions Légales
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLegalSubView('confidentialite');
                      setActiveView('legal');
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Politique de Confidentialité
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLegalSubView('cgu');
                      setActiveView('legal');
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Conditions Générales (CGU)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* DOWNLOAD MODAL SIMULATOR */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Télécharger OZI ({selectedStore === 'ios' ? 'iOS' : 'Android'})
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              Scannez le QR Code pour installer la version mobile Flutter ou lancez la version web instantanée.
            </p>

            {/* Simulated QR Code */}
            <div className="p-4 bg-white rounded-xl inline-block mb-5 shadow-md">
              <div className="w-36 h-36 border-2 border-slate-900 flex flex-col items-center justify-center text-slate-900 font-mono text-[10px] text-center p-2">
                <QrCode className="w-20 h-20 text-slate-900 mb-1" />
                <span>OZI MOBILE APP</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setActiveView('app_catalogue');
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Tester la Web App sans installer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
