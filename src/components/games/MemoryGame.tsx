import React, { useState, useEffect } from 'react';
import { RotateCcw, Award, Sparkles, Brain, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryCard {
  id: number;
  icon: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_DATA = [
  { icon: '⚔️', name: 'Épée Runique' },
  { icon: '👑', name: 'Couronne Royale' },
  { icon: '🐉', name: 'Dragon Spectral' },
  { icon: '🔮', name: 'Orbe Magique' },
  { icon: '⚡', name: 'Éclair Divin' },
  { icon: '🗡️', name: 'Katana Plasma' },
  { icon: '🛡️', name: 'Bouclier Sacré' },
  { icon: '📜', name: 'Grimoire Ancien' },
];

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = () => {
    const deck: MemoryCard[] = [];
    const pairs = [...CARD_DATA, ...CARD_DATA];
    // Shuffle
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    shuffled.forEach((item, index) => {
      deck.push({
        id: index,
        icon: item.icon,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && !isGameOver) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver]);

  const handleCardClick = (index: number) => {
    if (!isPlaying || isGameOver) return;
    if (flippedIndices.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    // Flip card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.name === secondCard.name) {
        // Match!
        setTimeout(() => {
          firstCard.isMatched = true;
          secondCard.isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          setMatches((m) => {
            const nextMatch = m + 1;
            if (nextMatch === CARD_DATA.length) {
              setIsGameOver(true);
              setIsPlaying(false);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            }
            return nextMatch;
          });
        }, 500);
      } else {
        // No match -> flip back
        setTimeout(() => {
          firstCard.isFlipped = false;
          secondCard.isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Otaku Memory Match</h3>
            <p className="text-xs text-slate-400">Trouvez les 8 paires d'artefacts manga</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTime(seconds)}</span>
          </div>
          <div className="text-slate-300">
            Coups: <span className="font-bold text-amber-400">{moves}</span>
          </div>
          <button
            onClick={initGame}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Recommencer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 py-2">
        {cards.map((card, idx) => {
          const showFace = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={card.isMatched}
              className={`h-20 sm:h-24 rounded-xl font-bold transition-all duration-300 transform select-none cursor-pointer flex flex-col items-center justify-center relative ${
                card.isMatched
                  ? 'bg-emerald-950/60 border-2 border-emerald-500/60 shadow-md shadow-emerald-500/10 scale-95 opacity-80'
                  : showFace
                  ? 'bg-slate-800 border-2 border-purple-500/80 shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 active:scale-95'
              }`}
            >
              {showFace ? (
                <div className="flex flex-col items-center animate-in zoom-in-75 duration-200">
                  <span className="text-2xl sm:text-3xl mb-1">{card.icon}</span>
                  <span className="text-[10px] font-medium text-slate-300 truncate max-w-[65px]">
                    {card.name}
                  </span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-500 text-sm font-black">
                  ?
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Modal Overlay */}
      {isGameOver && (
        <div className="mt-4 p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Félicitations, mémoire parfaite !</h4>
              <p className="text-xs text-slate-300">
                Terminé en <span className="font-semibold text-emerald-400">{formatTime(seconds)}</span> avec{' '}
                <span className="font-semibold text-amber-400">{moves} coups</span>.
              </p>
            </div>
          </div>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
          >
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
};
