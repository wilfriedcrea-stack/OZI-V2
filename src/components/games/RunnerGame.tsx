import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Award, ShieldAlert, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RunnerGameProps {
  onGameOver?: (score: number) => void;
}

export const RunnerGame: React.FC<RunnerGameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('ozi_game_runner_hs') || '0', 10);
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const requestRef = useRef<number | null>(null);
  const stateRef = useRef({
    playerY: 200,
    playerVy: 0,
    isJumping: false,
    gravity: 0.7,
    groundY: 260,
    obstacles: [] as { x: number; y: number; width: number; height: number; type: 'spike' | 'crystal' }[],
    crystals: [] as { x: number; y: number; size: number; collected: boolean }[],
    speed: 5,
    score: 0,
    frameCount: 0,
  });

  const jump = () => {
    if (gameState === 'idle') {
      startGame();
      return;
    }
    if (gameState === 'playing' && !stateRef.current.isJumping) {
      stateRef.current.playerVy = -13;
      stateRef.current.isJumping = true;
    }
    if (gameState === 'gameover') {
      startGame();
    }
  };

  const startGame = () => {
    stateRef.current = {
      playerY: 200,
      playerVy: 0,
      isJumping: false,
      gravity: 0.7,
      groundY: 260,
      obstacles: [],
      crystals: [],
      speed: 5,
      score: 0,
      frameCount: 0,
    };
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = stateRef.current;
      state.frameCount++;
      state.score += 1;
      setScore(Math.floor(state.score / 10));

      // Gradual speed increase
      if (state.frameCount % 500 === 0 && state.speed < 12) {
        state.speed += 0.5;
      }

      // Physics
      state.playerVy += state.gravity;
      state.playerY += state.playerVy;

      if (state.playerY >= state.groundY - 40) {
        state.playerY = state.groundY - 40;
        state.playerVy = 0;
        state.isJumping = false;
      }

      // Spawn Obstacles
      if (state.frameCount % Math.max(70, Math.floor(130 - state.speed * 5)) === 0) {
        state.obstacles.push({
          x: canvas.width + 20,
          y: state.groundY - 35,
          width: 25,
          height: 35,
          type: 'spike',
        });
      }

      // Spawn Energy Crystals
      if (state.frameCount % 180 === 0) {
        state.crystals.push({
          x: canvas.width + 50,
          y: state.groundY - 70 - Math.random() * 40,
          size: 16,
          collected: false,
        });
      }

      // Move & filter obstacles
      state.obstacles.forEach((obs) => {
        obs.x -= state.speed;
      });
      state.obstacles = state.obstacles.filter((obs) => obs.x > -50);

      // Move crystals
      state.crystals.forEach((c) => {
        c.x -= state.speed;
      });
      state.crystals = state.crystals.filter((c) => c.x > -50 && !c.collected);

      // Collision detection with Obstacles
      const playerBox = {
        x: 60,
        y: state.playerY,
        width: 34,
        height: 38,
      };

      for (const obs of state.obstacles) {
        if (
          playerBox.x + 8 < obs.x + obs.width &&
          playerBox.x + playerBox.width - 8 > obs.x &&
          playerBox.y + 8 < obs.y + obs.height &&
          playerBox.y + playerBox.height > obs.y
        ) {
          // Hit obstacle -> Game Over
          setGameState('gameover');
          const finalScore = Math.floor(state.score / 10);
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('ozi_game_runner_hs', finalScore.toString());
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }
          if (onGameOver) onGameOver(finalScore);
          return;
        }
      }

      // Collect crystals
      for (const c of state.crystals) {
        if (!c.collected) {
          const dist = Math.hypot(playerBox.x + 17 - c.x, playerBox.y + 19 - c.y);
          if (dist < 30) {
            c.collected = true;
            state.score += 200; // bonus
          }
        }
      }

      // Render Frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.7, '#15102a');
      bgGrad.addColorStop(1, '#0c071a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant neon grid / dungeon pillars
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 1;
      for (let i = (state.frameCount * 2) % 50; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(canvas.width - i, 80);
        ctx.lineTo(canvas.width - i, state.groundY);
        ctx.stroke();
      }

      // Ground Line
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, state.groundY, canvas.width, canvas.height - state.groundY);

      // Ground Neon Border
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, state.groundY);
      ctx.lineTo(canvas.width, state.groundY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Player (Shadow Monarch Silhouette with Neon Dagger)
      const px = playerBox.x;
      const py = playerBox.y;

      // Glow aura
      ctx.save();
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 12;

      // Cape / Body
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.roundRect(px, py, playerBox.width, playerBox.height, [8, 8, 2, 2]);
      ctx.fill();

      // Shadow Eyes (Cyan glowing eyes)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 22, py + 10, 6, 4);

      // Energy Blade
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fillRect(px + 28, py + 22, 16, 4);
      ctx.restore();

      // Draw Obstacles (Dark Void Spikes)
      state.obstacles.forEach((obs) => {
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.moveTo(obs.x + 5, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y + 6);
        ctx.lineTo(obs.x + obs.width - 5, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Draw Crystals (Bonus Orbs)
      state.crystals.forEach((c) => {
        if (!c.collected) {
          ctx.save();
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(c.x - 2, c.y - 2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, highScore, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Game Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-t-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-purple-950/60 border border-purple-500/40 rounded-lg text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">Shadow Dash : Donjon Évasion</h4>
            <p className="text-xs text-slate-400">Sautez par-dessus les pièges spectraux</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">RECORD</span>
            <span className="font-bold text-amber-400">{highScore} pts</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">SCORE</span>
            <span className="font-bold text-purple-400 text-base">{score}</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        onClick={jump}
        className="relative w-full max-w-2xl bg-black border-x border-b border-slate-800 rounded-b-xl overflow-hidden cursor-pointer select-none"
      >
        <canvas ref={canvasRef} width={640} height={300} className="w-full h-[300px] block" />

        {/* Idle Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center text-purple-400 mb-4 animate-pulse">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Prêt pour l'évasion ?</h3>
            <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">
              Appuyez sur <kbd className="px-2 py-0.5 bg-slate-800 rounded text-purple-300 font-mono text-xs">Espace</kbd>,{' '}
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-purple-300 font-mono text-xs">↑</kbd> ou cliquez sur l'écran pour
              sauter au-dessus des pièges.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Lancer la partie
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-200">
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-full text-red-400 mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">Fin de l'expédition !</h3>
            <p className="text-sm text-slate-300 mb-4">
              Score atteint : <span className="font-bold text-purple-400 text-base">{score} points</span>
              {score >= highScore && score > 0 && (
                <span className="block text-xs text-amber-400 mt-1 font-semibold">🎉 Nouveau record personnel !</span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Rejouer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
