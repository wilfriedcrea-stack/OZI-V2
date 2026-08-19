import React, { useState } from 'react';
import { useOzi } from './context/OziContext';
import { MobileAppExperience } from './components/layout/MobileAppExperience';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { CatalogueView } from './components/app/CatalogueView';
import { WorkDetailView } from './components/app/WorkDetailView';
import { ReaderView } from './components/app/ReaderView';
import { GamesArcadeView } from './components/app/GamesArcadeView';
import { ArticlesView } from './components/app/ArticlesView';
import { UserProfileView } from './components/app/UserProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LegalPagesView } from './components/legal/LegalPagesView';
import { CommentsModal } from './components/app/CommentsModal';
import { AuthModal } from './components/auth/AuthModal';
import { CoinShopModal } from './components/shop/CoinShopModal';
import { useCapacitorInit } from './hooks/useCapacitorInit';
import {
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Info,
  BookOpen,
  Eye,
  Gamepad2,
  User,
  Newspaper,
  Shield,
  Layers,
  MessageSquare,
} from 'lucide-react';

export function App() {
  const {
    activeView,
    setActiveView,
    currentUser,
    isAdmin,
    openWorkDetail,
    openReader,
    works,
    chapters,
    toast,
  } = useOzi();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  
  // Format d'affichage : Mobile natif (maquettes Figma) ou Grand écran Web
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Initialisation des fonctionnalités natives Android (Status bar, Splash, Hardware Back Button)
  useCapacitorInit(() => {
    if (activeView === 'app_reader') {
      setActiveView('app_work_detail');
      return true;
    }
    if (activeView === 'app_work_detail') {
      setActiveView('app_home');
      return true;
    }
    return false;
  });

  // Si on est dans le reader, mode plein écran direct
  const isReaderView = activeView === 'app_reader';

  const handleOpenWorkDetailDemo = () => {
    const targetWork = works.find((w) => w.id === 'work-2') || works[0];
    if (targetWork) openWorkDetail(targetWork.id);
  };

  const handleOpenReaderDemo = () => {
    const targetWork = works[0];
    const targetChapter = chapters.find((c) => c.workId === targetWork?.id) || chapters[0];
    if (targetWork && targetChapter) {
      openReader(targetWork.id, targetChapter.id);
    } else {
      setActiveView('app_reader');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff5a50] selection:text-white">
      {/* Toast Notification Floating Pill */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-red-950/95 text-red-200 border-red-500/50'
                : 'bg-amber-950/95 text-amber-200 border-amber-500/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRE SUPÉRIEURE DE NAVIGATION GLOBALE VERS TOUTES LES PAGES & FORMATS */}
      {/* ========================================================================= */}
      {!isReaderView && (
        <div className="bg-[#0b0c13] border-b border-white/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sticky top-0 z-40">
          {/* Indicateur de Mode & Sélecteur Rapide des 8 Pages */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            <div className="flex items-center gap-1.5 text-[#ff5a50] font-black shrink-0 pr-2 border-r border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#ff5a50] animate-pulse"></span>
              <span>OZI PAGES :</span>
            </div>

            <button
              onClick={() => setActiveView('app_catalogue')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                activeView === 'app_catalogue'
                  ? 'bg-[#ff5a50] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <span>1. Accueil</span>
            </button>

            <button
              onClick={handleOpenWorkDetailDemo}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                activeView === 'app_work_detail'
                  ? 'bg-[#ff5a50] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>2. Fiche Série</span>
            </button>

            <button
              onClick={handleOpenReaderDemo}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                activeView === 'app_reader'
                  ? 'bg-[#ff5a50] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>3. Lecteur</span>
            </button>

            <button
              onClick={() => setIsCommentsModalOpen(true)}
              className="px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
            >
              <MessageSquare className="w-3 h-3" />
              <span>4. Commentaires</span>
            </button>

            <button
              onClick={() => setActiveView('app_games')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                activeView === 'app_games'
                  ? 'bg-[#ff5a50] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Gamepad2 className="w-3 h-3" />
              <span>5. Game Center</span>
            </button>

            <button
              onClick={() => setActiveView('app_profile')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                activeView === 'app_profile'
                  ? 'bg-[#ff5a50] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <User className="w-3 h-3" />
              <span>6. Profil</span>
            </button>

            <button
              onClick={() => setActiveView('app_articles')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                activeView === 'app_articles'
                  ? 'bg-[#ff5a50] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Newspaper className="w-3 h-3" />
              <span>7. Actus & Carnets</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveView('admin_dashboard')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
                  activeView === 'admin_dashboard'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>8. Admin</span>
              </button>
            )}
          </div>

          {/* Switcher Format Mobile App vs Desktop */}
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-white/10 ml-auto">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-[#ff5a50] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Format Mobile</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-[#ff5a50] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Format Desktop</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. VUE LECTEUR IMMERSIF PLEIN ÉCRAN */}
      {isReaderView ? (
        <div className="flex-1 w-full min-h-screen bg-[#07080c]">
          <ReaderView />
        </div>
      ) : viewMode === 'mobile' ? (
        /* 2. VUE APPLICATION MOBILE NATIVE (Défaut conforme maquettes) */
        <div className="flex-1 flex justify-center items-start bg-slate-950 sm:py-4">
          <div className="w-full max-w-[430px] min-h-screen bg-slate-950 sm:border-4 sm:border-slate-800 sm:rounded-[44px] sm:shadow-2xl relative flex flex-col overflow-hidden sm:min-h-[844px]">
            <MobileAppExperience />
          </div>
        </div>
      ) : (
        /* 3. VUE DESKTOP / ADMIN / PORTAIL WEB */
        <div className="flex-1 flex flex-col">
          <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            {(activeView === 'landing' || activeView === 'app_catalogue') && <CatalogueView />}
            {activeView === 'app_work_detail' && <WorkDetailView />}
            {activeView === 'app_games' && <GamesArcadeView />}
            {activeView === 'app_articles' && <ArticlesView />}
            {activeView === 'app_profile' && <UserProfileView initialTab="profile" />}
            {activeView === 'app_library' && <UserProfileView initialTab="library" />}
            {activeView === 'admin_dashboard' && (
              isAdmin ? (
                <AdminDashboard />
              ) : (
                <div className="max-w-md mx-auto my-12 p-6 bg-[#141624] border border-red-500/30 rounded-2xl text-center space-y-4 shadow-xl">
                  <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-white">Accès réservé</h2>
                  <p className="text-xs text-slate-400">
                    Ce tableau de bord est réservé exclusivement à l'administrateur créateur (wilfriedcrea@gmail.com).
                  </p>
                  <button
                    onClick={() => setActiveView('app_catalogue')}
                    className="w-full py-2.5 bg-[#ff5a50] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Retour au catalogue
                  </button>
                </div>
              )
            )}
            {activeView === 'legal' && <LegalPagesView />}
          </main>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Boutique de Pièces (Wave, Orange Money, Carte) */}
      <CoinShopModal />

      {/* Comments Modal (Accessible globalement pour démonstration / test direct) */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        chapterId="ch-1-1"
        workId="work-1"
      />
    </div>
  );
}

export default App;
