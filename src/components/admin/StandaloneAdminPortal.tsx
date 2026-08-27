import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import { AdminDashboard } from './AdminDashboard';
import { OziLogo } from '../common/OziLogo';
import {
  Shield,
  ExternalLink,
  Smartphone,
  Monitor,
  Lock,
  LogIn,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Database,
  Cloud,
} from 'lucide-react';

export const StandaloneAdminPortal: React.FC = () => {
  const { currentUser, isAdmin, login, loginWithGoogle, logout, showToast } = useOzi();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      showToast('Veuillez saisir votre email administrateur et mot de passe.', 'error');
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await login(emailInput, passwordInput);
      if (!res.success) {
        showToast(res.message, 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickCreatorLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login('wilfriedcrea@gmail.com', 'admin1234');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#ff5a50] selection:text-white">
      {/* 1. TOP BAR DU PORTAIL WEB D'ADMINISTRATION DESKTOP */}
      <header className="sticky top-0 z-40 bg-[#0d0e15]/95 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <OziLogo size="md" />
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black tracking-wide uppercase flex items-center gap-1.5 shadow-inner">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Back-Office Master Hub
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Firestore Live Sync (Mobile & Web)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lien pour tester / basculer vers l'expérience mobile */}
            <a
              href="/"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
              title="Ouvrir l'application mobile OZI"
            >
              <Smartphone className="w-4 h-4 text-[#ff5a50]" />
              <span className="hidden md:inline">Voir l'App Mobile</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {currentUser && isAdmin && (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-white">{currentUser.username}</span>
                  <span className="text-[10px] text-purple-400 font-mono">{currentUser.email}</span>
                </div>
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover border border-purple-500/50"
                />
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. CONTENU DU PORTAIL */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser || !isAdmin ? (
          /* ========================================================================= */
          /* ÉCRAN DE CONNEXION SÉCURISÉ DÉDIÉ AU DASHBOARD ADMINISTRATEUR */
          /* ========================================================================= */
          <div className="max-w-xl mx-auto my-12 p-8 bg-[#0e101a] border border-white/10 rounded-3xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white">Connexion Portail Administrateur</h1>
              <p className="text-xs text-slate-400">
                Connectez-vous avec le compte créateur <strong className="text-purple-300 font-mono">wilfriedcrea@gmail.com</strong> pour gérer les œuvres, chapitres, planches et utilisateurs en temps réel sur iOS (App Store) et Android (Play Store).
              </p>
            </div>

            {/* Architecture Expliquée */}
            <div className="p-4 bg-[#141624] border border-purple-500/20 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Base de données unifiée (Cloud Firestore)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toutes les modifications faites depuis ce tableau de bord sur votre ordinateur se synchronisent instantanément et automatiquement sur les applications mobiles de tous vos lecteurs (Play Store & App Store).
              </p>
            </div>

            {/* Formulaire de Connexion */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email administrateur</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="wilfriedcrea@gmail.com"
                  className="w-full bg-[#141624] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141624] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer tap-active disabled:opacity-50"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Se connecter au Back-Office</span>
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-mono">ou accès rapide</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Bouton d'accès immédiat Créateur */}
            <button
              onClick={handleQuickCreatorLogin}
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-500/40 text-purple-200 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Connexion en 1-clic : Wilfried (Créateur)</span>
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* DASHBOARD COMPLET EN PLEINE LARGEUR DESKTOP SUR SA PAGE WEB DÉDIÉE */
          /* ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Bannière d'état de synchronisation temps réel */}
            <div className="p-4 bg-gradient-to-r from-purple-950/60 via-[#141624] to-slate-900/80 border border-purple-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Back-Office OZI lié au Cloud Firestore</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      SYNC ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chaque publication (œuvre, chapitre, article, notification push) est immédiatement répercutée sur les applications iOS (App Store) et Android (Google Play Store).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tester le rendu mobile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Dashboard Administrateur plein écran */}
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* 3. FOOTER DESKTOP */}
      <footer className="border-t border-white/5 py-4 px-6 bg-[#090a10] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OZI Webtoons & Mangas • Back-Office Professionnel</span>
          <span className="font-mono text-[11px] text-slate-400">
            Base de données Firestore : <code className="text-purple-400">ai-studio-oziplateformeweb-6556be3f</code>
          </span>
        </div>
      </footer>
    </div>
  );
};
