import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Shield,
  Heart,
} from 'lucide-react';
import { Game } from '../../types';

interface PlayableGameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayableGameModal: React.FC<PlayableGameModalProps> = ({ game, isOpen, onClose }) => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(1420);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [playerX, setPlayerX] = useState(50); // percentage
  const [health, setHealth] = useState(3);
  const [energy, setEnergy] = useState(100);
  const [multiplier, setMultiplier] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Entities state inside game loop
  const gameDataRef = useRef({
    playerPos: 50,
    obstacles: [] as { x: number; y: number; speed: number; type: 'rock' | 'gem' | 'boost' }[],
    lastSpawn: 0,
    scoreVal: 0,
    healthVal: 3,
  });

  useEffect(() => {
    if (!isOpen) {
      setGameState('start');
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isOpen]);

  const startGame = () => {
    setScore(0);
    setHealth(3);
    setEnergy(100);
    setMultiplier(1);
    setGameState('playing');
    gameDataRef.current = {
      playerPos: 50,
      obstacles: [],
      lastSpawn: Date.now(),
      scoreVal: 0,
      healthVal: 3,
    };
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const loop = (timestamp: number) => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear & draw cyber neon grid road
      ctx.fillStyle = '#0a0c16';
      ctx.fillRect(0, 0, width, height);

      // Grid perspective lines
      ctx.strokeStyle = 'rgba(255, 90, 80, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (x - width / 2) * 0.8, height);
        ctx.stroke();
      }

      // Horizontal speed lines
      const speedOffset = (Date.now() / 4) % 40;
      for (let y = speedOffset; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.stroke();
      }

      // Spawn items/obstacles
      const now = Date.now();
      if (now - gameDataRef.current.lastSpawn > 600) {
        const randType = Math.random() > 0.4 ? 'rock' : Math.random() > 0.5 ? 'gem' : 'boost';
        gameDataRef.current.obstacles.push({
          x: 20 + Math.random() * (width - 40),
          y: -20,
          speed: 4 + Math.random() * 3,
          type: randType,
        });
        gameDataRef.current.lastSpawn = now;
      }

      // Update & render obstacles
      const playerRadius = 18;
      const playerY = height - 50;
      const playerPixelX = (gameDataRef.current.playerPos / 100) * width;

      for (let i = gameDataRef.current.obstacles.length - 1; i >= 0; i--) {
        const obs = gameDataRef.current.obstacles[i];
        obs.y += obs.speed;

        // Collision check
        const dist = Math.hypot(obs.x - playerPixelX, obs.y - playerY);
        if (dist < playerRadius + 14) {
          if (obs.type === 'rock') {
            gameDataRef.current.healthVal -= 1;
            setHealth(gameDataRef.current.healthVal);
            if (gameDataRef.current.healthVal <= 0) {
              setGameState('gameover');
              if (gameDataRef.current.scoreVal > highScore) {
                setHighScore(gameDataRef.current.scoreVal);
              }
              isRunning = false;
              return;
            }
          } else if (obs.type === 'gem') {
            gameDataRef.current.scoreVal += 150;
            setScore(gameDataRef.current.scoreVal);
          } else if (obs.type === 'boost') {
            gameDataRef.current.scoreVal += 300;
            setScore(gameDataRef.current.scoreVal);
          }
          gameDataRef.current.obstacles.splice(i, 1);
          continue;
        }

        // Draw obstacle
        if (obs.type === 'rock') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 12, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'gem') {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#eab308';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 11, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Remove off-screen
        if (obs.y > height + 30) {
          gameDataRef.current.obstacles.splice(i, 1);
          gameDataRef.current.scoreVal += 10;
          setScore(gameDataRef.current.scoreVal);
        }
      }

      // Draw Player Ship / Cyber Drifter
      ctx.shadowColor = '#ff5a50';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff5a50';
      ctx.beginPath();
      ctx.moveTo(playerPixelX, playerY - 18);
      ctx.lineTo(playerPixelX - 16, playerY + 16);
      ctx.lineTo(playerPixelX + 16, playerY + 16);
      ctx.closePath();
      ctx.fill();

      // Cockpit Glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playerPixelX, playerY + 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, highScore]);

  // Touch / mouse steer
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const percent = Math.min(90, Math.max(10, (touchX / rect.width) * 100));
    setPlayerX(percent);
    gameDataRef.current.playerPos = percent;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = Math.min(90, Math.max(10, (mouseX / rect.width) * 100));
    setPlayerX(percent);
    gameDataRef.current.playerPos = percent;
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#10121d] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Top Header */}
        <div className="p-3.5 bg-[#171928] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a50] animate-pulse" />
            <h3 className="text-xs font-black text-white font-['Outfit'] truncate max-w-[200px]">
              {game.title} (Arcade Live)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game Screen Canvas */}
        <div
          className="relative w-full aspect-[3/4] bg-black overflow-hidden select-none cursor-crosshair"
          onTouchMove={handleTouchMove}
          onMouseMove={handleMouseMove}
        >
          <canvas
            ref={canvasRef}
            width={340}
            height={450}
            className="w-full h-full object-cover block"
          />

          {/* HUD Overlay when Playing */}
          {gameState === 'playing' && (
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full font-black text-white font-mono">
                {score} PTS
              </div>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < health ? 'text-[#ff5a50] fill-[#ff5a50]' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Start Screen */}
          {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
              <img
                src={game.bannerUrl || game.coverUrl}
                alt={game.title}
                className="w-24 h-24 rounded-2xl object-cover border border-white/20 mb-3 shadow-lg shadow-[#ff5a50]/20"
              />
              <h2 className="text-lg font-black text-white font-['Outfit'] mb-1">
                {game.title}
              </h2>
              <p className="text-xs text-slate-300 mb-4 max-w-[220px]">
                Glissez votre doigt ou la souris pour esquiver les obstacles rouges et ramasser les orbes néon !
              </p>
              <button
                onClick={startGame}
                className="py-3 px-8 bg-[#ff5a50] hover:bg-[#ff463b] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#ff5a50]/40 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Lancer la partie</span>
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white font-['Outfit'] mb-1">
                Partie Terminée !
              </h2>
              <div className="text-2xl font-black text-[#ff5a50] font-mono my-2">
                {score} <span className="text-xs text-slate-400 font-sans">points</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-5">
                Meilleur score : <span className="text-white font-bold">{highScore} pts</span>
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={startGame}
                  className="flex-1 py-2.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Rejouer</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Quitter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls hint */}
        <div className="p-2.5 bg-[#171928] border-t border-white/10 text-center text-[10px] text-slate-400">
          Commandes : Glisser latéralement pour diriger le vaisseau
        </div>
      </div>
    </div>
  );
};
