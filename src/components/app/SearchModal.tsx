import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOzi } from '../../context/OziContext';
import { Work, Genre, WorkType } from '../../types';
import {
  Search,
  X,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Star,
  BookOpen,
  Eye,
  Clock,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_GENRES: Genre[] = [
  'Action',
  'Romance',
  'Fantasy',
  'Sci-Fi',
  'Thriller',
  'Isekai',
  'Aventure',
  'Arts Martiaux',
];

const RECENT_SEARCHES_KEY = 'ozi_recent_searches';

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { works, openWorkDetail } = useOzi();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      setSearchTerm('');
      setSelectedGenre('all');
    }
  }, [isOpen]);

  // Sauvegarder une recherche dans l'historique
  const handleSaveSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Filtrage des œuvres en temps réel
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() && selectedGenre === 'all') return [];

    const q = searchTerm.toLowerCase().trim();
    return works.filter((w) => {
      if (selectedGenre !== 'all' && !w.genres.includes(selectedGenre)) {
        return false;
      }
      if (!q) return true;

      const matchTitle = w.title.toLowerCase().includes(q);
      const matchAuthor = w.author.toLowerCase().includes(q) || (w.artist && w.artist.toLowerCase().includes(q));
      const matchGenre = w.genres.some((g) => g.toLowerCase().includes(q));
      const matchSynopsis = w.synopsis.toLowerCase().includes(q);

      return matchTitle || matchAuthor || matchGenre || matchSynopsis;
    });
  }, [works, searchTerm, selectedGenre]);

  // Tendances et recommandations
  const trendingWorks = useMemo(() => {
    return [...works].sort((a, b) => b.views - a.views).slice(0, 4);
  }, [works]);

  const handleSelectWork = (work: Work) => {
    if (searchTerm.trim()) {
      handleSaveSearch(searchTerm.trim());
    }
    openWorkDetail(work.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07080c]/98 backdrop-blur-xl animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100 selection:bg-[#ff5a50] selection:text-white">
      {/* 1. TOP HEADER DE RECHERCHE */}
      <div className="w-full max-w-md mx-auto px-4 pt-4 pb-3 border-b border-white/10 safe-header">
        <div className="flex items-center gap-2.5">
          {/* Bouton Retour (Flèche arrière à gauche) */}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-all shrink-0 cursor-pointer tap-active"
            aria-label="Retour"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Barre de recherche avec loupe */}
          <div className="relative flex-1 flex items-center bg-[#131522] border border-white/15 focus-within:border-[#ff5a50] focus-within:shadow-[0_0_20px_rgba(255,90,80,0.25)] rounded-full transition-all">
            <Search className="w-5 h-5 text-[#ff5a50] ml-3.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  handleSaveSearch(searchTerm);
                }
              }}
              placeholder="Rechercher un titre, auteur, genre..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-2 mr-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tags de genres rapides */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1 -mx-4 px-4">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer tap-active ${
              selectedGenre === 'all'
                ? 'bg-[#ff5a50] text-white shadow-md shadow-[#ff5a50]/20'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            Tous les genres
          </button>
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? 'all' : genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer tap-active ${
                selectedGenre === genre
                  ? 'bg-[#ff5a50] text-white shadow-md shadow-[#ff5a50]/20'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CORPS DU RÉSULTAT / SUGGESTIONS */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto px-4 py-4 space-y-6 pb-20 no-scrollbar">
        {/* CAS A : Des termes de recherche ou un genre sont sélectionnés */}
        {searchTerm.trim() || selectedGenre !== 'all' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {searchResults.length} Résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
              </span>
              {searchTerm && (
                <span className="text-xs text-[#ff5a50] font-mono">
                  "{searchTerm}"
                </span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#10121d] border border-white/5 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Aucun titre correspondant</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Vérifiez l'orthographe ou essayez un mot-clé plus court ou un autre genre.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGenre('all');
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-full transition-all cursor-pointer tap-active"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {searchResults.map((work) => (
                  <div
                    key={work.id}
                    onClick={() => handleSelectWork(work)}
                    className="flex items-center gap-3.5 p-2.5 bg-[#10121d] hover:bg-[#151726] border border-white/5 hover:border-[#ff5a50]/40 rounded-2xl transition-all cursor-pointer tap-active group"
                  >
                    {/* Miniature */}
                    <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 bg-slate-800 shadow-md relative">
                      <img
                        src={work.coverUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-black text-amber-400">
                        {work.type === 'webtoon' ? 'WEB' : 'MANGA'}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#ff5a50] transition-colors">
                        {work.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        Par {work.author}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {work.rating}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">
                          {work.chaptersCount || work.chapters?.length || 0} ch.
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 truncate">
                          {work.genres.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CAS B : ÉTAT INITIAL (Historique + Tendances) */
          <>
            {/* Historique des recherches récentes */}
            {recentSearches.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Recherches récentes
                  </span>
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Effacer
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchTerm(item)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer tap-active"
                    >
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Titres Populaires & Tendances du moment */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Titres populaires du moment
                </span>
                <span className="text-[11px] text-slate-500">Les plus lus</span>
              </div>

              <div className="space-y-2.5">
                {trendingWorks.map((work, index) => (
                  <div
                    key={work.id}
                    onClick={() => handleSelectWork(work)}
                    className="flex items-center gap-3.5 p-2.5 bg-[#10121d] hover:bg-[#151726] border border-white/5 hover:border-amber-500/40 rounded-2xl transition-all cursor-pointer tap-active group"
                  >
                    {/* Numéro Top */}
                    <span className="w-5 text-center text-sm font-black text-amber-400/80 font-mono">
                      #{index + 1}
                    </span>

                    {/* Miniature */}
                    <div className="w-14 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-800 shadow-md">
                      <img
                        src={work.coverUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                        {work.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {work.genres.slice(0, 3).join(' • ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {work.rating}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-3 h-3" />
                          {work.views.toLocaleString()} vues
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#ff5a50] flex items-center justify-center text-slate-400 group-hover:text-white transition-all shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
