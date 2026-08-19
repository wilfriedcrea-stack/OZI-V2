import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  ArrowLeft,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Send,
  Star,
  Flame,
} from 'lucide-react';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addToast } = useOzi();
  const [sortMode, setSortMode] = useState<'popular' | 'recent'>('popular');
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Données conformes à la maquette "OZI - Commentaires (Refonte UX).png"
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Kael_Reader',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
      time: 'il y a 2h',
      isTop: true,
      text: "Le dernier chapitre est incroyable ! L'évolution du personnage principal est tellement bien écrite. Vivement la semaine prochaine ! 🔥",
      likes: 342,
      dislikes: 4,
      replies: [
        {
          id: 'r1',
          author: 'Luna_Eclipse',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          time: 'il y a 45m',
          text: "Totalement d'accord ! J'espère qu'ils vont explorer davantage son passé.",
          likes: 12,
        },
      ],
    },
    {
      id: 'c2',
      author: 'Neo_Samurai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      time: 'il y a 3h',
      isTop: false,
      text: "Les dessins de ce chapitre sont un peu en dessous des précédents, mais l'histoire reste captivante.",
      likes: 89,
      dislikes: 2,
      replies: [],
    },
    {
      id: 'c3',
      author: 'Anonyme_99',
      avatar: '',
      time: 'il y a 5h',
      isTop: false,
      text: 'Wow. Juste wow.',
      likes: 45,
      dislikes: 0,
      replies: [],
    },
  ]);

  if (!isOpen) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    id: `r-${Date.now()}`,
                    author: currentUser?.username || 'Moi',
                    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                    time: "À l'instant",
                    text: commentInput,
                    likes: 0,
                  },
                ],
              }
            : c
        )
      );
      setReplyingTo(null);
    } else {
      const newComment = {
        id: `c-${Date.now()}`,
        author: currentUser?.username || 'Lecteur_OZI',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        time: "À l'instant",
        isTop: false,
        text: commentInput,
        likes: 0,
        dislikes: 0,
        replies: [],
      };
      setComments([newComment, ...comments]);
    }

    setCommentInput('');
    addToast('Commentaire publié !', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e15] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-bottom duration-200">
      
      {/* 1. HEADER COMMENTAIRES */}
      <header className="sticky top-0 z-10 bg-[#0d0e15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white p-1"
          aria-label="Retour"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-white font-['Outfit']">Commentaires</h2>
          <p className="text-[10px] text-slate-400">1.2k avis</p>
        </div>

        <div className="w-8"></div>
      </header>

      {/* 2. BARRE DE TRI (Populaires / Plus récents) */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#12131f]/50">
        <span className="text-xs text-slate-400 font-semibold">Trier par</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortMode('popular')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              sortMode === 'popular'
                ? 'bg-[#1e2032] text-white border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Populaires
          </button>
          <button
            onClick={() => setSortMode('recent')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              sortMode === 'recent'
                ? 'bg-[#1e2032] text-white border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Plus récents
          </button>
        </div>
      </div>

      {/* 3. LISTE DES COMMENTAIRES */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-4 rounded-2xl bg-[#141624] border relative ${
              comment.isTop ? 'border-[#ff5a50]/40' : 'border-white/10'
            }`}
          >
            {/* Badge TOP */}
            {comment.isTop && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#ff5a50] text-white text-[9px] font-black uppercase rounded-full flex items-center gap-0.5 shadow">
                <Star className="w-2.5 h-2.5 fill-white" /> Top
              </span>
            )}

            {/* Header Commentaire */}
            <div className="flex items-start gap-3 mb-2.5">
              {comment.avatar ? (
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-9 h-9 rounded-full object-cover border border-white/15"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center font-bold text-xs text-slate-300">
                  {comment.author.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{comment.author}</h4>
                  {!comment.isTop && (
                    <button className="text-slate-400 hover:text-white p-0.5">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">{comment.time}</span>
              </div>
            </div>

            {/* Texte */}
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              {comment.text}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                onClick={() => {
                  setComments(
                    comments.map((c) =>
                      c.id === comment.id ? { ...c, likes: c.likes + 1 } : c
                    )
                  );
                }}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{comment.likes}</span>
              </button>

              <button
                onClick={() => {
                  setComments(
                    comments.map((c) =>
                      c.id === comment.id ? { ...c, dislikes: c.dislikes + 1 } : c
                    )
                  );
                }}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{comment.dislikes}</span>
              </button>

              <button
                onClick={() => {
                  setReplyingTo(comment.id);
                  setCommentInput(`@${comment.author} `);
                }}
                className="ml-auto text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Répondre
              </button>
            </div>

            {/* Réponses Imbriquées */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-white/5 pl-4 relative">
                {/* Ligne verticale de hiérarchie */}
                <div className="absolute left-1.5 top-3.5 bottom-2 w-0.5 bg-white/10 rounded-full"></div>

                {comment.replies.map((reply) => (
                  <div key={reply.id} className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <img
                        src={reply.avatar}
                        alt={reply.author}
                        className="w-7 h-7 rounded-full object-cover border border-white/15"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[11px] font-bold text-white">{reply.author}</h5>
                          <span className="text-[9px] text-slate-400">{reply.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                          {reply.text}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                          <button className="flex items-center gap-1 hover:text-white cursor-pointer">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{reply.likes}</span>
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(comment.id);
                              setCommentInput(`@${reply.author} `);
                            }}
                            className="text-[10px] font-semibold text-slate-300 hover:text-white cursor-pointer"
                          >
                            Répondre
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. BARRE DE SAISIE FIXÉE AU BAS */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#12131f]/95 backdrop-blur-md px-4 py-3 border-t border-white/10 max-w-md mx-auto">
        {replyingTo && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-2">
            <span>En réponse à un commentaire...</span>
            <button
              onClick={() => {
                setReplyingTo(null);
                setCommentInput('');
              }}
              className="text-[#ff5a50] font-bold"
            >
              Annuler
            </button>
          </div>
        )}
        <form onSubmit={handleSendComment} className="flex items-center gap-2.5">
          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
            }
            alt="Mon Profil"
            className="w-8 h-8 rounded-full object-cover border border-[#ff5a50]"
          />
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full bg-[#1c1e2e] border border-white/10 text-white text-xs pl-4 pr-10 py-2.5 rounded-full focus:outline-none focus:border-[#ff5a50]"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="absolute right-1.5 w-7 h-7 bg-[#ff5a50] disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-white ml-0.5" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
