import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import { Work, Chapter, Game, Article, Genre, WorkType, WorkStatus, ChapterPage } from '../../types';
import {
  Shield,
  Layers,
  BookOpen,
  Users,
  Gamepad2,
  Newspaper,
  Mail,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  AlertTriangle,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { WebtoonChapterEditor } from './WebtoonChapterEditor';

const GENRE_LIST: Genre[] = [
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

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    works,
    chapters,
    users,
    games,
    articles,
    subscribers,
    comments,
    addWork,
    updateWork,
    deleteWork,
    addChapter,
    updateChapter,
    deleteChapter,
    reorderChapterPages,
    toggleUserSuspension,
    deleteUserByAdmin,
    toggleGameStatus,
    updateGame,
    addGame,
    addArticle,
    updateArticle,
    deleteArticle,
    deleteComment,
    unsubscribeNewsletter,
    showToast,
    setActiveView,
  } = useOzi();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'works' | 'chapters' | 'users' | 'games' | 'articles' | 'newsletter' | 'comments'
  >('overview');

  // Work Modal State
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [workForm, setWorkForm] = useState({
    title: '',
    originalTitle: '',
    type: 'webtoon' as WorkType,
    genres: ['Action', 'Fantasy'] as Genre[],
    synopsis: '',
    author: '',
    artist: '',
    coverUrl: '',
    bannerUrl: '',
    rating: 4.8,
    status: 'ongoing' as WorkStatus,
    featured: false,
    releaseYear: 2026,
    totalChapters: 0,
    ageRating: 'Tous publics',
  });

  // Chapter Modal State
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedWorkForChapter, setSelectedWorkForChapter] = useState<string>(works[0]?.id || '');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterPagesInput, setChapterPagesInput] = useState<string>('');
  const [chapterPagesList, setChapterPagesList] = useState<ChapterPage[]>([]);

  // Game Modal State
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [gameForm, setGameForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: 'Arcade' as any,
    developer: '',
    isEnabled: true,
    gameType: 'runner' as any,
    badge: '',
  });

  // Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    category: 'Actualité' as any,
    summary: '',
    content: '',
    author: 'OZI Rédaction',
    coverUrl: '',
    tags: 'Webtoon, Manga, Actualité',
    readTimeMinutes: 3,
  });

  // --- Handlers for Works ---
  const handleOpenAddWork = () => {
    setEditingWork(null);
    setWorkForm({
      title: '',
      originalTitle: '',
      type: 'webtoon',
      genres: ['Action', 'Fantasy'],
      synopsis: '',
      author: '',
      artist: '',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      rating: 4.8,
      status: 'ongoing',
      featured: false,
      releaseYear: 2026,
      totalChapters: 0,
      ageRating: 'Tous publics',
    });
    setIsWorkModalOpen(true);
  };

  const handleOpenEditWork = (w: Work) => {
    setEditingWork(w);
    setWorkForm({
      title: w.title,
      originalTitle: w.originalTitle || '',
      type: w.type,
      genres: w.genres,
      synopsis: w.synopsis,
      author: w.author,
      artist: w.artist,
      coverUrl: w.coverUrl,
      bannerUrl: w.bannerUrl,
      rating: w.rating,
      status: w.status,
      featured: w.featured,
      releaseYear: w.releaseYear,
      totalChapters: w.totalChapters,
      ageRating: w.ageRating,
    });
    setIsWorkModalOpen(true);
  };

  const handleSaveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWork) {
      updateWork(editingWork.id, workForm);
    } else {
      addWork(workForm);
    }
    setIsWorkModalOpen(false);
  };

  // --- Handlers for Chapters ---
  const handleOpenAddChapter = (workId?: string) => {
    const targetWorkId = workId || selectedWorkForChapter || works[0]?.id;
    setSelectedWorkForChapter(targetWorkId);
    const existingWorkChapters = chapters.filter((c) => c.workId === targetWorkId);
    setEditingChapter(null);
    setChapterNumber(existingWorkChapters.length + 1);
    setChapterTitle(`Épisode ${existingWorkChapters.length + 1} : Nouvelle aventure`);
    setChapterPagesList([
      {
        id: `p-${Date.now()}-1`,
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80',
        altText: 'Planche 1',
      },
      {
        id: `p-${Date.now()}-2`,
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
        altText: 'Planche 2',
      },
    ]);
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setSelectedWorkForChapter(ch.workId);
    setChapterNumber(ch.chapterNumber);
    setChapterTitle(ch.title);
    setChapterPagesList(ch.pages);
    setIsChapterModalOpen(true);
  };

  const handleAddBatchPages = () => {
    if (!chapterPagesInput.trim()) return;
    const urls = chapterPagesInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const newPages: ChapterPage[] = urls.map((url, i) => ({
      id: `p-${Date.now()}-${i}`,
      pageNumber: chapterPagesList.length + i + 1,
      imageUrl: url,
      altText: `Planche ${chapterPagesList.length + i + 1}`,
    }));

    setChapterPagesList([...chapterPagesList, ...newPages]);
    setChapterPagesInput('');
    showToast(`${newPages.length} planches ajoutées.`, 'success');
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...chapterPagesList];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPages.length) return;
    const temp = newPages[index];
    newPages[index] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    // update page numbers
    newPages.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });
    setChapterPagesList(newPages);
  };

  const handleRemovePage = (index: number) => {
    const newPages = chapterPagesList.filter((_, i) => i !== index);
    newPages.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });
    setChapterPagesList(newPages);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (chapterPagesList.length === 0) {
      showToast('Veuillez ajouter au moins une planche au chapitre.', 'error');
      return;
    }

    if (editingChapter) {
      updateChapter(editingChapter.id, {
        chapterNumber,
        title: chapterTitle,
        pages: chapterPagesList,
      });
    } else {
      addChapter({
        workId: selectedWorkForChapter,
        chapterNumber,
        title: chapterTitle,
        releaseDate: new Date().toISOString().split('T')[0],
        pages: chapterPagesList,
        isFree: true,
      });
    }
    setIsChapterModalOpen(false);
  };

  // --- Handlers for Articles ---
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArticleForm({
      title: '',
      slug: '',
      category: 'Actualité',
      summary: '',
      content: '',
      author: currentUser?.username || 'OZI Rédaction',
      coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900&auto=format&fit=crop&q=80',
      tags: 'Webtoon, Actualité',
      readTimeMinutes: 3,
    });
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setArticleForm({
      title: art.title,
      slug: art.slug,
      category: art.category,
      summary: art.summary,
      content: art.content,
      author: art.author,
      coverUrl: art.coverUrl,
      tags: art.tags.join(', '),
      readTimeMinutes: art.readTimeMinutes,
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = articleForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const generatedSlug =
      articleForm.slug.trim() ||
      articleForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        ...articleForm,
        slug: generatedSlug,
        tags: tagArray,
      });
    } else {
      addArticle({
        ...articleForm,
        slug: generatedSlug,
        tags: tagArray,
      });
    }
    setIsArticleModalOpen(false);
  };

  // Export Newsletter CSV
  const handleExportCSV = () => {
    const header = 'ID,Email,Date d’inscription,Statut,Source\n';
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.subscribedAt}","${s.status}","${s.source}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ozi_newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé avec succès.', 'success');
  };

  // Flagged comments count
  const flaggedComments = comments.filter((c) => c.isReported);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* TOP ADMIN HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>OZI Back-Office • Espace d'Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
            Panneau de Contrôle & Gestion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestion intégrale des œuvres, chapitres, planches, jeux tiers, modération et abonnés.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('app_catalogue')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Voir l'application publique →
          </button>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vue d'ensemble</span>
        </button>

        <button
          onClick={() => setActiveTab('works')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'works' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Œuvres ({works.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'chapters' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Chapitres & Planches ({chapters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Utilisateurs ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'games' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Jeux Embarqués ({games.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'articles' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>Articles & Carnets ({articles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'newsletter' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Newsletter ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'comments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Modération {flaggedComments.length > 0 && `(${flaggedComments.length})`}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-slate-400 text-xs mb-1">Total Œuvres</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{works.length}</div>
              <div className="text-[10px] text-slate-500 mt-1">Webtoons, Mangas & BDs</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-slate-400 text-xs mb-1">Chapitres publiés</div>
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{chapters.length}</div>
              <div className="text-[10px] text-slate-500 mt-1">Épisodes interactifs</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-slate-400 text-xs mb-1">Lecteurs Inscrits</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{users.length}</div>
              <div className="text-[10px] text-slate-500 mt-1">Comptes actifs</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-slate-400 text-xs mb-1">Abonnés Newsletter</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {subscribers.filter((s) => s.status === 'active').length}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Emails vérifiés</div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Actions Rapides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleOpenAddWork}
                className="p-4 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer flex items-center gap-3"
              >
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Ajouter une Œuvre</div>
                  <div className="text-[10px] text-slate-400">Créer une nouvelle série</div>
                </div>
              </button>

              <button
                onClick={() => handleOpenAddChapter()}
                className="p-4 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer flex items-center gap-3"
              >
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Publier un Chapitre</div>
                  <div className="text-[10px] text-slate-400">Upload de planches par lot</div>
                </div>
              </button>

              <button
                onClick={handleOpenAddArticle}
                className="p-4 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-left transition-colors cursor-pointer flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rédiger un Article</div>
                  <div className="text-[10px] text-slate-400">Carnet de création & news</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTION DES ŒUVRES */}
      {activeTab === 'works' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Catalogue des Œuvres</h2>
              <p className="text-xs text-slate-400">Ajout, modification des métadonnées, synopsis et visuels</p>
            </div>
            <button
              onClick={handleOpenAddWork}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Œuvre</span>
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Couverture & Titre</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Genres</th>
                    <th className="py-3 px-4">Auteur / Artiste</th>
                    <th className="py-3 px-4">Chapitres</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {works.map((work) => (
                    <tr key={work.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={work.coverUrl}
                          alt=""
                          className="w-10 h-12 object-cover rounded-md border border-slate-700 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <span className="font-bold text-white block truncate max-w-[180px]">{work.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{work.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold uppercase text-[10px]">
                          {work.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[160px]">{work.genres.join(', ')}</td>
                      <td className="py-3 px-4">
                        <div>{work.author}</div>
                        <div className="text-[10px] text-slate-500">{work.artist}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">{work.totalChapters}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            work.status === 'ongoing'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {work.status === 'ongoing' ? 'En cours' : 'Terminé'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAddChapter(work.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
                            title="Ajouter un chapitre"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditWork(work)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer l'œuvre "${work.title}" et tous ses chapitres ?`)) {
                                deleteWork(work.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GESTION DES CHAPITRES & PLANCHES */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Gestion des Chapitres</h2>
              <p className="text-xs text-slate-400">Ordonnancement, ajout par lot et modification des planches</p>
            </div>
            <button
              onClick={() => handleOpenAddChapter()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Chapitre</span>
            </button>
          </div>

          {/* Work Filter Selector for Chapters */}
          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Filtrer par œuvre :</span>
            <select
              value={selectedWorkForChapter}
              onChange={(e) => setSelectedWorkForChapter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Toutes les œuvres</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title} ({chapters.filter((c) => c.workId === w.id).length} chapitres)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters
              .filter((c) => !selectedWorkForChapter || c.workId === selectedWorkForChapter)
              .map((ch) => {
                const work = works.find((w) => w.id === ch.workId);

                return (
                  <div
                    key={ch.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="truncate max-w-[180px] font-semibold text-amber-400">
                          {work?.title || 'Œuvre inconnue'}
                        </span>
                        <span className="font-mono text-purple-400 font-bold">Ch. {ch.chapterNumber}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{ch.title}</h4>
                      <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-3">
                        <span>{ch.pages.length} planches</span>
                        <span>•</span>
                        <span>{ch.likesCount} likes</span>
                        <span>•</span>
                        <span>{ch.viewsCount} vues</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500">{ch.releaseDate}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditChapter(ch)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le chapitre ${ch.chapterNumber} ?`)) {
                              deleteChapter(ch.id);
                            }
                          }}
                          className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: GESTION DES UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Gestion des Utilisateurs & Modération des Comptes</h2>
            <p className="text-xs text-slate-400">Consultez les inscrits, suspendez ou réactivez les comptes</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Inscrit le</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img
                        src={u.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <span className="font-bold text-white">{u.username}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isSuspended
                            ? 'bg-red-950 text-red-400 border border-red-500/40'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.isSuspended ? 'Suspendu' : 'Actif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleUserSuspension(u.id)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            u.isSuspended
                              ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-amber-950 text-amber-300 hover:bg-amber-900'
                          }`}
                        >
                          {u.isSuspended ? 'Réactiver' : 'Suspendre'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer définitivement l'utilisateur ${u.username} ?`)) {
                              deleteUserByAdmin(u.id);
                            }
                          }}
                          className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GESTION DES JEUX */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Gestion des Jeux Embarqués (Tiers)</h2>
              <p className="text-xs text-slate-400">Activez, désactivez ou intégrez de nouveaux mini-jeux HTML5</p>
            </div>
            <button
              onClick={() => setIsGameModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Intégrer un Jeu</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {games.map((g) => (
              <div
                key={g.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-4"
              >
                <img
                  src={g.thumbnail}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold uppercase">
                      {g.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{g.playsCount} parties</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{g.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{g.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500">{g.developer}</span>
                    <button
                      onClick={() => toggleGameStatus(g.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        g.isEnabled
                          ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                          : 'bg-red-950 text-red-300 hover:bg-red-900'
                      }`}
                    >
                      {g.isEnabled ? '✅ En ligne' : '⛔ Désactivé'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: GESTION DES ARTICLES & CARNETS */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Articles & Carnets de Création</h2>
              <p className="text-xs text-slate-400">Publiez les interviews, making-of et actualités OZI</p>
            </div>
            <button
              onClick={handleOpenAddArticle}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div
                key={art.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold uppercase">
                      {art.category}
                    </span>
                    <span>{art.publishedAt}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 mt-1">{art.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{art.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">Par {art.author}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditArticle(art)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer l'article "${art.title}" ?`)) {
                          deleteArticle(art.id);
                        }
                      }}
                      className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ABONNÉS NEWSLETTER */}
      {activeTab === 'newsletter' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Liste des Abonnés à la Newsletter</h2>
              <p className="text-xs text-slate-400">Consultez et exportez les coordonnées des abonnés</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exporter en CSV</span>
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Adresse Email</th>
                  <th className="py-3 px-4">Date d'inscription</th>
                  <th className="py-3 px-4">Provenance</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{sub.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(sub.subscribedAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(sub.subscribedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{sub.source}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sub.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sub.status === 'active' ? 'Actif' : 'Désabonné'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sub.status === 'active' && (
                        <button
                          onClick={() => unsubscribeNewsletter(sub.email)}
                          className="px-2 py-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg text-[10px] cursor-pointer"
                        >
                          Désabonner
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: MODÉRATION DES COMMENTAIRES */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Modération des Commentaires & Signalements</h2>
            <p className="text-xs text-slate-400">Examinez les signalements des lecteurs et supprimez les abus</p>
          </div>

          <div className="space-y-3">
            {comments.map((comm) => (
              <div
                key={comm.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  comm.isReported
                    ? 'bg-red-950/30 border-red-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{comm.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{comm.createdAt.slice(0, 10)}</span>
                    {comm.isReported && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-bold uppercase">
                        SIGNALÉ PAR LA COMMUNAUTÉ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200">{comm.text}</p>
                </div>

                <button
                  onClick={() => deleteComment(comm.id)}
                  className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT WORK */}
      {isWorkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingWork ? 'Modifier l’Œuvre' : 'Ajouter une Nouvelle Œuvre'}
              </h3>
              <button onClick={() => setIsWorkModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWork} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Titre principal</label>
                  <input
                    type="text"
                    required
                    value={workForm.title}
                    onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Titre original (optionnel)</label>
                  <input
                    type="text"
                    value={workForm.originalTitle}
                    onChange={(e) => setWorkForm({ ...workForm, originalTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Format de parution</label>
                  <select
                    value={workForm.type}
                    onChange={(e: any) => setWorkForm({ ...workForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="webtoon">Webtoon (Vertical)</option>
                    <option value="manga">Manga (N&B)</option>
                    <option value="bd">Bande Dessinée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Statut</label>
                  <select
                    value={workForm.status}
                    onChange={(e: any) => setWorkForm({ ...workForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ongoing">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="hiatus">En pause</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Classification d'âge</label>
                  <input
                    type="text"
                    value={workForm.ageRating}
                    onChange={(e) => setWorkForm({ ...workForm, ageRating: e.target.value })}
                    placeholder="Tous publics, 12+, 16+"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Auteur / Scénariste</label>
                  <input
                    type="text"
                    required
                    value={workForm.author}
                    onChange={(e) => setWorkForm({ ...workForm, author: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Artiste / Dessinateur</label>
                  <input
                    type="text"
                    required
                    value={workForm.artist}
                    onChange={(e) => setWorkForm({ ...workForm, artist: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">URL de Couverture</label>
                <input
                  type="text"
                  required
                  value={workForm.coverUrl}
                  onChange={(e) => setWorkForm({ ...workForm, coverUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Synopsis complet</label>
                <textarea
                  rows={3}
                  required
                  value={workForm.synopsis}
                  onChange={(e) => setWorkForm({ ...workForm, synopsis: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWorkModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow cursor-pointer"
                >
                  {editingWork ? 'Mettre à jour' : 'Créer l’œuvre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SPECIALIZED WEBTOON CHAPTER SLICES EDITOR */}
      {isChapterModalOpen && (
        <WebtoonChapterEditor
          workId={selectedWorkForChapter || works[0]?.id || 'work-1'}
          chapterToEdit={editingChapter}
          onClose={() => setIsChapterModalOpen(false)}
          onSaved={() => setIsChapterModalOpen(false)}
        />
      )}

      {/* MODAL: ADD / EDIT ARTICLE */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingArticle ? 'Modifier l’Article' : 'Publier un Nouvel Article'}
              </h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Titre de l'article</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Catégorie</label>
                  <select
                    value={articleForm.category}
                    onChange={(e: any) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Actualité">Actualité</option>
                    <option value="Carnet de création">Carnet de création</option>
                    <option value="Interview">Interview</option>
                    <option value="Dossier">Dossier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Auteur</label>
                  <input
                    type="text"
                    required
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Temps de lecture (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={articleForm.readTimeMinutes}
                    onChange={(e) => setArticleForm({ ...articleForm, readTimeMinutes: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">URL de l'image de couverture</label>
                <input
                  type="text"
                  required
                  value={articleForm.coverUrl}
                  onChange={(e) => setArticleForm({ ...articleForm, coverUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Résumé court</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Contenu complet</label>
                <textarea
                  rows={6}
                  required
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  {editingArticle ? 'Enregistrer' : 'Publier l’article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
