import React, { useState, useEffect, useRef } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  ArrowLeft,
  ThumbsUp,
  ArrowRight,
  ArrowLeftCircle,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Share2,
  Bookmark,
  ListFilter,
  Check,
  Settings2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Type,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Music,
  Disc,
  Lock,
  Unlock,
  Coins,
  Zap,
} from 'lucide-react';
import { CommentsModal } from './CommentsModal';
import { OziLogo } from '../common/OziLogo';
import { formatDirectAudioUrl } from '../../lib/audioUrlHelper';

interface ReaderViewProps {
  onOpenComments?: () => void;
}

// Données enrichies de storyboard webtoon avec dialogues, narration et effets sonores
interface ComicPanelData {
  url: string;
  alt: string;
  narration?: string;
  character?: string;
  speech?: string;
  speechPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  sfx?: string;
  accentColor?: string;
}

const DEFAULT_COMIC_PANELS: Record<string, ComicPanelData[]> = {
  'ch-1-1': [
    {
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=85',
      alt: 'Planche 1 : Éveil du portail dimensionnel',
      narration: 'Séoul, 23h42 — Une déchirure spatiale de classe S s’ouvre au-dessus des gratte-ciels.',
      character: 'Alexandre',
      speech: 'Cette lueur pourpre... Ce n’est pas un donjon ordinaire. Quelque chose nous attend à l’intérieur !',
      speechPosition: 'bottom-left',
      sfx: '⚡ VWOOOOM',
      accentColor: '#ff5a50',
    },
    {
      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=85',
      alt: 'Planche 2 : La chambre secrète des sentinelles',
      narration: 'Au cœur des ruines oubliées, les statues millénaires s’animent soudainement.',
      character: 'Alexandre',
      speech: 'Leurs yeux s’embrasent de flammes bleues... Préparez-vous à l’impact !',
      speechPosition: 'top-right',
      sfx: '💥 CRRAAAASH',
      accentColor: '#38bdf8',
    },
    {
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=85',
      alt: 'Planche 3 : La confrontation des ombres',
      narration: 'Une pression écrasante s’abat sur toute la brigade. Le boss final s’avance.',
      character: 'L’Ombre Ancestrale',
      speech: 'Mortels... Vous avez franchi le seuil interdit.',
      speechPosition: 'bottom-right',
      sfx: '⚡ SHHHK',
      accentColor: '#a855f7',
    },
    {
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=85',
      alt: 'Planche 4 : L’éveil du véritable potentiel',
      narration: 'Dans un sursaut désespéré, Alexandre libère l’énergie scellée dans son artefact.',
      character: 'Alexandre',
      speech: 'Si je ne me bats pas ici... Personne ne survivra à cette nuit !',
      speechPosition: 'bottom-left',
      sfx: '🔥 ROOOAAR',
      accentColor: '#f59e0b',
    },
  ],
};

export const ReaderView: React.FC<ReaderViewProps> = ({ onOpenComments }) => {
  const {
    currentWork,
    currentChapter,
    chapters,
    setActiveView,
    openReader,
    toggleBookmark,
    isBookmarked,
    showToast,
    isChapterUnlocked,
    unlockChapterWithCoins,
    openCoinShop,
    currentUser,
  } = useOzi();

  const [likesCount, setLikesCount] = useState(24800);
  const [hasLiked, setHasLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Modes de lecture : 'vertical' (Webtoon continu pur 0px gap) ou 'paged' (Planche par planche)
  const [readingMode, setReadingMode] = useState<'vertical' | 'paged'>('vertical');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Options de lecture
  const [showSpeechBubbles, setShowSpeechBubbles] = useState(true);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'amoled' | 'sepia'>('dark');
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(1); // 1 = 1px/frame, 2 = 2px, 3 = 3px

  // Musique de chapitre (OST en boucle)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.65);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const lastScrollY = useRef(0);
  const autoScrollRef = useRef<number | null>(null);

  const workChapters = chapters.filter((c) => c.workId === (currentWork?.id || 'work-1'));

  // Construction des tranches/images du chapitre actuel
  const currentChapterId = currentChapter?.id || 'ch-1-1';
  const customPanels = DEFAULT_COMIC_PANELS[currentChapterId];

  // Gestion du lecteur Audio en boucle pour le chapitre
  const rawAudioUrl = currentChapter?.audioUrl;
  const currentAudioUrl = formatDirectAudioUrl(rawAudioUrl);
  const currentAudioTitle = currentChapter?.audioTitle || 'Bande-son du chapitre';
  const currentAudioArtist = currentChapter?.audioArtist || 'OZI OST';

  useEffect(() => {
    // Si le chapitre a une musique associée
    if (currentAudioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(currentAudioUrl);
      } else {
        audioRef.current.src = currentAudioUrl;
      }

      audioRef.current.loop = true;
      audioRef.current.volume = isAudioMuted ? 0 : audioVolume;

      // Lancement automatique de la musique en boucle
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAudioPlaying(true);
            setAudioAutoplayBlocked(false);
          })
          .catch((err) => {
            // Autoplay avec son parfois restreint par le navigateur sans interaction utilisateur préalable
            console.log('Autoplay audio en attente d’interaction:', err);
            setIsAudioPlaying(false);
            setAudioAutoplayBlocked(true);
          });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsAudioPlaying(false);
      setAudioAutoplayBlocked(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentChapter?.id, currentAudioUrl]);

  // Synchronisation volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isAudioMuted ? 0 : audioVolume;
    }
  }, [audioVolume, isAudioMuted]);

  const togglePlayAudio = () => {
    if (!audioRef.current) {
      if (currentAudioUrl) {
        audioRef.current = new Audio(currentAudioUrl);
        audioRef.current.loop = true;
      } else {
        return;
      }
    }

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.volume = isAudioMuted ? 0 : audioVolume;
      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setAudioAutoplayBlocked(false);
          showToast(`Lecture : ${currentAudioTitle}`, 'info');
        })
        .catch(() => {
          showToast('Erreur lors du démarrage audio.', 'error');
        });
    }
  };

  const toggleMuteAudio = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      if (audioRef.current) audioRef.current.volume = audioVolume;
    } else {
      setIsAudioMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const comicPanels: ComicPanelData[] =
    currentChapter?.pages && currentChapter.pages.length > 0
      ? currentChapter.pages.map((p: any, idx: number) => ({
          url: typeof p === 'string' ? p : p.imageUrl || p.url,
          alt: p.altText || `Tranche ${idx + 1}`,
          narration: p.altText && !p.altText.startsWith('Tranche') && !p.altText.startsWith('Planche') ? p.altText : undefined,
          character: 'Narration',
          speech: undefined,
          speechPosition: 'bottom-left',
          sfx: undefined,
          accentColor: '#ff5a50',
        }))
      : customPanels && customPanels.length > 0
      ? customPanels
      : DEFAULT_COMIC_PANELS['ch-1-1'];

  // Gestion du défilement automatique
  useEffect(() => {
    if (autoScrollActive && readingMode === 'vertical') {
      const scrollStep = () => {
        window.scrollBy({ top: autoScrollSpeed * 1.5, behavior: 'smooth' });
        autoScrollRef.current = requestAnimationFrame(scrollStep);
      };
      autoScrollRef.current = requestAnimationFrame(scrollStep);
    } else if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
    }
    return () => {
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [autoScrollActive, autoScrollSpeed, readingMode]);

  // Suivi de progression du scroll & masquage automatique des barres
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100)));
      }

      if (Math.abs(currentScrollY - lastScrollY.current) > 40) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
          setShowControls(false);
          setIsSettingsOpen(false);
        } else {
          setShowControls(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(likesCount - 1);
      setHasLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setHasLiked(true);
      showToast('Merci pour votre soutien ! +1 Like', 'success');
    }
  };

  // Navigation Chapitre Suivant / Précédent
  const currentChapterIndex = workChapters.findIndex((c) => c.id === currentChapter?.id);
  const prevChapter = currentChapterIndex > 0 ? workChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < workChapters.length - 1 ? workChapters[currentChapterIndex + 1] : null;

  const handleNavigateChapter = (targetChapter: any) => {
    if (!targetChapter || !currentWork) return;
    openReader(currentWork.id, targetChapter.id);
    setCurrentSlideIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Ouverture de : ${targetChapter.title}`, 'info');
  };

  const themeBgClass =
    readerTheme === 'amoled'
      ? 'bg-black text-white'
      : readerTheme === 'sepia'
      ? 'bg-[#1a1714] text-[#e6d7c3]'
      : 'bg-[#07080c] text-slate-100';

  // VÉRIFICATION D'ACCÈS FAST-PASS / COINS
  const isLocked = currentChapter ? !isChapterUnlocked(currentChapter.id) : false;

  if (isLocked && currentChapter) {
    return (
      <div className={`min-h-screen ${themeBgClass} flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]`}>
        {/* Top bar minimaliste */}
        <header className="px-4 py-3 bg-[#0d0e15] border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => setActiveView('app_work_detail')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la série</span>
          </button>
          <OziLogo size="sm" />
          <div className="w-8" />
        </header>

        {/* Écran de verrouillage Fast-Pass */}
        <div className="max-w-md mx-auto p-6 text-center space-y-6 my-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-2xl animate-pulse">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider rounded-full border border-amber-500/30 inline-block">
              ÉPISODE FAST-PASS EXCLUSIF
            </span>
            <h2 className="text-xl font-black text-white">{currentChapter.title}</h2>
            <p className="text-xs text-slate-400">
              Débloquez cet épisode en avant-première ou rechargez votre solde de pièces via Wave.
            </p>
          </div>

          <div className="p-4 bg-[#131422] border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Votre solde actuel :</span>
              <span className="font-black text-amber-400 flex items-center gap-1">
                <Coins className="w-4 h-4" />
                <span>{currentUser?.coinsBalance || 0} Coins</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
              <span className="text-slate-400">Coût de déblocage :</span>
              <span className="font-black text-white">{currentChapter.coinPrice || 5} Coins</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => unlockChapterWithCoins(currentChapter.id, currentChapter.coinPrice || 5)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-[#ff5a50] hover:from-amber-400 hover:to-[#ff463b] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer tap-active"
            >
              <Unlock className="w-4 h-4 text-slate-950" />
              <span>Débloquer ({currentChapter.coinPrice || 5} Coins)</span>
            </button>

            <button
              onClick={() => openCoinShop()}
              className="w-full py-3 bg-[#1c1e30] hover:bg-[#252840] text-amber-400 font-bold text-xs rounded-2xl border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer tap-active"
            >
              <Coins className="w-4 h-4" />
              <span>Recharger des Coins (Wave, Orange, Carte)</span>
            </button>
          </div>
        </div>

        <div className="p-4 text-center text-[11px] text-slate-500">
          Les épisodes Fast-Pass deviennent automatiquement gratuits après 7 jours.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeBgClass} flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff5a50] selection:text-white relative`}
    >
      {/* BARRE DE PROGRESSION DU DÉFILEMENT (Haut de l'écran) */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-black/40">
        <div
          className="h-full bg-gradient-to-r from-[#ff5a50] via-amber-400 to-[#ff5a50] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP BAR DU LECTEUR (Sticky, Masquable au défilement) */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-[#0d0e15]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between transition-transform duration-300 shadow-xl ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setActiveView('app_work_detail')}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer tap-active shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-white truncate font-almodobar tracking-wide">
              {currentWork?.title || 'Webtoon Original'}
            </h1>
            <p className="text-[10px] text-[#ff5a50] font-bold truncate flex items-center gap-1">
              <span>{currentChapter?.title || 'Épisode 1'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">
                {comicPanels.length} tranches ({comicPanels.length * 2000}px)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Bouton Lecteur Audio OST du Chapitre */}
          {currentAudioUrl && (
            <button
              onClick={togglePlayAudio}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer tap-active ${
                isAudioPlaying
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/20'
                  : audioAutoplayBlocked
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              title={isAudioPlaying ? `En cours : ${currentAudioTitle}` : 'Démarrer la musique'}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-slate-950" />
                  <span className="hidden sm:inline text-[11px] font-black">OST</span>
                </>
              ) : (
                <>
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline text-[11px]">Musique</span>
                </>
              )}
            </button>
          )}

          {/* Sélecteur de chapitres tiroir */}
          <button
            onClick={() => setIsChapterDrawerOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-white/10 cursor-pointer tap-active"
            title="Sommaire des chapitres"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Épisodes</span>
          </button>

          {/* Bouton Paramètres d'affichage */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer tap-active ${
              isSettingsOpen
                ? 'bg-[#ff5a50] text-white border-[#ff5a50]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Paramètres de lecture"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PANNEAU DE RÉGLAGES DU LECTEUR (Déroulant) */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed top-14 right-4 z-40 w-72 bg-[#121422] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-4 animate-in slide-in-from-top-2 duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-black text-white">Paramètres de lecture</span>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Mode de défilement */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mode d'affichage
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setReadingMode('vertical')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                  readingMode === 'vertical'
                    ? 'border-[#ff5a50] bg-[#ff5a50]/20 text-[#ff5a50]'
                    : 'border-white/10 bg-black/40 text-slate-400'
                }`}
              >
                📜 Défilement Webtoon
              </button>
              <button
                onClick={() => setReadingMode('paged')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                  readingMode === 'paged'
                    ? 'border-[#ff5a50] bg-[#ff5a50]/20 text-[#ff5a50]'
                    : 'border-white/10 bg-black/40 text-slate-400'
                }`}
              >
                📖 Planches
              </button>
            </div>
          </div>

          {/* Thème de fond */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ambiance & Thème
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setReaderTheme('dark')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 ${
                  readerTheme === 'dark'
                    ? 'border-[#ff5a50] bg-slate-900 text-white'
                    : 'border-white/10 bg-black/40 text-slate-400'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Sombre</span>
              </button>
              <button
                onClick={() => setReaderTheme('amoled')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 ${
                  readerTheme === 'amoled'
                    ? 'border-[#ff5a50] bg-black text-white'
                    : 'border-white/10 bg-black/40 text-slate-400'
                }`}
              >
                <span>⚫ AMOLED</span>
              </button>
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 ${
                  readerTheme === 'sepia'
                    ? 'border-amber-500 bg-[#241e17] text-amber-200'
                    : 'border-white/10 bg-black/40 text-slate-400'
                }`}
              >
                <span>📜 Sépia</span>
              </button>
            </div>
          </div>

          {/* Défilement Automatique */}
          {readingMode === 'vertical' && (
            <div className="space-y-1.5 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Auto-scroll</span>
                  {autoScrollActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </span>
                <button
                  onClick={() => setAutoScrollActive(!autoScrollActive)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                    autoScrollActive
                      ? 'bg-emerald-500 text-black shadow'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {autoScrollActive ? (
                    <>
                      <Pause className="w-3 h-3" /> Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Démarrer
                    </>
                  )}
                </button>
              </div>

              {autoScrollActive && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Vitesse :</span>
                  {[1, 2, 3].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAutoScrollSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        autoScrollSpeed === spd
                          ? 'bg-[#ff5a50] text-white'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contrôles de la bande-son & Musique en boucle */}
          {currentAudioUrl && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{currentAudioTitle}</p>
                    <p className="text-[9px] text-slate-400 truncate">{currentAudioArtist} • Boucle active</p>
                  </div>
                </div>

                <button
                  onClick={togglePlayAudio}
                  className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    isAudioPlaying
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                  title={isAudioPlaying ? 'Mettre en pause' : 'Lancer la musique'}
                >
                  {isAudioPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>

              {/* Volume et Mute */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={toggleMuteAudio}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title={isAudioMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isAudioMuted || audioVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isAudioMuted ? 0 : audioVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAudioVolume(val);
                    if (isAudioMuted && val > 0) setIsAudioMuted(false);
                  }}
                  className="w-full h-1 bg-[#1b1e32] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[9px] font-mono text-slate-400 w-7 text-right">
                  {isAudioMuted ? '0%' : `${Math.round(audioVolume * 100)}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SÉLECTEUR DE CHAPITRES MODAL */}
      {isChapterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121422] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-white">Liste des épisodes</span>
              <button
                onClick={() => setIsChapterDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Fermer
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {workChapters.length > 0 ? (
                workChapters.map((ch) => {
                  const isCurrent = ch.id === currentChapter?.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        if (currentWork) openReader(currentWork.id, ch.id);
                        setIsChapterDrawerOpen(false);
                        setCurrentSlideIndex(0);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer text-left ${
                        isCurrent
                          ? 'bg-[#ff5a50] text-white shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block truncate">
                          {ch.title || `Épisode ${ch.chapterNumber || ch.number}`}
                        </span>
                        <span className="text-[10px] opacity-75 font-normal">
                          {ch.releaseDate || 'Sortie récente'}
                        </span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 shrink-0 text-white" />}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">
                  1 chapitre disponible pour cette œuvre.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FLUX DES PLANCHES WEBTOON : DÉFILEMENT CONTINU SANS COUTURE (0px GAP) */}
      {/* ========================================================================= */}
      {readingMode === 'vertical' ? (
        /* MODE VERTICAL PUR WEBTOON (Images empilées bord à bord sans coupure) */
        <div
          className="w-full flex flex-col items-center pt-12 pb-16 cursor-pointer"
          onClick={toggleControls}
        >
          <div className="w-full max-w-lg mx-auto flex flex-col p-0 m-0 leading-none">
            {comicPanels.map((panel, idx) => (
              <div
                key={idx}
                className="w-full p-0 m-0 border-0 leading-none block relative"
              >
                {/* Image découpée (Tranche 1 -> Tranche N) bord à bord */}
                <img
                  src={panel.url}
                  alt={panel.alt}
                  className="w-full h-auto block select-none object-cover p-0 m-0 border-0 align-bottom"
                  loading={idx < 3 ? 'eager' : 'lazy'}
                />

                {/* Badge optionnel si narration spécifique */}
                {panel.narration && (
                  <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg text-[11px] font-medium text-slate-200 leading-snug">
                      <span className="text-[#ff5a50] font-black mr-1.5">◆</span>
                      {panel.narration}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MODE PLANCHE PAR PLANCHE (PAGED SLIDE) */
        <div className="w-full flex-1 flex flex-col items-center justify-center pt-14 pb-20 px-2 relative min-h-[calc(100vh-60px)]">
          <div className="relative max-w-lg w-full aspect-[3/4] bg-black/60 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
            {comicPanels[currentSlideIndex] && (
              <img
                src={comicPanels[currentSlideIndex].url}
                alt={comicPanels[currentSlideIndex].alt}
                className="w-full h-full object-contain select-none"
              />
            )}

            {/* Boutons de pagination précédent / suivant */}
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 disabled:opacity-20 text-white rounded-full transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => setCurrentSlideIndex(Math.min(comicPanels.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === comicPanels.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 disabled:opacity-20 text-white rounded-full transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-3 text-xs font-bold text-slate-400 font-mono">
            Planche {currentSlideIndex + 1} sur {comicPanels.length}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BARRE INFÉRIEURE FLOTTANTE D'INTERACTION & NAVIGATION D'ÉPISODES */}
      {/* ========================================================================= */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e15]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 flex items-center justify-between transition-transform duration-300 shadow-2xl ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Navigation vers l'épisode précédent */}
        <button
          onClick={() => handleNavigateChapter(prevChapter)}
          disabled={!prevChapter}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tap-active ${
            prevChapter
              ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              : 'opacity-30 text-slate-500 cursor-not-allowed'
          }`}
          title="Épisode précédent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Actions centrales : Like & Commentaires */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer tap-active ${
              hasLiked
                ? 'bg-[#ff5a50] text-white shadow-lg shadow-[#ff5a50]/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}</span>
          </button>

          <button
            onClick={() => {
              if (onOpenComments) {
                onOpenComments();
              } else {
                setIsCommentsOpen(true);
              }
            }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer tap-active"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Avis</span>
          </button>
        </div>

        {/* Navigation vers l'épisode suivant */}
        <button
          onClick={() => handleNavigateChapter(nextChapter)}
          disabled={!nextChapter}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer tap-active ${
            nextChapter
              ? 'bg-[#ff5a50] hover:bg-[#ff463b] text-white shadow-lg shadow-[#ff5a50]/20'
              : 'opacity-30 text-slate-500 cursor-not-allowed bg-white/5'
          }`}
          title="Épisode suivant"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Modale des commentaires */}
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        chapterId={currentChapter?.id || 'ch-1-1'}
        workId={currentWork?.id || 'work-1'}
      />
    </div>
  );
};
