import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  Mail,
  Lock,
  User,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { OziLogo } from '../common/OziLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, loginWithGoogle, loginAsGoogleDirect, resetPassword, addToast } = useOzi();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleEmailInput, setShowGoogleEmailInput] = useState(false);
  const [googleEmailValue, setGoogleEmailValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else {
        if (!username.trim()) {
          setErrorMessage('Veuillez renseigner un pseudo.');
          setLoading(false);
          return;
        }
        const res = await signup(email, password, username.trim());
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onClose();
      } else {
        if (res.needsDirectGoogle) {
          setShowGoogleEmailInput(true);
          setGoogleEmailValue(email || 'wilfriedcrea@gmail.com');
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setShowGoogleEmailInput(true);
      setGoogleEmailValue(email || 'wilfriedcrea@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailValue.trim()) {
      setErrorMessage('Veuillez renseigner votre email Google.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginAsGoogleDirect(googleEmailValue.trim());
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    try {
      const res = await login('wilfriedcrea@gmail.com', 'admin123456');
      if (res.success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      addToast('Indiquez votre email dans le champ ci-dessous.', 'info');
      return;
    }
    await resetPassword(email);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      {/* CARD CENTRÉE */}
      <div className="w-full max-w-sm bg-[#13141f] border border-white/10 rounded-3xl p-6 relative shadow-2xl">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO OZI EN HAUT */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="mb-4">
            <OziLogo size="lg" />
          </div>

          <h2 className="text-2xl font-black text-white font-almodobar tracking-wide">
            Bienvenue sur OZI
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
            Plongez dans un univers infini de webtoons et créations africaines.
          </p>
        </div>

        {/* SWITCHER SE CONNECTER / S'INSCRIRE */}
        <div className="grid grid-cols-2 p-1 bg-[#1c1e2e] rounded-full mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              setShowGoogleEmailInput(false);
            }}
            className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#ff5a50] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
              setShowGoogleEmailInput(false);
            }}
            className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-[#ff5a50] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            S'inscrire
          </button>
        </div>

        {/* Message d'erreur visible */}
        {errorMessage && (
          <div className="mb-3 p-2.5 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold animate-in fade-in duration-150">
            {errorMessage}
          </div>
        )}

        {/* SI CONNEXION GOOGLE DIRECTE */}
        {showGoogleEmailInput ? (
          <form onSubmit={handleDirectGoogleSubmit} className="space-y-3">
            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200">
              <span className="font-bold">Connexion avec Google</span> : Confirmez votre adresse email Google pour accéder à votre compte.
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">Email Google</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  placeholder="votre.compte@gmail.com"
                  value={googleEmailValue}
                  onChange={(e) => setGoogleEmailValue(e.target.value)}
                  className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#ff5a50]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Valider la connexion Google</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGoogleEmailInput(false)}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer pt-1"
            >
              Retour au formulaire classique
            </button>
          </form>
        ) : (
          /* FORMULAIRE CLASSIQUE */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'signup' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-bold">Pseudo</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    placeholder="Votre pseudo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#ff5a50]"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#ff5a50]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400 font-bold">Mot de passe</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  placeholder="•••••••• (6 caractères min)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#ff5a50]"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Bouton principal Corail */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff5a50] hover:bg-[#ff453b] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-[#ff5a50]/30 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
            </button>
          </form>
        )}

        {/* SÉPARATEUR OU CONTINUER AVEC */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative px-3 bg-[#13141f] text-[9px] font-black uppercase text-slate-500 tracking-wider">
            OU
          </span>
        </div>

        {/* BOUTON GOOGLE CONNEXION */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-3 bg-[#1c1e2e] hover:bg-[#25283d] border border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        {/* ACCÈS RAPIDE COMPTE CRÉATEUR WILFRIED */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            disabled={loading}
            className="w-full py-2 px-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl flex items-center justify-between text-[11px] font-bold text-purple-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Connexion Créateur (wilfriedcrea)</span>
            </div>
            <span className="text-[10px] text-purple-400 font-mono shrink-0">1-Clic →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
