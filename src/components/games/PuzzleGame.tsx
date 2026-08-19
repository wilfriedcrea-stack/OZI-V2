import React, { useState, useEffect } from 'react';
import { Grid, RotateCcw, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PuzzleGame: React.FC = () => {
  // 3x3 sliding puzzle (numbers 1 to 8 + empty 0)
  const SOLVED_TILES = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Shuffle solvably
  const shuffleTiles = () => {
    let curr = [...SOLVED_TILES];
    // Perform 80 random valid moves to guarantee solvability
    let emptyIdx = 8;
    for (let i = 0; i < 80; i++) {
      const validNeighbors: number[] = [];
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;

      if (row > 0) validNeighbors.push(emptyIdx - 3); // top
      if (row < 2) validNeighbors.push(emptyIdx + 3); // bottom
      if (col > 0) validNeighbors.push(emptyIdx - 1); // left
      if (col < 2) validNeighbors.push(emptyIdx + 1); // right

      const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      curr[emptyIdx] = curr[randomNeighbor];
      curr[randomNeighbor] = 0;
      emptyIdx = randomNeighbor;
    }

    setTiles(curr);
    setMoves(0);
    setIsSolved(false);
    setTimer(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    shuffleTiles();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !isSolved) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isSolved]);

  const handleTileClick = (idx: number) => {
    if (isSolved) return;
    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;

    // Check adjacency
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIdx] = newTiles[idx];
      newTiles[idx] = 0;
      setTiles(newTiles);
      setMoves((m) => m + 1);

      // Check win
      const checkWin = newTiles.every((val, i) => val === SOLVED_TILES[i]);
      if (checkWin) {
        setIsSolved(true);
        setIsPlaying(false);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Manga Sliding Puzzle</h3>
            <p className="text-xs text-slate-400">Remettez les nombres dans l'ordre 1 à 8</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formatTimer(timer)}</span>
          </div>
          <span className="text-amber-400 font-bold">{moves} coups</span>
          <button
            onClick={shuffleTiles}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Mélanger"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2.5 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
        {tiles.map((val, idx) => {
          if (val === 0) {
            return (
              <div
                key={idx}
                className="aspect-square rounded-lg bg-slate-900/40 border border-dashed border-slate-800 flex items-center justify-center text-slate-700 font-mono text-xs"
              >
                Vide
              </div>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              className="aspect-square rounded-lg bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-indigo-500/40 hover:border-indigo-400 active:scale-95 text-xl font-extrabold text-white flex flex-col items-center justify-center shadow-md transition-all cursor-pointer select-none"
            >
              <span>{val}</span>
              <span className="text-[10px] font-normal text-indigo-300 opacity-80">Case {val}</span>
            </button>
          );
        })}
      </div>

      {/* Solved Banner */}
      {isSolved && (
        <div className="mt-4 p-3.5 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="text-xs text-indigo-200 font-semibold">
              Puzzle résolu en {moves} déplacements !
            </span>
          </div>
          <button
            onClick={shuffleTiles}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
};
