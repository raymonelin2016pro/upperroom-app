import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Zap, RefreshCw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import WeeklyLeaderboard from '../components/WeeklyLeaderboard';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'early_click';

export default function SpeedKing() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const saveScore = async (time: number) => {
    if (!userId) return;
    
    try {
      await supabase.from('game_scores').insert({
        user_id: userId,
        game_id: 'speed_king',
        score: time
      });
      setRefreshLeaderboard(prev => prev + 1);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const getFeedback = (time: number) => {
    if (time <= 50) return "比职业选手还快的反应！🤩";
    if (time <= 200) return "太强了，可以去当职业选手了🥰！";
    if (time <= 500) return "只能说，反应还可以🤦‍♂️！";
    if (time <= 2000) return "只能说，正常人水平🤪";
    return "还的多练，继续加油🤭！";
  };

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
        saveScore(time);
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
            <p className="text-white/80 text-xl mb-8">{reactionTime !== null && getFeedback(reactionTime)}</p>
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
    <>
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
        {/* Top Bar Controls */}
        <div className="absolute top-6 left-6 z-20 flex justify-between w-[calc(100%-3rem)] pointer-events-none">
          {/* Back Button */}
          <Link 
            to="/games" 
            className="pointer-events-auto block p-3 bg-black/20 hover:bg-black/40 rounded-full text-white/80 transition-colors backdrop-blur-md"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>

          {/* Leaderboard Button */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="pointer-events-auto p-3 bg-black/20 hover:bg-black/40 rounded-full text-yellow-400 transition-colors backdrop-blur-md border border-yellow-500/30"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trophy className="w-6 h-6" />
          </button>
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

      {/* Leaderboard Overlay */}
      <WeeklyLeaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
        refreshTrigger={refreshLeaderboard}
      />
    </>
  );
}
