import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUESTIONS = [
  "最喜欢的水果是什么？",
  "分享一个你最糗的经历。",
  "分享一个你最感恩的时刻。",
  "你期待的另一半是什么样的？",
  "你最喜欢的运动是什么？",
  "如果你能拥有超能力，你会选择什么？",
  "最近一次让你开怀大笑的事情是什么？",
  "你最想去旅游的地方是哪里？",
  "分享一部你最喜欢的电影。",
  "你童年最难忘的回忆是什么？"
];

interface Card {
  id: number;
  question: string;
  isFlipped: boolean;
}

export default function Icebreaker() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    initializeCards();
  }, []);

  const initializeCards = () => {
    const newCards = QUESTIONS.map((q, index) => ({
      id: index,
      question: q,
      isFlipped: false
    }));
    // Shuffle the cards initially
    setCards(shuffleArray(newCards));
  };

  const shuffleArray = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardClick = (id: number) => {
    if (isShuffling) return;
    
    setCards(prev => prev.map(card => {
      if (card.id === id && !card.isFlipped) {
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        return { ...card, isFlipped: true };
      }
      return card;
    }));
  };

  const handleReset = () => {
    setIsShuffling(true);
    // First flip all back
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
    
    // Then shuffle after a short delay for animation
    setTimeout(() => {
      setCards(prev => shuffleArray(prev));
      setIsShuffling(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <header className="mb-6 flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-2">
        <div className="flex items-center gap-2">
            <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">破冰抽卡</h1>
        </div>
        <button
          onClick={handleReset}
          disabled={isShuffling}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
          <span>洗牌</span>
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {cards.map((card) => (
          <div key={card.id} className="h-48 perspective-1000">
            <motion.div
              className="relative w-full h-full transform-style-3d cursor-pointer"
              initial={false}
              animate={{ rotateY: card.isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Front (Cover) */}
              <div 
                className="absolute w-full h-full backface-hidden rounded-2xl shadow-lg flex items-center justify-center p-4"
                style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'rotateY(0deg)'
                }}
              >
                <div className="border-2 border-white/30 rounded-xl w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-white/80">?</span>
                </div>
              </div>

              {/* Back (Content) */}
              <div 
                className="absolute w-full h-full backface-hidden rounded-2xl shadow-lg bg-white p-6 flex items-center justify-center text-center border border-gray-100"
                style={{ 
                    transform: 'rotateY(180deg)'
                }}
              >
                <p className="text-lg font-medium text-gray-800 leading-relaxed">
                    {card.question}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      <style>{`
        .perspective-1000 {
            perspective: 1000px;
        }
        .transform-style-3d {
            transform-style: preserve-3d;
        }
        .backface-hidden {
            backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
