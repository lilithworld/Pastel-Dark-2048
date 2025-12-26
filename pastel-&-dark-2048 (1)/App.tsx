
import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, RefreshCw, Sparkles, RotateCcw, Plus, Cat, PawPrint } from 'lucide-react';
import { Grid, Direction, Theme } from './types';
import { createEmptyGrid, addRandomTile, moveGrid, checkGameOver, hasWon } from './utils/gameLogic';
import Tile from './components/Tile';

interface HistoryState {
  grid: Grid;
  score: number;
}

const App: React.FC = () => {
  // State
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const MAX_HISTORY = 20;

  // Initialize Game
  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setHistory([]);
    setGameOver(false);
    setGameWon(false);
  }, []);

  // On Mount
  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Best Score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  // Handle Move Logic
  const handleMove = useCallback((direction: Direction) => {
    if (gameOver) return;

    const result = moveGrid(grid, direction);

    if (result.moved) {
      // Save current state to history before updating
      setHistory((prev) => {
        const newHistory = [{ grid: grid.map(row => [...row]), score }, ...prev];
        return newHistory.slice(0, MAX_HISTORY);
      });

      const newGridWithTile = addRandomTile(result.grid);
      setGrid(newGridWithTile);
      setScore((prev) => prev + result.score);

      if (hasWon(newGridWithTile) && !gameWon) {
        setGameWon(true);
      }

      if (checkGameOver(newGridWithTile)) {
        setGameOver(true);
      }
    }
  }, [grid, gameOver, gameWon, score]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastState = history[0];
    setGrid(lastState.grid);
    setScore(lastState.score);
    setHistory((prev) => prev.slice(1));
    setGameOver(false);
  }, [history]);

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndo();
        return;
      }

      switch (e.key) {
        case 'ArrowUp': handleMove(Direction.UP); break;
        case 'ArrowDown': handleMove(Direction.DOWN); break;
        case 'ArrowLeft': handleMove(Direction.LEFT); break;
        case 'ArrowRight': handleMove(Direction.RIGHT); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleUndo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 40;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? Direction.RIGHT : Direction.LEFT);
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? Direction.DOWN : Direction.UP);
      }
    }
    setTouchStart(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK));
  };

  const isDark = theme === Theme.DARK;
  
  const containerClass = isDark 
    ? 'bg-[#0a0c12] text-white' 
    : 'bg-gradient-to-br from-[#fff0f3] via-[#fffbeb] to-[#f0fdf4] text-[#4a3728]';
    
  const gridBgClass = isDark 
    ? 'bg-[#1a1d26] border-[#2d3240]' 
    : 'bg-white/80 border-[#ffe4e6] shadow-2xl backdrop-blur-md';
    
  const scoreBoxClass = isDark 
    ? 'bg-[#252936] border border-[#363b4d]' 
    : 'bg-white border-[#ffe4e6] shadow-sm';
    
  const buttonClass = isDark 
    ? 'bg-[#252936] hover:bg-[#31374a] text-white border-[#363b4d] disabled:opacity-30' 
    : 'bg-white hover:bg-[#fff0f3] text-[#ff4d6d] border-[#ffe4e6] shadow-md disabled:opacity-40';

  const primaryButtonClass = isDark
    ? 'bg-gradient-to-r from-[#ff006e] to-[#8338ec] hover:from-[#ff006e] hover:to-[#7209b7] text-white shadow-[0_4px_15px_rgba(255,0,110,0.4)]'
    : 'bg-gradient-to-r from-[#ff4d6d] to-[#ff758f] hover:from-[#ff006e] hover:to-[#ff4d6d] text-white shadow-[0_4px_15px_rgba(255,77,109,0.3)]';

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 font-['Nunito'] ${containerClass}`}>
      
      {/* Header */}
      <div className="w-full max-w-md flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Cat size={42} className={isDark ? "text-[#ff006e] drop-shadow-[0_0_10px_rgba(255,0,110,0.6)]" : "text-[#ff4d6d]"} />
              <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]">MEOW</h1>
            </div>
             <p className={`text-sm mt-1 font-extrabold opacity-90 italic flex items-center gap-1 text-[#ff4d6d]`}>
               <Sparkles size={16} fill="currentColor" className="text-amber-400" /> Merge the kittens!
             </p>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-3">
              <button 
                onClick={toggleTheme}
                className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${buttonClass}`}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={24} className="text-amber-400" /> : <Moon size={24} className="text-[#7209b7]" />}
              </button>
              <button 
                onClick={initGame}
                className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${primaryButtonClass}`}
                aria-label="New Game"
                title="New Game"
              >
                <Plus size={24} strokeWidth={4} />
              </button>
            </div>
            <button 
              onClick={handleUndo}
              disabled={history.length === 0 || gameOver}
              className={`p-2 px-5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all disabled:opacity-20 ${buttonClass}`}
            >
              <RotateCcw size={14} strokeWidth={4} /> Undo Nap
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className={`flex-1 p-3 rounded-3xl flex flex-col items-center justify-center transition-all ${scoreBoxClass}`}>
            <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-0.5 text-[#ff4d6d]`}>
              <PawPrint size={14} fill="currentColor" /> Purrs
            </div>
            <span className="text-3xl font-black leading-none">{score}</span>
          </div>
          <div className={`flex-1 p-3 rounded-3xl flex flex-col items-center justify-center transition-all ${scoreBoxClass}`}>
            <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-0.5 text-amber-500`}>
              <Sparkles size={14} fill="currentColor" /> Top Cat
            </div>
            <span className="text-3xl font-black leading-none">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Game Grid Container */}
      <div className="relative group">
        <div 
          className={`${gridBgClass} p-3 border-4 rounded-[50px] w-[350px] h-[350px] sm:w-[430px] sm:h-[430px] touch-none select-none transition-all duration-500 relative overflow-hidden`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Vibrant Background Paws */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <PawPrint className={`absolute top-[8%] left-[12%] animate-paw-float ${isDark ? 'text-white/10' : 'text-[#ff4d6d]/15'}`} size={54} style={{ animationDelay: '0s' }} />
            <PawPrint className={`absolute bottom-[18%] right-[10%] animate-paw-float ${isDark ? 'text-white/10' : 'text-[#ff006e]/15'}`} size={42} style={{ animationDelay: '2.5s' }} />
            <PawPrint className={`absolute top-[48%] left-[48%] animate-paw-float ${isDark ? 'text-white/10' : 'text-[#8338ec]/20'}`} size={84} style={{ animationDelay: '5s' }} />
          </div>

          <div className="grid grid-cols-4 grid-rows-4 gap-4 h-full w-full relative z-10">
            {grid.map((row, rIndex) => (
              row.map((value, cIndex) => (
                <Tile key={`${rIndex}-${cIndex}`} value={value} theme={theme} />
              ))
            ))}
          </div>
        </div>

        {/* Overlay (Game Over / Won) */}
        {(gameOver || (gameWon && !gameOver)) && (
           <div className={`absolute inset-0 rounded-[50px] flex flex-col items-center justify-center z-20 backdrop-blur-2xl animate-in fade-in zoom-in duration-700 ${isDark ? 'bg-black/85' : 'bg-white/90'}`}>
             <Cat size={96} className="mb-6 text-[#ff006e] animate-bounce" />
             <h2 className={`text-6xl font-black mb-2 tracking-tighter ${isDark ? 'text-white' : 'text-[#ff006e]'}`}>
               {gameOver ? 'Nap Time!' : 'Super Cat!'}
             </h2>
             <p className="mb-10 text-xl opacity-90 font-black text-center px-12 leading-tight">
               {gameOver ? "Don't hiss! You have nine lives. Use a rewind!" : "You've merged the ultimate galaxy kitty!"}
             </p>
             
             <div className="flex flex-col gap-5 w-full px-16">
               <button
                 onClick={initGame}
                 className="w-full py-5 bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-white font-black text-xl rounded-[30px] shadow-2xl hover:scale-105 active:scale-95 transform transition-all flex items-center justify-center gap-4"
               >
                 <RefreshCw size={28} strokeWidth={4} /> {gameOver ? 'Wake Up!' : 'New Prowl'}
               </button>
               
               {gameOver && history.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="w-full py-4 bg-white/15 border-2 border-white/25 text-white font-black rounded-[30px] backdrop-blur-md hover:bg-white/25 transition-all flex items-center justify-center gap-4"
                  >
                    <RotateCcw size={24} strokeWidth={4} /> Rewind
                  </button>
               )}
             </div>
             
             {gameWon && !gameOver && (
                <button 
                  onClick={() => setGameWon(false)}
                  className="mt-10 text-base font-black uppercase tracking-widest text-[#ff006e] hover:text-[#ff4d6d] underline decoration-4 underline-offset-8 transition-colors"
                >
                  Continue Pouncing
                </button>
             )}
           </div>
        )}
      </div>

      {/* Simplified Footer - Keyboard Hint */}
      <div className="mt-12 text-center text-[13px] font-black tracking-[0.2em] opacity-40 max-w-[320px] uppercase text-[#ff4d6d]">
        Arrows to Pounce • Ctrl+Z to Rewind
      </div>

    </div>
  );
};

export default App;
