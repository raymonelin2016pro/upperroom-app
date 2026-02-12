import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

// Game Configuration
const MAX_LEVELS = 12;
const LEVEL_CONFIG = [
  { level: 1, cols: 3, rows: 3, sequenceLength: 3, displayTime: 1000 },
  { level: 2, cols: 3, rows: 3, sequenceLength: 4, displayTime: 900 },
  { level: 3, cols: 4, rows: 4, sequenceLength: 4, displayTime: 800 },
  { level: 4, cols: 4, rows: 4, sequenceLength: 5, displayTime: 700 },
  { level: 5, cols: 5, rows: 5, sequenceLength: 5, displayTime: 600 },
  { level: 6, cols: 5, rows: 5, sequenceLength: 6, displayTime: 500 },
  { level: 7, cols: 5, rows: 5, sequenceLength: 7, displayTime: 450 },
  { level: 8, cols: 5, rows: 6, sequenceLength: 7, displayTime: 400 },
  { level: 9, cols: 5, rows: 6, sequenceLength: 8, displayTime: 380 },
  { level: 10, cols: 5, rows: 7, sequenceLength: 8, displayTime: 360 },
  { level: 11, cols: 5, rows: 8, sequenceLength: 9, displayTime: 330 },
  { level: 12, cols: 5, rows: 9, sequenceLength: 10, displayTime: 300 },
];

type GameState = 'idle' | 'showing' | 'input' | 'success' | 'gameover' | 'completed';

interface SequenceItem {
  position: number;
  number: number;
}

export default function MemoryMatch() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [visibleNumber, setVisibleNumber] = useState<number | null>(null);
  
  // To track the current showing index
  const showingIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const currentConfig = LEVEL_CONFIG[level - 1] || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];

  // Start the game or next level
  const startGame = (reset = false) => {
    const startLevel = reset ? 1 : level;
    if (reset) setLevel(1);
    
    setGameState('showing');
    setUserSequence([]);
    generateSequence(startLevel);
  };

  const generateSequence = (currentLevel: number) => {
    const config = LEVEL_CONFIG[currentLevel - 1] || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
    const totalCells = config.cols * config.rows;
    const newSequence: SequenceItem[] = [];
    const usedPositions = new Set<number>();

    while (newSequence.length < config.sequenceLength) {
      const pos = Math.floor(Math.random() * totalCells);
      if (!usedPositions.has(pos)) {
        usedPositions.add(pos);
        newSequence.push({
          position: pos,
          number: newSequence.length + 1
        });
      }
    }
    setSequence(newSequence);
    
    // Start showing sequence
    showingIndexRef.current = 0;
    showNextNumber(newSequence, config.displayTime);
  };

  const showNextNumber = (seq: SequenceItem[], duration: number) => {
    if (showingIndexRef.current >= seq.length) {
      setVisibleNumber(null);
      setGameState('input');
      return;
    }

    const currentItem = seq[showingIndexRef.current];
    setVisibleNumber(currentItem.number);

    timerRef.current = window.setTimeout(() => {
      setVisibleNumber(null);
      // Small pause between numbers
      timerRef.current = window.setTimeout(() => {
        showingIndexRef.current += 1;
        showNextNumber(seq, duration);
      }, 200);
    }, duration);
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCellClick = (index: number) => {
    if (gameState !== 'input') return;

    // Check if clicked cell is the next expected number
    const expectedNumber = userSequence.length + 1;
    const targetItem = sequence.find(item => item.number === expectedNumber);

    if (targetItem && targetItem.position === index) {
      // Correct click
      const newUserSequence = [...userSequence, expectedNumber];
      setUserSequence(newUserSequence);

      // Check if level completed
      if (newUserSequence.length === sequence.length) {
        if (level >= MAX_LEVELS) {
          setGameState('completed');
        } else {
          setGameState('success');
          setTimeout(() => {
            setLevel(l => l + 1);
            startGame(false); 
          }, 1000); 
        }
      }
    } else {
      // Wrong click
      setGameState('gameover');
    }
  };
  
  // Grid styles based on size
  const getGridClass = () => {
    switch (currentConfig.cols) {
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-3';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/games" className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">记忆翻牌</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        
        {/* Info Bar */}
        <div className="mb-8 flex items-center gap-4 bg-white/60 px-6 py-3 rounded-2xl shadow-sm">
          <div className="text-slate-600 font-medium">关卡 <span className="text-indigo-600 text-xl font-bold">{level}</span>/{MAX_LEVELS}</div>
          <div className="w-px h-6 bg-slate-300"></div>
          <div className="text-slate-600 font-medium">
            {gameState === 'showing' && '观察...'}
            {gameState === 'input' && '请按顺序点击'}
            {gameState === 'success' && '正确!'}
            {gameState === 'gameover' && '失败!'}
            {gameState === 'idle' && '准备开始'}
            {gameState === 'completed' && '通关!'}
          </div>
        </div>

        {/* Grid */}
        <div className={`grid ${getGridClass()} gap-3 w-full p-4 bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 relative overflow-hidden`}>
            
            {/* Game Over / Completed Overlay */}
            <AnimatePresence>
              {(gameState === 'idle' || gameState === 'gameover' || gameState === 'completed') && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                >
                  {gameState === 'idle' && (
                    <>
                      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-4xl">🧠</div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">记忆挑战</h2>
                      <p className="text-slate-500 mb-8">按顺序记住闪现的数字位置</p>
                      <button 
                        onClick={() => startGame(true)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Play size={20} /> 开始挑战
                      </button>
                    </>
                  )}

                  {gameState === 'gameover' && (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
                        <RotateCcw size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">挑战失败</h2>
                      <p className="text-slate-500 mb-8">你止步于第 {level} 关</p>
                      <button 
                        onClick={() => startGame(true)}
                        className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
                      >
                        <RotateCcw size={20} /> 重新开始
                      </button>
                    </>
                  )}

                  {gameState === 'completed' && (
                    <>
                      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-500">
                        <Trophy size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">恭喜通关!</h2>
                      <p className="text-slate-500 mb-8">你的记忆力太惊人了</p>
                      <button 
                        onClick={() => startGame(true)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <RotateCcw size={20} /> 再次挑战
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cells */}
            {Array.from({ length: currentConfig.cols * currentConfig.rows }).map((_, i) => {
               // Determine cell state
               const isVisible = gameState === 'showing' && sequence.find(s => s.position === i)?.number === visibleNumber;
               const isCorrectlyClicked = userSequence.some(num => {
                 const item = sequence.find(s => s.number === num);
                 return item?.position === i;
               });
               
               // Find which number belongs to this cell (for revealing after click)
               const cellNumber = sequence.find(s => s.position === i)?.number;
               const showNumber = isVisible || (isCorrectlyClicked && cellNumber);

               return (
                 <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    disabled={gameState !== 'input' || isCorrectlyClicked}
                    className={`
                      relative rounded-xl transition-all duration-200 aspect-square
                      ${isCorrectlyClicked ? 'bg-indigo-500 shadow-inner' : 'bg-white shadow-sm hover:shadow-md active:scale-95'}
                      ${gameState === 'input' ? 'cursor-pointer' : 'cursor-default'}
                    `}
                 >
                    <AnimatePresence>
                      {showNumber && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className={`absolute inset-0 flex items-center justify-center font-bold text-2xl ${isCorrectlyClicked ? 'text-white' : 'text-indigo-600'}`}
                        >
                          {cellNumber}
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </button>
               );
            })}
        </div>
      </div>
    </div>
  );
}
