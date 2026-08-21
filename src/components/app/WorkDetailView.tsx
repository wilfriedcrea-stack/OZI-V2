import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Play,
  Heart,
  MessageSquare,
  ArrowUpDown,
  ShoppingBag,
  Plus,
  ArrowRight,
  Star,
  Check,
  Coins,
  Lock,
  Unlock,
  Zap,
  Music,
} from 'lucide-react';
import { OziLogo } from '../common/OziLogo';
import { CommentsModal } from './CommentsModal';

interface WorkDetailViewProps {
  onOpenShop?: () => void;
  onAddToCart?: (item: { id: string; title: string; price: number; priceFormatted: string; image: string }) => void;
}

export const WorkDetailView: React.FC<WorkDetailViewProps> = ({ onOpenShop, onAddToCart }) => {
  const {
    currentWork,
    chapters,
    setActiveView,
    openReader,
    toggleBookmark,
    isBookmarked,
    showToast,
    openCoinShop,
    isChapterUnlocked,
    currentUser,
  } = useOzi();

  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  if (!currentWork) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Aucune œuvre sélectionnée.</p>
        <button
          onClick={() => setActiveView('app_catalogue')}
          className="mt-4 px-4 py-2 bg-[#ff5a50] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Retour au catalogue
        </button>
      </div>
    );
  }

  const workChapters = chapters.filter((c) => c.workId === currentWork.id);
  const effectiveChapters = workChapters.length > 0 ? workChapters : chapters.slice(0, 3);

  const sortedChapters = [...effectiveChapters].sort((a, b) =>
    sortAscending ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber
  );

  const displayedChapters = showAllChapters ? sortedChapters : sortedChapters.slice(0, 3);

  // Produits officiels de la boutique
  const merchItems = [
    {
      id: 'merch-1',
      title: 'Artbook Officiel Vol. 1',
      subtitle: '200 pages d’illustrations exclusives, concepts arts et interviews des créateurs.',
      price: 39,
      priceFormatted: '39€',
      tag: 'ÉDITION LIMITÉE',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      isHero: true,
    },
    {
      id: 'merch-2',
      title: 'T-Shirt "Hacker"',
      price: 25,
      priceFormatted: '25€',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'merch-3',
      title: 'Mug NGP',
      price: 15,
      priceFormatted: '15€',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'merch-4',
      title: 'Set de Pins Collector',
      price: 18,
      priceFormatted: '18€',
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      isWide: true,
    },
  ];

  const handleAddMerch = (item: (typeof merchItems)[0]) => {
    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        priceFormatted: item.priceFormatted,
        image: item.image,
      });
    }
    setAddedItemIds((prev) => [...prev, item.id]);
    showToast(`"${item.title}" ajouté au panier !`, 'success');
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== item.id));
    }, 2000);
  };

  const handleReadFirstChapter = () => {
    const firstChapter = sortedChapters[0] || chapters[0];
    if (firstChapter) {
      openReader(currentWork.id, firstChapter.id);
    }
  };

  return (
    <div className="w-full bg-[#0d0e15] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200 pb-20">
      {/* 1. TOP NAVBAR DÉTAIL */}
      <header className="sticky top-0 z-40 bg-[#0d0e15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => setActiveView('app_catalogue')}
          className="text-slate-300 hover:text-white p-1 cursor-pointer"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* LOGO OZI OFFICIEL */}
        <OziLogo size="sm" />

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            showToast('Lien copié dans le presse-papier !', 'info');
          }}
          className="text-slate-300 hover:text-white p-1 cursor-pointer"
          aria-label="Partager"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* 2. COUVERTURE IMMERSIVE & TITRE */}
      <div className="relative mx-4 mt-3 aspect-[9/13] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <img
          src={currentWork.bannerUrl || currentWork.coverUrl}
          alt={currentWork.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e15] via-[#0d0e15]/40 to-transparent flex flex-col justify-end p-5">
          <h1 className="text-3xl sm:text-4xl font-black text-white font-almodobar drop-shadow-md leading-none mb-1.5 tracking-wide">
            {currentWork.title}
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            {currentWork.genres.join(' • ')}
          </p>
        </div>
      </div>

      {/* 3. BARRE DE STATISTIQUES */}
      <div className="mx-4 my-4 py-3 border-y border-white/10 grid grid-cols-3 text-center">
        <div>
          <div className="text-sm font-black text-white">
            {currentWork.likes > 1000 ? `${(currentWork.likes / 1000).toFixed(0)}K` : currentWork.likes}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Likes</div>
        </div>
        <div className="border-x border-white/10">
          <div className="text-sm font-black text-white">{currentWork.rating}</div>
          <div className="text-[10px] text-slate-400 font-medium">Note</div>
        </div>
        <div>
          <div className="text-sm font-black text-white">Hebdo</div>
          <div className="text-[10px] text-slate-400 font-medium">Maj</div>
        </div>
      </div>

      {/* 4. BOUTONS D'ACTION (Lire le Ch. 1 & Bookmark) */}
      <div className="px-4 flex items-center gap-3 mb-4">
        <button
          onClick={handleReadFirstChapter}
          className="flex-1 py-3.5 px-5 bg-[#ff5a50] hover:bg-[#ff463b] active:scale-98 transition-all text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a50]/30 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white text-white" />
          <span>LIRE LE CH. 1</span>
        </button>

        <button
          onClick={() => toggleBookmark(currentWork.id)}
          className={`p-3.5 rounded-full border border-white/15 backdrop-blur-md transition-colors cursor-pointer ${
            isBookmarked(currentWork.id)
              ? 'bg-[#ff5a50] text-white border-[#ff5a50]'
              : 'bg-[#181a28] text-white hover:bg-[#222538]'
          }`}
          aria-label="Sauvegarder"
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked(currentWork.id) ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 5. ENCADRÉ SYNOPSIS */}
      <div className="mx-4 p-4 bg-[#141624] border border-white/10 rounded-2xl mb-6">
        <p className={`text-xs text-slate-300 leading-relaxed ${!isSynopsisExpanded ? 'line-clamp-2' : ''}`}>
          {currentWork.synopsis}
        </p>
        <button
          onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
          className="mt-2 text-[11px] font-bold text-[#ff5a50] hover:underline cursor-pointer"
        >
          {isSynopsisExpanded ? 'Réduire ⌃' : 'Lire la suite ⌄'}
        </button>
      </div>

      {/* 6. LISTE DES CHAPITRES */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white font-almodobar tracking-wide">Chapitres & Épisodes</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
              {currentWork.totalChapters || effectiveChapters.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openCoinShop()}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 border border-amber-500/30 rounded-xl text-amber-400 text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{currentUser?.coinsBalance || 0} Coins</span>
            </button>

            <button
              onClick={() => setSortAscending(!sortAscending)}
              className="p-2 bg-[#181a28] hover:bg-[#202336] rounded-xl text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-colors"
              title="Inverser l'ordre"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {displayedChapters.map((chapter) => {
            const isUnlocked = isChapterUnlocked(chapter.id);
            const isFastPass = !chapter.isFree && !isUnlocked;
            const coinPrice = chapter.coinPrice || 5;

            return (
              <div
                key={chapter.id}
                onClick={() => {
                  if (isFastPass) {
                    openCoinShop(chapter);
                  } else {
                    openReader(currentWork.id, chapter.id);
                  }
                }}
                className={`h-[84px] rounded-2xl flex items-center gap-3.5 cursor-pointer active:scale-98 transition-all border overflow-hidden pr-3.5 ${
                  isFastPass
                    ? 'bg-[#181420] hover:bg-[#201a2c] border-amber-500/25'
                    : 'bg-[#141624] hover:bg-[#1c1e30] border-white/10'
                }`}
              >
                {/* Miniature pleine hauteur collée à gauche et de dimensions uniformes */}
                <div
                  className={`w-20 h-full shrink-0 relative bg-slate-900 overflow-hidden ${
                    isFastPass ? 'border-r border-amber-500/30' : 'border-r border-white/5'
                  }`}
                >
                  <img
                    src={chapter.pages?.[0]?.imageUrl || currentWork.coverUrl}
                    alt={chapter.title}
                    className={`w-full h-full object-cover ${isFastPass ? 'filter brightness-75' : ''}`}
                  />
                  {isFastPass && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-amber-400">
                      <Lock className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-black">{coinPrice} 🪙</span>
                    </div>
                  )}
                </div>

                {/* Infos Chapitre */}
                <div className="flex-1 min-w-0 py-2.5 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <h4 className="font-bold text-white truncate">
                      Épisode {chapter.chapterNumber} : {chapter.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {chapter.releaseDate || '24 Oct'}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                    {isFastPass ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                        <Zap className="w-2.5 h-2.5 fill-amber-300" />
                        Fast-Pass • {coinPrice} Coins
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase tracking-wider">
                        <Unlock className="w-2.5 h-2.5" />
                        Gratuit
                      </span>
                    )}

                    {chapter.audioUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-black uppercase tracking-wider">
                        <Music className="w-2.5 h-2.5 text-cyan-300" />
                        OST Boucle
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#ff5a50]" /> {chapter.likesCount || 1200}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" /> 42
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {effectiveChapters.length > 3 && (
          <button
            onClick={() => setShowAllChapters(!showAllChapters)}
            className="w-full mt-3 py-3 bg-[#181a28] hover:bg-[#202336] text-white text-xs font-bold rounded-2xl border border-white/10 transition-colors cursor-pointer"
          >
            {showAllChapters
              ? 'Réduire la liste'
              : `Voir les ${currentWork.totalChapters || effectiveChapters.length} chapitres`}
          </button>
        )}
      </div>

      {/* 7. SECTION BOUTIQUE OFFICIELLE */}
      <div className="px-4 mb-10">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#ff5a50]" />
            <h3 className="text-base font-black text-white font-['Outfit']">Boutique Officielle</h3>
          </div>
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="text-xs font-bold text-[#ff5a50] hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            >
              Ouvrir le panier
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4 pl-0.5">
          Soutenez les créateurs et obtenez des exclusivités livrées chez vous.
        </p>

        {/* Produit Hero Artbook */}
        <div className="rounded-3xl overflow-hidden bg-[#141624] border border-white/10 mb-4 group shadow-xl">
          <div className="aspect-[16/10] relative">
            <img
              src={merchItems[0].image}
              alt={merchItems[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded shadow">
              {merchItems[0].tag}
            </span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1 pr-3">
              <h4 className="text-sm font-black text-white font-['Outfit'] mb-0.5">
                {merchItems[0].title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                {merchItems[0].subtitle}
              </p>
              <div className="text-sm font-black text-[#ff5a50] mt-2">
                {merchItems[0].priceFormatted}
              </div>
            </div>
            <button
              onClick={() => handleAddMerch(merchItems[0])}
              className={`p-3 rounded-2xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                addedItemIds.includes(merchItems[0].id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#ff5a50] text-white hover:bg-[#ff463b]'
              }`}
            >
              {addedItemIds.includes(merchItems[0].id) ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Grille 2 items (T-shirt & Mug) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {merchItems.slice(1, 3).map((item) => (
            <div
              key={item.id}
              className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md"
            >
              <div className="aspect-square bg-slate-900">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-black text-white">{item.priceFormatted}</span>
                  <button
                    onClick={() => handleAddMerch(item)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      addedItemIds.includes(item.id)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-white/20 text-white hover:bg-[#ff5a50] hover:border-[#ff5a50]'
                    }`}
                  >
                    {addedItemIds.includes(item.id) ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Item Large Pins */}
        <div className="bg-[#141624] border border-white/10 rounded-2xl overflow-hidden mb-4 shadow-md">
          <div className="aspect-[21/9] bg-slate-900">
            <img src={merchItems[3].image} alt={merchItems[3].title} className="w-full h-full object-cover" />
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-white">{merchItems[3].title}</h5>
              <span className="text-xs font-black text-[#ff5a50]">{merchItems[3].priceFormatted}</span>
            </div>
            <button
              onClick={() => handleAddMerch(merchItems[3])}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                addedItemIds.includes(merchItems[3].id)
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-white/20 text-white hover:bg-[#ff5a50] hover:border-[#ff5a50]'
              }`}
            >
              {addedItemIds.includes(merchItems[3].id) ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Bouton Voir toute la collection */}
        <button
          onClick={onOpenShop}
          className="w-full py-3.5 bg-[#181a28] hover:bg-[#202336] text-white text-xs font-bold rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow mb-4"
        >
          <ShoppingBag className="w-4 h-4 text-[#ff5a50]" />
          <span>Accéder au panier de la collection</span>
        </button>

        {/* Bouton Voir les Commentaires & Avis de la Série */}
        <button
          onClick={() => setIsCommentsOpen(true)}
          className="w-full py-3.5 bg-[#141624] hover:bg-[#1a1d2e] text-white text-xs font-bold rounded-2xl border border-cyan-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Espace Commentaires & Échanges Lecteurs / Auteur</span>
        </button>
      </div>

      {/* Modale des commentaires */}
      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        workId={currentWork.id}
      />
    </div>
  );
};
