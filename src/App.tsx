import React, { useState } from 'react';
import { useOzi } from './context/OziContext';
import { MobileAppExperience } from './components/layout/MobileAppExperience';
import { ReaderView } from './components/app/ReaderView';
import { CommentsModal } from './components/app/CommentsModal';
import { AuthModal } from './components/auth/AuthModal';
import { CoinShopModal } from './components/shop/CoinShopModal';
import { useCapacitorInit } from './hooks/useCapacitorInit';
import {
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

export function App() {
  const {
    activeView,
    setActiveView,
    selectedArticleId,
    setSelectedArticleId,
    toast,
  } = useOzi();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Initialisation des fonctionnalités natives Android (Status bar, Splash, Hardware Back Button)
  useCapacitorInit(() => {
    // Si un article spécifique est ouvert dans les Actus -> Revenir à la liste des articles
    if (selectedArticleId) {
      setSelectedArticleId(null);
      return true;
    }
    // Si on est dans le lecteur immersif -> Revenir à la fiche de la série
    if (activeView === 'app_reader') {
      setActiveView('app_work_detail');
      return true;
    }
    // Si on est sur la fiche d'une série -> Revenir à l'accueil / catalogue
    if (activeView === 'app_work_detail') {
      setActiveView('app_catalogue');
      return true;
    }
    // Si on est dans les actus / carnets -> Revenir à l'accueil
    if (activeView === 'app_articles') {
      setActiveView('app_catalogue');
      return true;
    }
    // Si on est dans le dashboard admin ou légal ou profil -> Revenir à l'accueil
    if (activeView === 'admin_dashboard' || activeView === 'legal' || activeView === 'app_profile' || activeView === 'app_games') {
      setActiveView('app_catalogue');
      return true;
    }
    return false;
  });

  // Si on est dans le lecteur, mode plein écran direct
  const isReaderView = activeView === 'app_reader';

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff5a50] selection:text-white">
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

      {/* VUE PRINCIPALE */}
      {isReaderView ? (
        <div className="flex-1 w-full min-h-screen bg-[#07080c]">
          <ReaderView />
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-start bg-[#07080c]">
          <div className="w-full max-w-md min-h-screen bg-[#0d0e15] sm:border-x sm:border-white/5 relative flex flex-col shadow-2xl">
            <MobileAppExperience />
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Boutique de Pièces (Wave, Orange Money, Carte) */}
      <CoinShopModal />

      {/* Comments Modal */}
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
