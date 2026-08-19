import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  Gamepad2,
  Play,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Flame,
  Award,
  Users,
  Layers,
} from 'lucide-react';
import { RunnerGame } from '../games/RunnerGame';
import { MemoryGame } from '../games/MemoryGame';
import { QuizGame } from '../games/QuizGame';
import { PuzzleGame } from '../games/PuzzleGame';

export const GamesArcadeView: React.FC = () => {
  const { games, selectedGameId, setSelectedGameId, setActiveView, openGame } = useOzi();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const enabledGames = games.filter((g) => g.isEnabled);
  const currentGame = games.find((g) => g.id === selectedGameId);

  const filteredGames = enabledGames.filter((g) => {
    if (activeCategory !== 'all' && g.category !== activeCategory) return false;
    return true;
  });

  const categories = ['all', 'Arcade', 'Mémoire', 'Quiz', 'Puzzle'];

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>OZI Arcade • Mini-Jeux Tiers Embarqués</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
            Espace Jeux & Défis Communautaires
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Jouez directement dans l'application à des jeux créés par nos studios partenaires.
          </p>
        </div>

        <button
          onClick={() => setActiveView('app_catalogue')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </button>
      </div>

      {/* GAME RUNNER MODAL / SCREEN */}
      {currentGame ? (
        <div className="space-y-6">
          {/* Back to Games List */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedGameId(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Choisir un autre jeu</span>
            </button>

            <div className="text-xs text-slate-400">
              Développé par : <span className="font-semibold text-slate-200">{currentGame.developer}</span>
            </div>
          </div>

          {/* Embedded Game Frame */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
            {currentGame.gameType === 'runner' && <RunnerGame />}
            {currentGame.gameType === 'memory' && <MemoryGame />}
            {currentGame.gameType === 'quiz' && <QuizGame />}
            {currentGame.gameType === 'puzzle' && <PuzzleGame />}
          </div>

          {/* Game Description & Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 max-w-2xl mx-auto flex items-start gap-4">
            <img
              src={currentGame.thumbnail}
              alt={currentGame.title}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{currentGame.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{currentGame.description}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>Catégorie : <strong className="text-slate-200">{currentGame.category}</strong></span>
                <span>•</span>
                <span>Parties jouées : <strong className="text-purple-400 font-mono">{currentGame.playsCount.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GAMES LISTING CATALOGUE */
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer capitalize ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tous les jeux' : cat}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => openGame(game.id)}
                className="group bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer"
              >
                <div className="flex gap-4 items-start mb-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {game.badge && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
                        {game.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-500/30 uppercase">
                        {game.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Par <strong className="text-slate-300">{game.developer}</strong>
                  </span>

                  <button className="px-4 py-2 bg-purple-600 group-hover:bg-purple-500 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lancer la partie</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
