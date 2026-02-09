import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Zap, RefreshCw, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'early_click';

export default function SpeedKing() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    
    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2000-5000ms
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
    }, randomDelay);
  };

  const handleInteraction = () => {
    switch (gameState) {
      case 'idle':
        startGame();
        break;
        
      case 'waiting':
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setGameState('early_click');
        break;
        
      case 'ready':
        const endTime = performance.now();
        const time = Math.floor(endTime - startTimeRef.current);
        setReactionTime(time);
        setGameState('result');
        break;
        
      case 'result':
      case 'early_click':
        startGame(); // Direct restart
        break;
    }
  };

  // Background color based on state
  const getBackgroundColor = () => {
    switch (gameState) {
      case 'idle': return 'bg-slate-900';
      case 'waiting': return 'bg-slate-900'; // Keep dark while waiting
      case 'ready': return 'bg-[#00d26a]'; // Vivid Green
      case 'result': return 'bg-[#2d7ff9]'; // Vivid Blue
      case 'early_click': return 'bg-[#f8312f]'; // Vivid Red
      default: return 'bg-slate-900';
    }
  };

  const getTextContent = () => {
    switch (gameState) {
      case 'idle':
        return (
          <div className="text-center animate-pulse">
            <Zap className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">手速王</h1>
            <p className="text-slate-300 text-lg">点击屏幕开始挑战</p>
          </div>
        );
      case 'waiting':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">...</div>
            <p className="text-slate-400 text-xl font-medium tracking-widest">等待变绿...</p>
          </div>
        );
      case 'ready':
        return (
          <div className="text-center transform scale-110 transition-transform duration-75">
            <h1 className="text-6xl font-black text-white tracking-widest uppercase">点!</h1>
          </div>
        );
      case 'result':
        return (
          <div className="text-center">
            <div className="text-8xl font-black text-white mb-2 font-mono">
              {reactionTime}<span className="text-4xl">ms</span>
            </div>
            <p className="text-white/80 text-xl mb-8">反应不错！</p>
            <div className="flex items-center justify-center gap-2 text-white/90 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm mx-auto w-fit">
              <RefreshCw className="w-5 h-5" />
              <span>点击屏幕再试一次</span>
            </div>
          </div>
        );
      case 'early_click':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">太快了!</h1>
            <p className="text-white/80 text-lg mb-8">还没变绿呢，别着急</p>
             <div className="flex items-center justify-center gap-2 text-white/90 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm mx-auto w-fit">
              <RefreshCw className="w-5 h-5" />
              <span>点击重试</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`
        relative w-full h-screen 
        ${getBackgroundColor()} 
        transition-colors duration-200 ease-out
        flex flex-col items-center justify-center
        cursor-pointer select-none overflow-hidden
        touch-none
      `}
      onPointerDown={(e) => {
        // Only handle primary button (left click) or touch contact
        if (e.button !== 0) return;
        e.preventDefault();
        handleInteraction();
      }}
    >
      {/* Back Button - Positioned absolutely and z-indexed above the click area if needed, 
          but actually we want the whole screen clickable. 
          We'll make the back button stop propagation so it doesn't trigger game logic.
      */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/games" 
          className="block p-3 bg-black/20 hover:bg-black/40 rounded-full text-white/80 transition-colors backdrop-blur-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="pointer-events-none z-10 px-6 w-full max-w-md">
        {getTextContent()}
      </div>

      {/* Decorative Background Elements (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
      </div>
    </div>
  );
}
