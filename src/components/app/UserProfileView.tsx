import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  User,
  CreditCard,
  Moon,
  Bell,
  Globe,
  BookOpen,
  Flame,
  LogOut,
  Trash2,
  ChevronRight,
  Pencil,
  Star,
  Award,
  Check,
  Shield,
  Coins,
  Zap,
  Lock,
  History,
  Gamepad2,
  Newspaper,
  FileText,
  Scale,
  Sparkles,
  HelpCircle,
  Share2,
} from 'lucide-react';

interface UserProfileViewProps {
  initialTab?: 'profile' | 'library';
  onOpenAuth?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ initialTab = 'profile', onOpenAuth }) => {
  const {
    currentUser,
    isAdmin,
    setActiveView,
    logout,
    deleteUserAccount,
    updateProfile,
    bookmarkedWorks,
    openWorkDetail,
    openCoinShop,
  } = useOzi();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.username || 'Lecteur OZI');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Si on est dans l'onglet bibliothèque
  if (initialTab === 'library') {
    return (
      <div className="space-y-4">
        {bookmarkedWorks.length === 0 ? (
          <div className="p-8 text-center bg-[#141624] border border-white/10 rounded-2xl">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-bold">Votre bibliothèque est vide</p>
            <p className="text-[11px] text-slate-500 mt-1">Ajoutez des séries à vos favoris en cliquant sur l'icône signet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {bookmarkedWorks.map((work) => (
              <div
                key={work.id}
                onClick={() => openWorkDetail(work.id)}
                className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-95 transition-transform"
              >
                <div className="aspect-[3/4] bg-slate-900">
                  <img src={work.coverUrl} alt={work.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate">{work.title}</h4>
                  <p className="text-[10px] text-slate-400">{work.totalChapters} chapitres</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      
      {/* 1. EN-TÊTE DU PROFIL (Grand avatar avec bouton crayon, nom, email, badges) */}
      <div className="flex flex-col items-center text-center pt-2">
        {/* Avatar avec cercle dégradé corail et bouton crayon */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#ff5a50] to-[#ff8a80] shadow-xl">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
              }
              alt="Profil"
              className="w-full h-full rounded-full object-cover bg-slate-900"
            />
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[#ff5a50] hover:bg-[#ff453b] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#0d0e15] cursor-pointer"
            aria-label="Modifier l'avatar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nom & Email */}
        <h1 className="text-xl font-black text-white font-['Outfit']">
          {currentUser?.username || 'Alexandre Dupont'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {currentUser?.email || 'alexandre.d@example.com'}
        </p>

        {/* Badges pills */}
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-[#ff5a50]/15 border border-[#ff5a50]/50 text-[#ff7a70] text-[11px] font-bold rounded-full flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Lecteur Actif
          </span>
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold rounded-full flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" /> {currentUser?.coinsBalance || 0} Coins
          </span>
        </div>
      </div>

      {/* PORTEFEUILLE OZI COINS & MONÉTISATION */}
      <div className="p-4 bg-gradient-to-br from-[#1a1728] via-[#141624] to-[#121422] border border-amber-500/30 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-['Outfit']">Portefeuille OZI Coins</div>
              <div className="text-[10px] text-slate-400">
                {currentUser?.unlockedChapters?.length || 0} épisode(s) débloqué(s)
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-black text-amber-400 font-['Outfit']">
              {currentUser?.coinsBalance || 0} 🪙
            </div>
            <span className="text-[9px] text-slate-400 uppercase font-bold">Solde disponible</span>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => openCoinShop()}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-[#ff5a50] hover:from-amber-400 hover:to-[#ff4236] text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Recharger (Wave, Orange, CB)</span>
          </button>
        </div>

        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5">
          <span className="flex items-center gap-1">
            🌊 Wave • 🟠 Orange • 💳 CB
          </span>
          <button
            onClick={() => openCoinShop()}
            className="text-amber-400 font-bold hover:underline cursor-pointer"
          >
            Voir l'historique ➔
          </button>
        </div>
      </div>

      {/* ADMIN SHORTCUT (Only visible if isAdmin) */}
      {isAdmin && (
        <div className="p-4 bg-gradient-to-r from-purple-950/70 to-[#141624] border border-purple-500/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Panneau d'Administration</span>
                <span className="text-[9px] bg-purple-500/30 border border-purple-500/50 text-purple-200 px-1.5 py-0.5 rounded font-black">
                  CRÉATEUR
                </span>
              </div>
              <div className="text-[10px] text-purple-300/80">Gestion des séries, chapitres & membres</div>
            </div>
          </div>
          <button
            onClick={() => setActiveView('admin_dashboard')}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap"
          >
            Accéder
          </button>
        </div>
      )}

      {/* 2. SECTION PARAMÈTRES DU COMPTE */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#ff5a50] px-1">
          Paramètres du compte
        </h3>

        <div className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Modifier les informations</div>
                <div className="text-[10px] text-slate-400">Nom, email, mot de passe</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Abonnement & Facturation</div>
                <div className="text-[10px] text-slate-400">Gérer le forfait Premium</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 3. SECTION PRÉFÉRENCES */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#ff5a50] px-1">
          Préférences
        </h3>

        <div className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          {/* Mode Sombre Toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Mode sombre</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                isDarkMode ? 'bg-[#ff5a50]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Notifications */}
          <button className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Langue */}
          <button className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Langue</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Français</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </button>
        </div>
      </div>

      {/* 4. SECTION DÉCOUVERTE & HUBS (Transférés depuis le menu) */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#ff5a50] px-1">
          Espaces & Découverte
        </h3>

        <div className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            onClick={() => setActiveView('app_games')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Game Center & Mini-Jeux</div>
                <div className="text-[10px] text-slate-400">Gagnez des trophées et des pièces bonus</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => setActiveView('app_articles')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Actus & Carnets de Création</div>
                <div className="text-[10px] text-slate-400">Interviews, secrets d'auteurs et nouveautés</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => openCoinShop()}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#ff5a50]/10 text-[#ff5a50] flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Boutique de Pièces OZI</div>
                <div className="text-[10px] text-slate-400">Packs Wave, Orange Money et Cartes</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 5. INFORMATIONS LÉGALES & A PROPOS */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#ff5a50] px-1">
          À Propos & Informations Légales
        </h3>

        <div className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            onClick={() => setActiveView('legal')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Mentions Légales & CGU</div>
                <div className="text-[10px] text-slate-400">Conditions générales, politique de confidentialité</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Version de l'application</div>
                <div className="text-[10px] text-slate-400">OZI Mobile Native v1.2.0 • Build Android</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30">
              À jour
            </span>
          </div>
        </div>
      </div>

      {/* 4. DEUX BLOCS STATISTIQUES */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-4 bg-[#141624] border border-white/10 rounded-2xl flex flex-col items-center text-center">
          <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
          <div className="text-2xl font-black text-white font-['Outfit']">128</div>
          <div className="text-[11px] text-slate-400 font-medium">Séries lues</div>
        </div>

        <div className="p-4 bg-[#141624] border border-white/10 rounded-2xl flex flex-col items-center text-center">
          <Flame className="w-6 h-6 text-[#ff5a50] mb-2 fill-[#ff5a50]" />
          <div className="text-2xl font-black text-white font-['Outfit']">14</div>
          <div className="text-[11px] text-slate-400 font-medium">Jours de suite</div>
        </div>
      </div>

      {/* 5. ZONE DE DANGER */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#ff5a50] px-1">
          Zone de danger
        </h3>

        <div className="bg-[#141624] border border-red-500/20 rounded-2xl overflow-hidden divide-y divide-white/5">
          <button
            onClick={() => {
              logout();
              if (onOpenAuth) onOpenAuth();
            }}
            className="w-full p-3.5 flex items-center gap-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Se déconnecter</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-3.5 flex items-center gap-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Supprimer le compte</span>
          </button>
        </div>
      </div>

      {/* MODAL MODIFIER PROFIL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141624] border border-white/15 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white font-['Outfit']">Modifier mes informations</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5a50]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Adresse Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5a50]"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (editName.trim()) {
                    await updateProfile({ username: editName.trim(), email: editEmail.trim() });
                  }
                  setShowEditModal(false);
                }}
                className="flex-1 py-2.5 bg-[#ff5a50] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUPPRESSION COMPTE */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141624] border border-red-500/30 rounded-3xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white font-['Outfit']">Supprimer mon compte ?</h3>
            <p className="text-xs text-slate-400">
              Cette action est irréversible. Toutes vos données de lecture et abonnements seront supprimés.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteUserAccount();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
