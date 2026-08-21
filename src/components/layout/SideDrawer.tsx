import React from 'react';
import { useOzi } from '../../context/OziContext';
import {
  X,
  BookOpen,
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
  Zap,
} from 'lucide-react';
import { OziLogo } from '../common/OziLogo';

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
  const { currentUser, isAdmin, logout, setActiveView, openCoinShop } = useOzi();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop sombre */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-[85%] max-w-xs bg-[#0e101a] text-slate-100 h-full border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250 font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto">
        {/* Header Drawer */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <OziLogo size="md" />
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer tap-active"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Preview / Login Prompt */}
          {currentUser ? (
            <div className="space-y-2.5 mb-5">
              <div
                onClick={() => {
                  onSelectTab('profile');
                  onClose();
                }}
                className="p-3 bg-[#151827] border border-white/10 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#ff5a50]/50 transition-all tap-active"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-11 h-11 avatar-round object-cover border-2 border-[#ff5a50]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white truncate">{currentUser.username}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3 fill-amber-400" />
                    <span>Niveau 42 • Lecteur VIP</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>

              {/* Solde & Recharger rapide */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solde Pièces</div>
                    <div className="text-sm font-black text-amber-400">{currentUser.coinsBalance || 0} Coins</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    openCoinShop();
                  }}
                  className="px-3 py-1.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white text-xs font-black rounded-xl shadow cursor-pointer tap-active"
                >
                  + Recharger
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-br from-[#1b1e30] to-[#121422] border border-white/10 rounded-2xl mb-5 shadow-lg">
              <div className="text-xs font-black text-white mb-1">Rejoignez la communauté OZI</div>
              <div className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Débloquez les épisodes Fast-Pass, jouez aux mini-jeux et sauvegardez vos lectures.
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white font-black text-xs rounded-xl shadow cursor-pointer tap-active transition-transform"
              >
                Se connecter / S'inscrire
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1 text-xs">
            <button
              onClick={() => {
                onSelectTab('home');
                setActiveView('app_catalogue');
                onClose();
              }}
              className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <BookOpen className="w-4 h-4 text-[#ff5a50]" />
              <span className="font-bold">Accueil Webtoons</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('library');
                onClose();
              }}
              className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Ma Bibliothèque</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('games');
                onClose();
              }}
              className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span className="font-bold">Game Center OZI</span>
            </button>

            <button
              onClick={() => {
                onClose();
                openCoinShop();
              }}
              className="w-full p-3 rounded-xl flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer text-left tap-active"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Boutique de Pièces (Wave)</span>
              <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black">
                Fast-Pass
              </span>
            </button>

            <button
              onClick={() => {
                onOpenShop();
                onClose();
              }}
              className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Goodies & Merch</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('blog');
                onClose();
              }}
              className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 text-slate-200 hover:text-white transition-colors cursor-pointer text-left tap-active"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Blog & Actualités</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin_dashboard');
                  onClose();
                }}
                className="w-full p-3 rounded-xl flex items-center gap-3 bg-purple-950/30 border border-purple-500/30 text-purple-300 hover:text-white transition-colors cursor-pointer text-left tap-active"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="font-bold">Dashboard Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Drawer */}
        <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
          {currentUser && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer tap-active"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          )}

          <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
            <span>OZI Android Native v2.5</span>
            <span className="text-[#ff5a50] font-bold">XOF • Wave Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};
