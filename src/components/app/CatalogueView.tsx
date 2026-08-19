import React, { useState, useMemo } from 'react';
import { useOzi } from '../../context/OziContext';
import { WorkType, Genre } from '../../types';
import {
  Search,
  Star,
  Flame,
  Bookmark,
  Layers,
  BookOpen,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

const GENRES: Genre[] = [
  'Action',
  'Romance',
  'Fantasy',
  'Sci-Fi',
  'Thriller',
  'Comédie',
  'Drame',
  'Isekai',
  'Aventure',
  'Mystère',
  'Arts Martiaux',
];

export const CatalogueView: React.FC = () => {
  const {
    works,
    searchQuery,
    setSearchQuery,
    openWorkDetail,
    currentUser,
    toggleBookmark,
  } = useOzi();

  const [selectedType, setSelectedType] = useState<WorkType | 'all'>('all');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent' | 'title'>('popular');

  // Filtered and Sorted Works
  const filteredWorks = useMemo(() => {
    return works
      .filter((w) => {
        // Format filter
        if (selectedType !== 'all' && w.type !== selectedType) return false;
        // Genre filter
        if (selectedGenre !== 'all' && !w.genres.includes(selectedGenre)) return false;
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = w.title.toLowerCase().includes(q);
          const matchAuthor = w.author.toLowerCase().includes(q) || w.artist.toLowerCase().includes(q);
          const matchGenre = w.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchAuthor && !matchGenre) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.views - a.views;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [works, selectedType, selectedGenre, searchQuery, sortBy]);

  const featuredWork = works.find((w) => w.featured) || works[0];

  return (
    <div className="space-y-8 pb-16">
      {/* HERO SPOTLIGHT BANNER (Featured Work) */}
      {!searchQuery && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="relative min-h-[340px] sm:min-h-[400px] flex flex-col justify-end p-6 sm:p-10">
            {/* Background Image with Overlay */}
            <img
              src={featuredWork.bannerUrl || featuredWork.coverUrl}
              alt={featuredWork.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md bg-amber-500 text-black text-[11px] font-black uppercase tracking-wide">
                  À LA UNE • {featuredWork.type}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {featuredWork.rating}
                </span>
                <span className="text-xs text-slate-300">
                  {featuredWork.genres.slice(0, 3).join(' • ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight font-['Outfit',sans-serif]">
                {featuredWork.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl leading-relaxed">
                {featuredWork.synopsis}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openWorkDetail(featuredWork.id)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Commencer la lecture</span>
                </button>

                <button
                  onClick={() => toggleBookmark(featuredWork.id)}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
                  title="Ajouter aux favoris"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      currentUser?.bookmarks.includes(featuredWork.id) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="space-y-4">
        {/* Format Selector Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous les Formats
            </button>
            <button
              onClick={() => setSelectedType('webtoon')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === 'webtoon'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📱 Webtoons (Vertical)
            </button>
            <button
              onClick={() => setSelectedType('manga')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === 'manga'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇯🇵 Mangas (N&B)
            </button>
            <button
              onClick={() => setSelectedType('bd')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === 'bd'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎨 BDs Franco-Belge
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="popular">🔥 Plus populaires</option>
              <option value="rating">⭐ Mieux notés</option>
              <option value="recent">🕒 Dernières sorties</option>
              <option value="title">🔤 Alphabétique</option>
            </select>
          </div>
        </div>

        {/* Genre Tags Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Genre:
          </span>
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedGenre === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous
          </button>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* CATALOGUE GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Catalogue des séries</span>
            <span className="text-xs text-slate-400 font-normal">({filteredWorks.length} résultats)</span>
          </h2>
        </div>

        {filteredWorks.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300 mb-1">Aucune œuvre trouvée</h3>
            <p className="text-xs text-slate-500 mb-4">
              Essayez de réinitialiser vos filtres ou effectuez une autre recherche.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedGenre('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredWorks.map((work) => {
              const isBookmarked = currentUser?.bookmarks.includes(work.id);

              return (
                <div
                  key={work.id}
                  onClick={() => openWorkDetail(work.id)}
                  className="group bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                    <img
                      src={work.coverUrl}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Type Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[10px] font-black text-amber-400 uppercase tracking-wide border border-slate-800">
                      {work.type}
                    </div>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(work.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/70 backdrop-blur-xs text-slate-300 hover:text-amber-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Rating Pill */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[11px] font-bold text-white flex items-center gap-1 border border-slate-800">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{work.rating}</span>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {work.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {work.genres.slice(0, 2).join(' • ')}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-medium text-slate-300">{work.totalChapters} chap.</span>
                      <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Lire <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
