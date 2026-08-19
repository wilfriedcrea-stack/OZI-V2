import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  Menu,
  Search,
  Bookmark,
  Play,
  Star,
  Flame,
  ChevronRight,
  BookOpen,
  Gamepad2,
  Newspaper,
  User,
  ShoppingBag,
  ArrowLeft,
  Coins,
  Sparkles,
  Zap,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { OziLogo } from '../common/OziLogo';
import { WorkDetailView } from '../app/WorkDetailView';
import { ReaderView } from '../app/ReaderView';
import { UserProfileView } from '../app/UserProfileView';
import { ArticlesView } from '../app/ArticlesView';
import { AdminDashboard } from '../admin/AdminDashboard';
import { LegalPagesView } from '../legal/LegalPagesView';
import { LandingPage } from '../landing/LandingPage';
import { AuthModal } from '../auth/AuthModal';
import { CommentsModal } from '../app/CommentsModal';
import { SideDrawer } from './SideDrawer';
import { ShopDrawer, CartItem } from '../shop/ShopDrawer';
import { CoinShopModal } from '../shop/CoinShopModal';
import { PlayableGameModal } from '../games/PlayableGameModal';
import { Game } from '../../types';

export const MobileAppExperience: React.FC = () => {
  const {
    activeView,
    setActiveView,
    works,
    chapters,
    games,
    openWorkDetail,
    openReader,
    toggleBookmark,
    isBookmarked,
    currentUser,
    isAdmin,
    searchQuery,
    setSearchQuery,
    showToast,
    openCoinShop,
  } = useOzi();

  // Navigation locale
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'games' | 'blog' | 'profile'>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [gameCategory, setGameCategory] = useState<string>('all');
  const [playingGame, setPlayingGame] = useState<Game | null>(null);

  // Panier e-commerce
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'merch-1',
      title: 'Artbook Officiel Vol. 1',
      price: 39,
      priceFormatted: '39€',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      quantity: 1,
    },
  ]);

  const handleAddToCart = (item: {
    id: string;
    title: string;
    price: number;
    priceFormatted: string;
    image: string;
  }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCheckoutCart = () => {
    setCart([]);
  };

  // Liste des genres uniques
  const allGenres = ['all', ...Array.from(new Set(works.flatMap((w) => w.genres || [])))];

  // Filtrage des œuvres
  const featuredWork = works.find((w) => w.featured) || works[0];
  const popularWorks = works.slice(0, 5);

  const filteredWorks = works.filter((w) => {
    const matchesSearch = searchQuery
      ? w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesGenre = selectedGenre === 'all' || w.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  // Filtrage des jeux
  const filteredGames = games.filter((g) => {
    if (gameCategory === 'all') return true;
    return g.category.toLowerCase() === gameCategory.toLowerCase();
  });

  const featuredGame = games[0];

  // Si on est sur l'écran du lecteur immersif
  if (activeView === 'app_reader') {
    return <ReaderView />;
  }

  // Si on est sur la fiche d'une série
  if (activeView === 'app_work_detail') {
    return (
      <div className="min-h-screen bg-[#07080c] flex flex-col justify-between w-full max-w-md mx-auto relative border-x border-white/5 overflow-x-hidden">
        <WorkDetailView
          onOpenShop={() => setIsShopOpen(true)}
          onAddToCart={handleAddToCart}
        />
        <ShopDrawer
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleCheckoutCart}
        />
      </div>
    );
  }

  // Si on est sur les Carnets & Actus
  if (activeView === 'app_articles') {
    return (
      <div className="min-h-screen bg-[#07080c] text-white flex flex-col max-w-md mx-auto border-x border-white/5 pb-20">
        <header className="sticky top-0 z-30 bg-[#0d0e15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button
            onClick={() => setActiveView('app_catalogue')}
            className="text-slate-300 hover:text-white p-2 flex items-center gap-1.5 text-xs font-bold tap-active cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <OziLogo size="sm" />
          <div className="w-8" />
        </header>
        <div className="p-4">
          <ArticlesView />
        </div>
      </div>
    );
  }

  // Si on est sur le Dashboard Admin
  if (activeView === 'admin_dashboard') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#07080c] text-white flex flex-col max-w-md mx-auto border-x border-white/5 pb-20 justify-center p-6 text-center">
          <div className="p-6 bg-[#141624] border border-red-500/30 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Accès Réservé</h2>
            <p className="text-xs text-slate-400">
              Ce tableau de bord est réservé exclusivement au compte créateur (wilfriedcrea@gmail.com).
            </p>
            <button
              onClick={() => setActiveView('app_catalogue')}
              className="w-full py-2.5 bg-[#ff5a50] text-white font-bold text-xs rounded-xl shadow cursor-pointer tap-active"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#07080c] text-white flex flex-col max-w-md mx-auto border-x border-white/5 pb-20">
        <header className="sticky top-0 z-30 bg-[#0d0e15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button
            onClick={() => setActiveView('app_catalogue')}
            className="text-slate-300 hover:text-white p-2 flex items-center gap-1.5 text-xs font-bold tap-active cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <span className="text-xs font-black uppercase text-purple-400">Administration Créateur</span>
          <div className="w-8" />
        </header>
        <div className="p-3">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  // Si on est sur la Landing Page
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-[#07080c] text-white flex flex-col max-w-md mx-auto border-x border-white/5 pb-20">
        <header className="sticky top-0 z-30 bg-[#0d0e15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button
            onClick={() => setActiveView('app_catalogue')}
            className="text-slate-300 hover:text-white p-2 flex items-center gap-1.5 text-xs font-bold tap-active cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Application</span>
          </button>
          <OziLogo size="sm" />
          <div className="w-8" />
        </header>
        <LandingPage />
      </div>
    );
  }

  // Si on est sur les Pages Légales
  if (activeView === 'legal') {
    return (
      <div className="min-h-screen bg-[#07080c] text-white flex flex-col max-w-md mx-auto border-x border-white/5 pb-20">
        <header className="sticky top-0 z-30 bg-[#0d0e15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
          <button
            onClick={() => setActiveView('app_catalogue')}
            className="text-slate-300 hover:text-white p-2 flex items-center gap-1.5 text-xs font-bold tap-active cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <span className="text-xs font-bold text-slate-300">Mentions Légales</span>
          <div className="w-8" />
        </header>
        <div className="p-4">
          <LegalPagesView />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Conteneur Mobile centré avec styles natifs */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#0d0e15] border-x border-white/5 relative shadow-2xl pb-24">
        
        {/* ========================================================================= */}
        {/* 1. TOP NAVBAR MOBILE TACTILE HAUTE QUALITÉ */}
        {/* Disposition symétrique : [Gauche: Coins] — [Centre: Logo OZI] — [Droite: Recherche + Boutique] */}
        {/* ========================================================================= */}
        <header className="sticky top-0 z-30 bg-[#0d0e15]/90 backdrop-blur-xl px-4 py-3 grid grid-cols-3 items-center border-b border-white/10 shadow-sm">
          {/* ZONE GAUCHE : Solde des Pièces & Rechargement */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => openCoinShop()}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 rounded-full text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer tap-active transition-all"
              title="Recharger des Pièces OZI"
            >
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-mono">{currentUser?.coinsBalance || 0}</span>
              <span className="text-[10px] text-amber-400 font-bold hidden xs:inline">🪙</span>
            </button>
          </div>

          {/* ZONE CENTRALE : Logo OZI parfaitement centré */}
          <div className="flex items-center justify-center">
            <div
              onClick={() => {
                setActiveTab('home');
                setActiveView('app_catalogue');
              }}
              className="cursor-pointer tap-active py-0.5 inline-block"
              title="Accueil OZI"
            >
              <OziLogo size="md" />
            </div>
          </div>

          {/* ZONE DROITE : Recherche + Boutique avec icônes de taille généreuse */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer tap-active ${
                isSearchOpen ? 'bg-[#ff5a50] text-white' : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              aria-label="Recherche"
              title="Rechercher une série"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsShopOpen(true)}
              className="text-slate-300 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative tap-active"
              aria-label="Boutique"
              title="Boutique & Goodies"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff5a50] text-white text-[9px] font-black flex items-center justify-center shadow-lg">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Barre de recherche dépliable tactile */}
        {isSearchOpen && (
          <div className="p-3 bg-[#131422] border-b border-white/10 animate-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une série, un auteur, un genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#1c1e2e] border border-white/15 text-white text-xs pl-9 pr-4 py-3 rounded-2xl focus:outline-none focus:border-[#ff5a50] shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CONTENU PRINCIPAL PAR ONGLET */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto">
          {/* ONGLET 1 : ACCUEIL */}
          {activeTab === 'home' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* ========================================================================= */}
              {/* NOUVELLE BARRE UX PRIMORDIALE : 3 ACTIONS ESSENTIELLES (Lire, Jouer, Coins) */}
              {/* ========================================================================= */}
              <div className="pt-3 px-3.5">
                <div className="grid grid-cols-3 gap-2.5 p-2 bg-[#121422] border border-white/10 rounded-2xl shadow-xl">
                  {/* 1. LIRE LE DERNIER CHAPITRE */}
                  <button
                    onClick={() => {
                      const firstWork = works[0];
                      const chList = chapters.filter((c) => c.workId === firstWork?.id);
                      const targetCh = chList[0] || chapters[0];
                      if (firstWork && targetCh) {
                        openReader(firstWork.id, targetCh.id);
                      } else if (firstWork) {
                        openWorkDetail(firstWork.id);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-b from-[#ff5a50]/20 to-[#ff5a50]/5 border border-[#ff5a50]/40 hover:border-[#ff5a50] text-center transition-all cursor-pointer tap-active group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#ff5a50] text-white flex items-center justify-center shadow-md shadow-[#ff5a50]/30 mb-1.5 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-[11px] font-black text-white leading-tight">Lire</span>
                    <span className="text-[9px] text-[#ff5a50] font-bold">Webtoons</span>
                  </button>

                  {/* 2. JOUER AUX MINI-JEUX ARCADE */}
                  <button
                    onClick={() => {
                      if (games.length > 0) {
                        setPlayingGame(games[0]);
                      } else {
                        setActiveTab('games');
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-b from-purple-500/20 to-purple-500/5 border border-purple-500/40 hover:border-purple-500 text-center transition-all cursor-pointer tap-active group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30 mb-1.5 group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black text-white leading-tight">Jouer</span>
                    <span className="text-[9px] text-purple-300 font-bold">Arcade</span>
                  </button>

                  {/* 3. RECHARGER DES COINS */}
                  <button
                    onClick={() => openCoinShop()}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/40 hover:border-amber-500 text-center transition-all cursor-pointer tap-active group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center shadow-md shadow-amber-500/30 mb-1.5 group-hover:scale-110 transition-transform">
                      <Coins className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-[11px] font-black text-amber-300 leading-tight">Pièces</span>
                    <span className="text-[9px] text-amber-400 font-bold">Wave & CB</span>
                  </button>
                </div>
              </div>

              {/* FILTRES CATÉGORIES / GENRES HORIZONTAUX TACTILES */}
              <div className="px-3.5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {allGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer tap-active ${
                        selectedGenre === genre
                          ? 'bg-[#ff5a50] text-white shadow-md shadow-[#ff5a50]/20'
                          : 'bg-[#181a28] text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {genre === 'all' ? '✨ Tout' : genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARTE HERO GRAND FORMAT ULTRA-POLISHED */}
              <div
                onClick={() => openWorkDetail(featuredWork.id)}
                className="relative mx-3.5 aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 cursor-pointer group tap-active"
              >
                <img
                  src={featuredWork.coverUrl}
                  alt={featuredWork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges en haut à gauche */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#ff5a50] text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    NOUVEAU
                  </span>
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/10">
                    {featuredWork.genres[0] || 'Fantasy'}
                  </span>
                </div>

                {/* Note en haut à droite */}
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1 text-amber-400 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{featuredWork.rating}</span>
                </div>

                {/* Dégradé immersif & Titre */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e15] via-[#0d0e15]/40 to-transparent flex flex-col justify-end p-5">
                  <div className="text-[11px] font-bold text-[#ff5a50] uppercase tracking-wider mb-1">
                    Par {featuredWork.author}
                  </div>
                  <h2 className="text-2xl font-black text-white font-['Outfit'] drop-shadow-md leading-tight mb-3">
                    {featuredWork.title}
                  </h2>

                  {/* Boutons d'action Hero */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const featuredChapters = chapters.filter((c) => c.workId === featuredWork.id);
                        const firstCh = featuredChapters[0] || chapters[0];
                        if (firstCh) {
                          openReader(featuredWork.id, firstCh.id);
                        } else {
                          openWorkDetail(featuredWork.id);
                        }
                      }}
                      className="flex-1 py-3 px-4 bg-[#ff5a50] hover:bg-[#ff463b] text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a50]/30 cursor-pointer tap-active transition-transform"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Lire le Chapitre 1</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(featuredWork.id);
                      }}
                      className={`p-3 rounded-2xl border border-white/15 backdrop-blur-md transition-colors cursor-pointer tap-active ${
                        isBookmarked(featuredWork.id)
                          ? 'bg-[#ff5a50] text-white border-[#ff5a50]'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                      aria-label="Favoris"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked(featuredWork.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BANNIÈRE RECHARGE RAPIDE WAVE MOBILE MONEY */}
              <div className="mx-3.5 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>Pass Fast-Pass Wave</span>
                      <span className="text-[9px] bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        -20%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Débloquez les sorties exclusives</p>
                  </div>
                </div>
                <button
                  onClick={() => openCoinShop()}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-black rounded-xl shadow cursor-pointer tap-active"
                >
                  Boutique
                </button>
              </div>

              {/* SECTION POPULAIRE CETTE SEMAINE (Carrousel Horizontal) */}
              <div className="pl-3.5 space-y-3">
                <div className="flex items-center justify-between pr-3.5">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#ff5a50] fill-[#ff5a50]" />
                    <h3 className="text-base font-black text-white font-['Outfit']">
                      Populaire cette semaine
                    </h3>
                  </div>
                  <span className="text-xs text-[#ff5a50] font-bold cursor-pointer hover:underline">
                    Voir tout
                  </span>
                </div>

                {/* Carrousel */}
                <div className="flex gap-3 overflow-x-auto pb-2 pr-3.5 scrollbar-none snap-x">
                  {popularWorks.map((work, idx) => (
                    <div
                      key={work.id}
                      onClick={() => openWorkDetail(work.id)}
                      className="w-36 shrink-0 bg-[#141624] border border-white/10 rounded-2xl overflow-hidden shadow-md cursor-pointer snap-start tap-active transition-transform"
                    >
                      <div className="relative aspect-[3/4] bg-slate-900 group">
                        <img
                          src={work.coverUrl}
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#ff5a50] text-white text-[8px] font-black uppercase rounded shadow">
                          TOP #{idx + 1}
                        </span>

                        {/* Bouton de lecture rapide */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const workChapters = chapters.filter((c) => c.workId === work.id);
                            const firstCh = workChapters[0] || chapters[0];
                            if (firstCh) {
                              openReader(work.id, firstCh.id);
                            } else {
                              openWorkDetail(work.id);
                            }
                          }}
                          className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#ff5a50] text-white flex items-center justify-center shadow-lg cursor-pointer tap-active"
                          title="Lire le 1er chapitre"
                        >
                          <Play className="w-3 h-3 fill-white ml-0.5" />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-bold text-white truncate">{work.title}</h4>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> {work.rating}
                          </span>
                          <span>{work.genres[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION DERNIÈRES SORTIES (Grille 2 colonnes) */}
              <div className="px-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-black text-white font-['Outfit']">
                      Dernières Sorties
                    </h3>
                  </div>
                  <span className="text-xs text-[#ff5a50] font-bold cursor-pointer hover:underline">
                    {filteredWorks.length} séries
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {filteredWorks.slice(0, 6).map((work) => (
                    <div
                      key={work.id}
                      onClick={() => openWorkDetail(work.id)}
                      className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden shadow-md cursor-pointer tap-active transition-transform"
                    >
                      <div className="aspect-[3/4] bg-slate-900 relative group">
                        <img
                          src={work.coverUrl}
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold rounded-lg border border-white/10">
                          Ch. {work.totalChapters || 12}
                        </span>

                        {/* Bouton de lecture directe 1-clic */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const workChapters = chapters.filter((c) => c.workId === work.id);
                            const firstCh = workChapters[0] || chapters[0];
                            if (firstCh) {
                              openReader(work.id, firstCh.id);
                            } else {
                              openWorkDetail(work.id);
                            }
                          }}
                          className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-[#ff5a50] text-white flex items-center justify-center shadow-lg shadow-[#ff5a50]/40 cursor-pointer tap-active"
                          title="Lire le 1er chapitre"
                        >
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-bold text-white truncate">{work.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {work.genres.join(' • ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : BIBLIOTHÈQUE */}
          {activeTab === 'library' && (
            <div className="p-4">
              <h2 className="text-lg font-black text-white font-['Outfit'] mb-4">
                Ma Bibliothèque
              </h2>
              <UserProfileView initialTab="library" onOpenAuth={() => setIsAuthOpen(true)} />
            </div>
          )}

          {/* ONGLET 3 : JEUX (Game Center) */}
          {activeTab === 'games' && (
            <div className="p-4 space-y-5 animate-in fade-in duration-200">
              
              {/* Header Game Center */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-1.5">
                    <span>🎮 OZI Game Center</span>
                  </h2>
                  <p className="text-xs text-slate-400">Mini-jeux d'arcade basés sur vos webtoons</p>
                </div>
              </div>

              {/* CARTE HERO JEU VEDETTE */}
              {featuredGame && (
                <div
                  onClick={() => setPlayingGame(featuredGame)}
                  className="p-4 rounded-3xl bg-gradient-to-br from-purple-900/40 via-[#16182b] to-[#121422] border border-purple-500/30 shadow-xl cursor-pointer tap-active"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={featuredGame.coverUrl}
                      alt={featuredGame.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-purple-500/40 shadow"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase rounded">
                        ÉVÉNEMENT
                      </span>
                      <h3 className="text-sm font-black text-white truncate mt-0.5">{featuredGame.title}</h3>
                      <p className="text-[10px] text-slate-400">{featuredGame.genre} • +500 Coins à gagner</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow cursor-pointer tap-active flex items-center justify-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Lancer la partie</span>
                  </button>
                </div>
              )}

              {/* Filtres par Catégorie */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Tous les jeux' },
                  { id: 'action', label: 'Action' },
                  { id: 'puzzle', label: 'Puzzle' },
                  { id: 'strategy', label: 'Stratégie' },
                  { id: 'arcade', label: 'Arcade' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setGameCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer tap-active ${
                      gameCategory === cat.id
                        ? 'bg-[#ff5a50] text-white shadow-md'
                        : 'bg-[#181a28] text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grille Catalogue de Jeux */}
              <div className="grid grid-cols-2 gap-3.5">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setPlayingGame(game)}
                    className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden shadow-md cursor-pointer tap-active transition-transform group"
                  >
                    <div className="aspect-square bg-slate-900 relative">
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#ff5a50] flex items-center justify-center text-white shadow-lg">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span className="capitalize">{game.category}</span>
                        <span className="text-amber-400 font-bold">★ {game.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 4 : BLOG / ACTUS & CARNETS */}
          {activeTab === 'blog' && (
            <div className="p-4">
              <ArticlesView />
            </div>
          )}

          {/* ONGLET 5 : PROFIL */}
          {activeTab === 'profile' && (
            <UserProfileView onOpenAuth={() => setIsAuthOpen(true)} />
          )}
        </main>

        {/* ========================================================================= */}
        {/* 3. BARRE D'ONGLETS INFÉRIEURE ULTRA-ERGONOMIQUE */}
        {/* ========================================================================= */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-[#0d0e15]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
          {/* Onglet Accueil */}
          <button
            onClick={() => {
              setActiveTab('home');
              setActiveView('app_catalogue');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer tap-active ${
              activeTab === 'home' ? 'text-[#ff5a50]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">Accueil</span>
            {activeTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a50] shadow-sm shadow-[#ff5a50]" />}
          </button>

          {/* Onglet Bibliothèque */}
          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer tap-active ${
              activeTab === 'library' ? 'text-[#ff5a50]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${activeTab === 'library' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">Bibliothèque</span>
            {activeTab === 'library' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a50] shadow-sm shadow-[#ff5a50]" />}
          </button>

          {/* Onglet Jeux */}
          <button
            onClick={() => setActiveTab('games')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer tap-active ${
              activeTab === 'games' ? 'text-[#ff5a50]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className={`w-5 h-5 ${activeTab === 'games' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">Jeux</span>
            {activeTab === 'games' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a50] shadow-sm shadow-[#ff5a50]" />}
          </button>

          {/* Onglet Blog (Actus & Carnets) */}
          <button
            onClick={() => {
              setActiveTab('blog');
              if (activeView !== 'app_catalogue') {
                setActiveView('app_catalogue');
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer tap-active ${
              activeTab === 'blog' ? 'text-[#ff5a50]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className={`w-5 h-5 ${activeTab === 'blog' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">Actus</span>
            {activeTab === 'blog' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a50] shadow-sm shadow-[#ff5a50]" />}
          </button>

          {/* Onglet Profil */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer tap-active ${
              activeTab === 'profile' ? 'text-[#ff5a50]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">Profil</span>
            {activeTab === 'profile' && <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a50] shadow-sm shadow-[#ff5a50]" />}
          </button>
        </nav>

        {/* Drawer Latéral */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
        />

        {/* Shop Cart Drawer */}
        <ShopDrawer
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleCheckoutCart}
        />

        {/* Modale d'authentification */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        {/* Modale de Boutique OZI Coins (Wave, Orange Money, Carte) */}
        <CoinShopModal />

        {/* Modale de Jeu Jouable */}
        <PlayableGameModal
          game={playingGame}
          isOpen={!!playingGame}
          onClose={() => setPlayingGame(null)}
        />
      </div>
    </div>
  );
};
