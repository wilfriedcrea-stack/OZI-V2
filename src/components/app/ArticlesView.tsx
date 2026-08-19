import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import { Article } from '../../types';
import {
  Newspaper,
  Calendar,
  Clock,
  User,
  Tag,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Share2,
} from 'lucide-react';

export const ArticlesView: React.FC = () => {
  const {
    articles,
    selectedArticleId,
    setSelectedArticleId,
    setActiveView,
    openArticle,
    showToast,
  } = useOzi();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentArticle = articles.find((a) => a.id === selectedArticleId);

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['all', 'Actualité', 'Carnet de création', 'Interview', 'Dossier'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Lien de l’article copié !', 'info');
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4" />
            <span>Magazine OZI • Éditorial & Coulisses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
            Carnets de Création & Actualités
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interviews exclusives d’auteurs, making-of des webtoons et annonces officielles de la plateforme.
          </p>
        </div>

        <button
          onClick={() => setActiveView('app_catalogue')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Catalogue</span>
        </button>
      </div>

      {/* ARTICLE READER DETAIL */}
      {currentArticle ? (
        <article className="space-y-6 max-w-3xl mx-auto">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedArticleId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux articles</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Article Cover */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 shadow-xl">
            <img
              src={currentArticle.coverUrl}
              alt={currentArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-500 text-black text-xs font-black uppercase tracking-wide">
              {currentArticle.category}
            </div>
          </div>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-800 pb-4">
            <span className="flex items-center gap-1.5 text-slate-200">
              <User className="w-4 h-4 text-emerald-400" />
              {currentArticle.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(currentArticle.publishedAt).toLocaleDateString('fr-FR')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              {currentArticle.readTimeMinutes} min de lecture
            </span>
          </div>

          {/* Title & Summary */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug font-['Outfit',sans-serif] mb-4">
              {currentArticle.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              {currentArticle.summary}
            </p>
          </div>

          {/* Body Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4 py-4 whitespace-pre-line">
            {currentArticle.content}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-500" />
            {currentArticle.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>
        </article>
      ) : (
        /* ARTICLES CATALOGUE LIST */
        <div className="space-y-6">
          {/* Categories Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer capitalize ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tous les articles' : cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => openArticle(art.id)}
                className="group bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                  <img
                    src={art.coverUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-black text-emerald-400 uppercase">
                    {art.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(art.publishedAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {art.readTimeMinutes} min
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Par <strong className="text-slate-300">{art.author}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Lire l'article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
