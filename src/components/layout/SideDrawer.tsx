import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  X,
  Home,
  BookOpen,
  Library,
  Gamepad2,
  Bookmark,
  User,
  Sparkles,
  Flame,
  Shield,
  ShoppingBag,
  Coins,
  ChevronRight,
  LogOut,
  LogIn,
  Zap,
  Settings,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  FileText,
  CreditCard,
  History,
  Check,
  Bell,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import { OziLogo } from '../common/OziLogo';
import { notificationService } from '../../lib/notificationService';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'home' | 'library' | 'games' | 'blog' | 'profile') => void;
  onOpenAuth: () => void;
  onOpenShop: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenAuth,
  onOpenShop,
}) => {
  const {
    currentUser,
    isAdmin,
    logout,
    setActiveView,
    openCoinShop,
    bookmarkedWorks,
    showToast,
  } = useOzi();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Backdrop sombre tactile */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel adapté 100% Mobile avec Safe Areas */}
      <div className="relative w-[88%] max-w-sm bg-[#0e101a] text-slate-100 h-full border-r border-white/10 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
        
        {/* En-tête du Drawer */}
        <div className="px-5 pb-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div
            onClick={() => {
              onSelectTab('home');
              setActiveView('app_catalogue');
              onClose();
            }}
            className="cursor-pointer tap-active"
          >
            <OziLogo size="md" />
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer tap-active border border-white/5"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone de contenu défilante fluide */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar overscroll-contain">
          
          {/* SECTION 1 : Profil Utilisateur / Connexion */}
          {currentUser ? (
            <div className="space-y-3">
              {/* Carte Profil cliquable */}
              <div
                onClick={() => {
                  onSelectTab('profile');
                  setActiveView('app_catalogue');
                  onClose();
                }}
                className="p-3.5 bg-gradient-to-r from-[#151827] to-[#1a1e32] border border-white/10 hover:border-[#ff5a50]/50 rounded-2xl flex items-center gap-3 cursor-pointer transition-all tap-active group shadow-md"
              >
                <img
                  src={
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={currentUser.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#ff5a50] shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                    <span>{currentUser.username}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded-full border border-purple-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-[#ff7a70] font-bold flex items-center gap-1 mt-0.5 group-hover:underline">
                    <User className="w-3 h-3" />
                    <span>Mon profil & mes réglages</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
              </div>

              {/* CARTE : Portefeuille OZI Coins */}
              <div className="p-3.5 bg-gradient-to-br from-amber-500/15 via-[#1b1710] to-[#121422] border border-amber-500/30 rounded-2xl shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
                        Mon Portefeuille
                      </div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        {currentUser.coinsBalance || 0} <span className="text-xs font-sans">Coins</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      openCoinShop();
                    }}
                    className="px-3.5 py-1.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white text-xs font-black rounded-full shadow-md cursor-pointer tap-active active:scale-95 transition-all"
                  >
                    + Recharger
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-amber-500/20">
                  <span>Paiements mobiles</span>
                  <span className="text-amber-300 font-bold">Wave • OM • CB</span>
                </div>
              </div>
            </div>
          ) : (
            /* Bannière Invité / Connexion */
            <div className="p-4 bg-gradient-to-br from-[#1b1e30] to-[#121422] border border-white/10 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff5a50]/20 border border-[#ff5a50]/40 flex items-center justify-center text-[#ff5a50] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Espace Membre OZI</div>
                  <div className="text-[10px] text-slate-400">Connectez-vous pour débloquer toutes les fonctionnalités</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white font-black text-xs rounded-full shadow-lg cursor-pointer tap-active flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter / S'inscrire</span>
              </button>
            </div>
          )}

          {/* SECTION 2 : Navigation & Raccourcis */}
          <div className="space-y-1 pt-1 text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Menu & Espaces
            </div>

            {/* Mon Profil */}
            <button
              onClick={() => {
                onSelectTab('profile');
                setActiveView('app_catalogue');
                onClose();
              }}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#ff5a50] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Mon Profil & Paramètres</div>
                  <div className="text-[10px] text-slate-400">Avatar, compte, historique</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {/* Ma Bibliothèque */}
            <button
              onClick={() => {
                onSelectTab('profile');
                setActiveView('app_catalogue');
                onClose();
              }}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Library className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Ma Bibliothèque</div>
                  <div className="text-[10px] text-slate-400">
                    {bookmarkedWorks.length > 0 ? `${bookmarkedWorks.length} favoris enregistrés` : 'Favoris & Reprises'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {bookmarkedWorks.length}
              </span>
            </button>

            {/* Portefeuille Coins */}
            <button
              onClick={() => {
                onClose();
                openCoinShop();
              }}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Boutique Fast-Pass (Coins)</div>
                  <div className="text-[10px] text-amber-300/80">Recharger par Wave, OM, CB</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {/* Boutique Goodies */}
            <button
              onClick={() => {
                onOpenShop();
                onClose();
              }}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Boutique & Goodies</div>
                  <div className="text-[10px] text-slate-400">Posters, t-shirts, figurines</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {/* Game Center */}
            <button
              onClick={() => {
                onSelectTab('games');
                setActiveView('app_catalogue');
                onClose();
              }}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Game Center OZI</div>
                  <div className="text-[10px] text-slate-400">Mini-jeux & récompenses</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {/* Dashboard Admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin_dashboard');
                  onClose();
                }}
                className="w-full p-3 rounded-2xl flex items-center justify-between bg-purple-950/30 border border-purple-500/30 text-purple-300 hover:text-white transition-colors cursor-pointer text-left tap-active mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Dashboard Admin Créateur</div>
                    <div className="text-[10px] text-purple-300/80">Gestion des œuvres et membres</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
              </button>
            )}
          </div>

          {/* SECTION 3 : Préférences & Paramètres Mobile */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Paramètres & Préférences
            </div>

            {/* Mode Sombre */}
            <div className="w-full p-3 rounded-2xl flex items-center justify-between bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 shrink-0">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Thème sombre</div>
                  <div className="text-[10px] text-slate-400">Confort de lecture nocturne</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer tap-active ${
                  isDarkMode ? 'bg-[#ff5a50]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Notifications Push */}
            <div className="w-full p-3 rounded-2xl flex items-center justify-between bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#ff5a50] shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Alertes hors application</div>
                  <div className="text-[10px] text-slate-400">Volet & écran de verrouillage</div>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!pushEnabled) {
                    const granted = await notificationService.requestPermissions();
                    setPushEnabled(true);
                    if (granted) {
                      showToast('Alertes hors application activées ! 🔔', 'success');
                    } else {
                      showToast('Notifications activées dans l\'application.', 'info');
                    }
                  } else {
                    setPushEnabled(false);
                    showToast('Notifications en sourdine.', 'info');
                  }
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer tap-active ${
                  pushEnabled ? 'bg-[#ff5a50]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    pushEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Langue de lecture */}
            <div className="w-full p-3 rounded-2xl flex items-center justify-between bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Langue</div>
                  <div className="text-[10px] text-slate-400">Interface & Contenus</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                Français (FR)
              </span>
            </div>

            {/* Pages Légales & Aide */}
            <button
              onClick={() => {
                setActiveView('legal');
                onClose();
              }}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Mentions Légales & CGU</div>
                  <div className="text-[10px] text-slate-400">Confidentialité et conditions</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
          </div>
        </div>

        {/* Footer Drawer : Déconnexion & Version */}
        <div className="px-5 pt-3 border-t border-white/10 space-y-2 shrink-0">
          {currentUser ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full p-3 rounded-full flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 transition-colors cursor-pointer tap-active"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter de mon compte</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full p-3 rounded-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#ff5a50] hover:bg-[#ff463b] transition-colors cursor-pointer tap-active shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter / S'inscrire</span>
            </button>
          )}

          <div className="text-[10px] text-slate-500 flex items-center justify-between px-1 pt-1">
            <span>OZI Webtoons & Manga v2.5</span>
            <span className="text-[#ff5a50] font-bold">Mobile Edition</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SideDrawer;

