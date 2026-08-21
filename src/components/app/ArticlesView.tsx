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
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';

interface ArticleComment {
  id: string;
  articleId: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  dislikes: number;
  userVoted?: 'like' | 'dislike';
  replies: {
    id: string;
    author: string;
    avatar: string;
    time: string;
    text: string;
    likes: number;
  }[];
}

const INITIAL_ARTICLE_COMMENTS: Record<string, ArticleComment[]> = {
  'art-1': [
    {
      id: 'ac1',
      articleId: 'art-1',
      author: 'Kael_Reader',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
      time: 'il y a 2h',
      text: 'Ces secrets d’écriture sont passionnants ! Le travail sur le système d’énergie magique dans Solaria est d’une cohérence remarquable.',
      likes: 24,
      dislikes: 0,
      replies: [
        {
          id: 'ar1',
          author: 'Lina_Script',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          time: 'il y a 45m',
          text: 'Totalement d’accord ! La structuration en trois actes fonctionne à merveille.',
          likes: 8,
        },
      ],
    },
    {
      id: 'ac2',
      articleId: 'art-1',
      author: 'MangaFan99',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      time: 'il y a 4h',
      text: 'Hâte de lire les prochains carnets ! Est-ce qu’un épisode making-of sur le storyboard est prévu ?',
      likes: 15,
      dislikes: 1,
      replies: [],
    },
  ],
  'art-2': [
    {
      id: 'ac3',
      articleId: 'art-2',
      author: 'DakarWebtoon',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      time: 'il y a 1j',
      text: 'Très fier de voir les créateurs africains mis en valeur sur OZI ! La qualité est au rendez-vous.',
      likes: 42,
      dislikes: 0,
      replies: [],
    },
  ],
};

export const ArticlesView: React.FC = () => {
  const {
    articles,
    selectedArticleId,
    setSelectedArticleId,
    setActiveView,
    openArticle,
    showToast,
    currentUser,
  } = useOzi();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commentsMap, setCommentsMap] = useState<Record<string, ArticleComment[]>>(INITIAL_ARTICLE_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('ozi_guest_commenter_name') || 'Lecteur_Anonyme';
  });
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);

  const currentArticle = articles.find((a) => a.id === selectedArticleId);

  const currentAuthorName = currentUser?.username || guestName;
  const currentAvatarUrl =
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'Carnet') {
      return art.category === 'Carnet' || art.category === 'Carnet de création';
    }
    return art.category === selectedCategory;
  });

  const categories = ['all', 'Actualité', 'Carnet', 'Interview'];

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'Articles';
    return cat;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Lien de l’article copié !', 'info');
    }
  };

  const currentArticleComments = currentArticle
    ? commentsMap[currentArticle.id] || []
    : [];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentArticle) return;

    const newComment: ArticleComment = {
      id: `ac-${Date.now()}`,
      articleId: currentArticle.id,
      author: currentAuthorName,
      avatar: currentAvatarUrl,
      time: "À l'instant",
      text: newCommentText.trim(),
      likes: 0,
      dislikes: 0,
      replies: [],
    };

    setCommentsMap((prev) => ({
      ...prev,
      [currentArticle.id]: [newComment, ...(prev[currentArticle.id] || [])],
    }));

    setNewCommentText('');
    showToast('Votre commentaire a été publié !', 'success');
  };

  const handlePostReply = (commentId: string) => {
    if (!replyText.trim() || !currentArticle) return;

    const newReply = {
      id: `ar-${Date.now()}`,
      author: currentAuthorName,
      avatar: currentAvatarUrl,
      time: "À l'instant",
      text: replyText.trim(),
      likes: 0,
    };

    setCommentsMap((prev) => {
      const currentList = prev[currentArticle.id] || [];
      return {
        ...prev,
        [currentArticle.id]: currentList.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...c.replies, newReply] }
            : c
        ),
      };
    });

    setReplyingToCommentId(null);
    setReplyText('');
    showToast('Votre réponse a été ajoutée !', 'success');
  };

  const handleLikeComment = (commentId: string) => {
    if (!currentArticle) return;

    setCommentsMap((prev) => {
      const currentList = prev[currentArticle.id] || [];
      return {
        ...prev,
        [currentArticle.id]: currentList.map((c) => {
          if (c.id === commentId) {
            const hasLiked = c.userVoted === 'like';
            return {
              ...c,
              likes: hasLiked ? c.likes - 1 : c.likes + 1,
              userVoted: hasLiked ? undefined : 'like',
            };
          }
          return c;
        }),
      };
    });
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4" />
            <span>Magazine OZI • Éditorial & Coulisses</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-almodobar tracking-wide leading-tight">
            Carnets de création<br />et Actualités
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Secret d'écriture de scénarios, interviews exclusives d’auteurs, making-of des webtoons et annonces officielles de la plateforme.
          </p>
        </div>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug font-almodobar tracking-wide mb-4">
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

          {/* ========================================================================= */}
          {/* SECTION COMMENTAIRES DE L'ARTICLE */}
          {/* ========================================================================= */}
          <section className="mt-10 pt-8 border-t border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  Commentaires ({currentArticleComments.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Partagez votre avis sur cet article
              </span>
            </div>

            {/* Formulaire de publication d'un commentaire */}
            <form onSubmit={handlePostComment} className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentAvatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 avatar-round object-cover"
                  />
                  <div className="flex items-center gap-1.5 text-xs">
                    {currentUser ? (
                      <span className="font-bold text-white">{currentUser.username}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Commenter en tant que :</span>
                        {isEditingGuestName ? (
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => {
                              setGuestName(e.target.value);
                              localStorage.setItem('ozi_guest_commenter_name', e.target.value);
                            }}
                            onBlur={() => setIsEditingGuestName(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingGuestName(false)}
                            autoFocus
                            className="bg-slate-950 border border-emerald-500 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded outline-none w-28"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditingGuestName(true)}
                            className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            title="Cliquer pour changer de pseudo"
                          >
                            <span>{guestName}</span>
                            <span className="text-[10px] text-slate-500 font-normal">(modifier)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!currentUser && (
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Sans compte ✓
                  </span>
                )}
              </div>

              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={
                  currentUser
                    ? 'Écrire un commentaire bienveillant sur cet article...'
                    : `Écrire un avis sous le nom ${guestName}...`
                }
                rows={3}
                className="w-full bg-[#0d0e15] border border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-xs p-3 rounded-xl focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {newCommentText.length}/500 caractères
                </span>
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publier</span>
                </button>
              </div>
            </form>

            {/* Liste des commentaires */}
            <div className="space-y-4">
              {currentArticleComments.length === 0 ? (
                <div className="text-center py-8 bg-slate-900/30 rounded-2xl border border-slate-800">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Soyez le premier à commenter cet article !
                  </p>
                </div>
              ) : (
                currentArticleComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3"
                  >
                    {/* Header Commentaire */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-8 h-8 avatar-round object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{comment.author}</div>
                          <div className="text-[10px] text-slate-400">{comment.time}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold transition-colors cursor-pointer ${
                          comment.userVoted === 'like'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white bg-slate-800/60'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likes}</span>
                      </button>
                    </div>

                    {/* Texte du commentaire */}
                    <p className="text-xs text-slate-200 leading-relaxed pl-10">
                      {comment.text}
                    </p>

                    {/* Actions : Répondre */}
                    <div className="pl-10 flex items-center gap-4 text-[11px]">
                      <button
                        onClick={() =>
                          setReplyingToCommentId(
                            replyingToCommentId === comment.id ? null : comment.id
                          )
                        }
                        className="text-emerald-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Répondre</span>
                      </button>
                    </div>

                    {/* Champ de réponse déroulé */}
                    {replyingToCommentId === comment.id && (
                      <div className="ml-10 mt-2 p-3 bg-[#0d0e15] border border-slate-800 rounded-xl space-y-2">
                        <input
                          type="text"
                          placeholder={`Répondre à ${comment.author}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          autoFocus
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToCommentId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1 text-slate-400 hover:text-white text-xs"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostReply(comment.id)}
                            disabled={!replyText.trim()}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Envoyer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Réponses imbriquées */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-10 mt-2 space-y-2.5 border-l-2 border-slate-800 pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <img
                                src={reply.avatar}
                                alt={reply.author}
                                className="w-6 h-6 avatar-round object-cover"
                              />
                              <span className="text-xs font-bold text-white">
                                {reply.author}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {reply.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                              {reply.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
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
                className={`px-3.5 py-1.5 rounded-pill text-xs font-bold transition-colors cursor-pointer capitalize ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {getCategoryLabel(cat)}
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

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug font-almodobar tracking-wide">
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
