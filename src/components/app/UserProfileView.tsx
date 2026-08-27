import React, { useState, useRef } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  User,
  CreditCard,
  Moon,
  Bell,
  Globe,
  BookOpen,
  Library,
  Bookmark,
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
  Camera,
  Upload,
  Image as ImageIcon,
  Play,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface UserProfileViewProps {
  initialTab?: 'profile' | 'library';
  onOpenAuth?: () => void;
}

const PRESET_AVATARS = [
  { id: 'av-1', label: 'Héros Solaire', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-2', label: 'Créateur OZI', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-3', label: 'Guerrière Mystique', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-4', label: 'Cyber Hacker', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-5', label: 'Chevalier d’Ombre', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-6', label: 'Étoile Céleste', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-7', label: 'Traqueur Urbain', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 'av-8', label: 'Invocatrice', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({ initialTab = 'profile', onOpenAuth }) => {
  const {
    currentUser,
    isAdmin,
    setActiveView,
    logout,
    deleteUserAccount,
    updateProfile,
    bookmarkedWorks,
    works,
    chapters,
    openWorkDetail,
    openReader,
    openCoinShop,
    showToast,
  } = useOzi();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [librarySubTab, setLibrarySubTab] = useState<'bookmarks' | 'history' | 'unlocked'>('bookmarks');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.username || 'Lecteur OZI');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editAvatar, setEditAvatar] = useState(
    currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image trop volumineuse (max 5 Mo).', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setEditAvatar(result);
          showToast('Photo importée ! Cliquez sur Enregistrer pour valider.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const readingHistory = currentUser?.readHistory || [];
  const unlockedChapterIds = currentUser?.unlockedChapters || [];
  const unlockedChaptersList = chapters.filter((c) => unlockedChapterIds.includes(c.id));

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
    <div className="px-4 py-3 space-y-6 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Navigation de retour rapide */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <button
          onClick={() => setActiveView('app_catalogue')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer tap-active"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff5a50]" />
          <span>Retour à l'accueil</span>
        </button>
        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
          Paramètres & Compte
        </span>
      </div>

      {/* 1. EN-TÊTE DU PROFIL (Grand avatar avec bouton crayon, nom, email, badges) */}
      <div className="flex flex-col items-center text-center pt-1">
        {/* Avatar avec cercle dégradé corail et bouton crayon */}
        <div className="relative mb-3">
          <div className="w-24 h-24 avatar-round p-1 bg-gradient-to-tr from-[#ff5a50] to-[#ff8a80] shadow-xl">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
              }
              alt="Profil"
              className="w-full h-full avatar-round object-cover bg-slate-900"
            />
          </div>
          <button
            onClick={() => {
              setEditAvatar(currentUser?.avatar || PRESET_AVATARS[0].url);
              setShowAvatarModal(true);
            }}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#ff5a50] hover:bg-[#ff453b] text-white avatar-round flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform"
            aria-label="Modifier l'avatar"
            title="Changer de photo de profil"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Nom & Email */}
        <h1 className="text-xl font-black text-white font-['Outfit']">
          {currentUser?.username || 'Alexandre Dupont'}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {currentUser?.email || 'alexandre.d@example.com'}
        </p>

        {/* Badges sans encadrement/bordure */}
        <div className="flex items-center gap-4 mt-2.5">
          <span className="text-[#ff7a70] text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Lecteur Actif
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" /> {currentUser?.coinsBalance || 0} Coins
          </span>
        </div>
      </div>

      {/* PORTEFEUILLE OZI COINS & MONÉTISATION */}
      <div className="p-4 bg-gradient-to-br from-[#1a1728] via-[#141624] to-[#121422] border border-amber-500/30 rounded-3xl space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-400 shrink-0" />
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
            <Shield className="w-6 h-6 text-purple-300 shrink-0" />
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

      {/* MA BIBLIOTHÈQUE & HISTORIQUE INTÉGRÉE AU PROFIL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff5a50]/15 border border-[#ff5a50]/30 flex items-center justify-center">
              <Library className="w-4 h-4 text-[#ff5a50]" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Ma Bibliothèque
              </h3>
              <p className="text-[10px] text-slate-400">Favoris, reprises de lecture et déblocages</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#ff7a70] bg-[#ff5a50]/10 px-2 py-0.5 rounded-full font-bold border border-[#ff5a50]/20">
            {bookmarkedWorks.length + readingHistory.length} titres
          </span>
        </div>

        {/* Sélecteur de sous-onglets Bibliothèque */}
        <div className="grid grid-cols-3 p-1 bg-[#141624] border border-white/10 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setLibrarySubTab('bookmarks')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              librarySubTab === 'bookmarks'
                ? 'bg-[#ff5a50] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Favoris ({bookmarkedWorks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setLibrarySubTab('history')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              librarySubTab === 'history'
                ? 'bg-[#ff5a50] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({readingHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setLibrarySubTab('unlocked')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              librarySubTab === 'unlocked'
                ? 'bg-[#ff5a50] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Débloqués ({unlockedChaptersList.length})</span>
          </button>
        </div>

        {/* CONTENU SOUS-ONGLET 1 : FAVORIS */}
        {librarySubTab === 'bookmarks' && (
          <div>
            {bookmarkedWorks.length === 0 ? (
              <div className="p-6 text-center bg-[#141624] border border-white/10 rounded-2xl space-y-2">
                <Bookmark className="w-7 h-7 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">Aucune série en favoris pour l'instant</p>
                <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                  Enregistrez vos webtoons préférés pour y accéder en un clin d'œil.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('app_catalogue')}
                  className="mt-2 px-3.5 py-1.5 bg-[#1c1e2e] hover:bg-[#25283d] text-white text-xs font-bold rounded-xl border border-white/10 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#ff5a50]" />
                  <span>Explorer le catalogue</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {bookmarkedWorks.map((work) => (
                  <div
                    key={work.id}
                    onClick={() => openWorkDetail(work.id)}
                    className="bg-[#141624] border border-white/10 hover:border-[#ff5a50]/40 rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-95 transition-all group"
                  >
                    <div className="aspect-[3/4] bg-slate-900 relative overflow-hidden">
                      <img
                        src={work.coverUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm p-1 rounded-full text-[#ff5a50]">
                        <Bookmark className="w-3.5 h-3.5 fill-[#ff5a50]" />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white truncate">{work.title}</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>{work.totalChapters} chapitres</span>
                        <span className="text-[#ff7a70] font-bold">★ {work.rating || 4.9}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENU SOUS-ONGLET 2 : HISTORIQUE */}
        {librarySubTab === 'history' && (
          <div>
            {readingHistory.length === 0 ? (
              <div className="p-6 text-center bg-[#141624] border border-white/10 rounded-2xl space-y-2">
                <History className="w-7 h-7 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">Aucune lecture récente</p>
                <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                  Vos lectures récentes s'afficheront ici avec votre avancement précis.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {readingHistory.map((item, idx) => {
                  const targetWork = works.find((w) => w.id === item.workId);
                  const targetChapter = chapters.find((c) => c.id === item.chapterId);
                  return (
                    <div
                      key={`${item.workId}-${item.chapterId}-${idx}`}
                      onClick={() => openReader(item.workId, item.chapterId)}
                      className="p-2.5 bg-[#141624] hover:bg-[#1c1e2e] border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={targetWork?.coverUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80'}
                          alt={targetWork?.title || 'Série'}
                          className="w-11 h-14 object-cover rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {targetWork?.title || 'Série OZI'}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {targetChapter?.title || `Chapitre #${item.chapterId}`}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
                            <Play className="w-2.5 h-2.5 fill-emerald-400" />
                            <span>Page {item.pageIndex + 1} • Reprendre</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTENU SOUS-ONGLET 3 : DÉBLOQUÉS */}
        {librarySubTab === 'unlocked' && (
          <div>
            {unlockedChaptersList.length === 0 ? (
              <div className="p-6 text-center bg-[#141624] border border-white/10 rounded-2xl space-y-2">
                <Lock className="w-7 h-7 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">Aucun épisode payant débloqué</p>
                <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                  Débloquez des épisodes premiums avec vos pièces OZI pour les conserver à vie.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {unlockedChaptersList.map((chap) => {
                  const targetWork = works.find((w) => w.id === chap.workId);
                  return (
                    <div
                      key={chap.id}
                      onClick={() => openReader(chap.workId, chap.id)}
                      className="p-2.5 bg-[#141624] hover:bg-[#1c1e2e] border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono text-xs font-black">
                          #{chap.number}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{chap.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{targetWork?.title}</div>
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Débloqué à vie
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. SECTION PARAMÈTRES DU COMPTE */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#ff5a50] px-1">
          Paramètres du compte
        </h3>

        <div className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          {/* Changer la photo de profil */}
          <button
            onClick={() => {
              setEditAvatar(currentUser?.avatar || PRESET_AVATARS[0].url);
              setShowAvatarModal(true);
            }}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 bg-slate-800">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Avatar actuel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Photo de profil</span>
                  <span className="text-[9px] bg-[#ff5a50]/20 text-[#ff7a70] font-bold px-1.5 py-0.5 rounded">Avatar</span>
                </div>
                <div className="text-[10px] text-slate-400">Changer d'image, importer ou choisir un style</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          {/* Modifier nom et email */}
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-300 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Modifier les informations</div>
                <div className="text-[10px] text-slate-400">Nom, email, mot de passe</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-300 shrink-0" />
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
              <Moon className="w-5 h-5 text-slate-300 shrink-0" />
              <span className="text-xs font-bold text-white">Mode sombre</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-11 h-6 rounded-pill p-0.5 transition-colors cursor-pointer ${
                isDarkMode ? 'bg-[#ff5a50]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-pill bg-white transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Notifications */}
          <button className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-300 shrink-0" />
              <span className="text-xs font-bold text-white">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Langue */}
          <button className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-300 shrink-0" />
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
              <Gamepad2 className="w-5 h-5 text-amber-400 shrink-0" />
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
              <Newspaper className="w-5 h-5 text-cyan-400 shrink-0" />
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
              <Coins className="w-5 h-5 text-[#ff5a50] shrink-0" />
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
              <Scale className="w-5 h-5 text-slate-300 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Mentions Légales & CGU</div>
                <div className="text-[10px] text-slate-400">Conditions générales, politique de confidentialité</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
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

      {/* MODAL CHANGER LA PHOTO DE PROFIL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141624] border border-white/15 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#ff5a50]" />
                <span>Photo de profil</span>
              </h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Aperçu en direct */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-24 h-24 avatar-round p-1 bg-gradient-to-tr from-[#ff5a50] to-amber-400 shadow-xl relative">
                <img
                  src={editAvatar}
                  alt="Aperçu avatar"
                  className="w-full h-full avatar-round object-cover bg-slate-900"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-2">Aperçu en direct de votre avatar</span>
            </div>

            {/* Option 1: Importer depuis l'appareil */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-[#1c1e2e] hover:bg-[#25283d] border border-white/10 hover:border-[#ff5a50]/50 rounded-2xl flex items-center justify-center gap-2 text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-98"
            >
              <Upload className="w-4 h-4 text-[#ff5a50]" />
              <span>Choisir une photo depuis mon appareil</span>
            </button>

            {/* Option 2: Galerie d'avatars exclusifs OZI */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Ou choisir un avatar de la galerie OZI :
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = editAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditAvatar(preset.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer p-0.5 ${
                        isSelected
                          ? 'border-[#ff5a50] ring-2 ring-[#ff5a50]/50 scale-105'
                          : 'border-white/10 hover:border-white/40'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover rounded-xl" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#ff5a50]/40 flex items-center justify-center rounded-xl">
                          <Check className="w-5 h-5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 3: Lien URL Personnalisé */}
            <div className="pt-1">
              <label className="text-[11px] text-slate-400 block mb-1">Ou coller une URL d'image</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 bg-[#1c1e2e] border border-white/10 text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#ff5a50]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      setEditAvatar(customAvatarUrl.trim());
                      setCustomAvatarUrl('');
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateProfile({ avatar: editAvatar });
                  setShowAvatarModal(false);
                }}
                className="flex-1 py-2.5 bg-[#ff5a50] hover:bg-[#ff453b] text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-lg"
              >
                Enregistrer la photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER PROFIL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141624] border border-white/15 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white font-['Outfit']">Modifier mes informations</h3>
            
            {/* Raccourci photo dans le modal infos */}
            <div className="flex items-center gap-3 p-2.5 bg-[#1c1e2e] rounded-2xl border border-white/10">
              <img
                src={editAvatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border border-white/20"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-white">Photo de profil</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setShowAvatarModal(true);
                  }}
                  className="text-[11px] text-[#ff5a50] font-bold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                >
                  <Camera className="w-3 h-3" /> Changer de photo
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">Nom d'utilisateur</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5a50]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-bold">Adresse Email</label>
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
                    await updateProfile({
                      username: editName.trim(),
                      email: editEmail.trim(),
                      avatar: editAvatar,
                    });
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
