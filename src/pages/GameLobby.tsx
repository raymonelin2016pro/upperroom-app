import { ArrowLeft, Sparkles, Zap, Brain, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Game {
  id: string;
  name: string;
  desc: string;
  icon: any;
  path: string;
  gradient: string;
  active: boolean;
  shadowColor: string;
}

export default function GameLobby() {
  const navigate = useNavigate();

  const games: Game[] = [
    {
      id: 'icebreaker',
      name: '破冰抽卡',
      desc: '打破尴尬的趣味问答',
      icon: Sparkles,
      path: '/icebreaker',
      gradient: 'from-[#6a11cb] to-[#2575fc]', // Deep purple to blue
      active: true,
      shadowColor: 'shadow-blue-500/30'
    },
    {
      id: 'speed',
      name: '手速王',
      desc: '挑战你的反应极限',
      icon: Zap,
      path: '/speed-king',
      gradient: 'from-[#f83600] to-[#f9d423]', // Orange to yellow
      active: true,
      shadowColor: 'shadow-orange-500/30'
    },
    {
      id: 'memory',
      name: '记忆翻牌',
      desc: '锻炼大脑的翻牌挑战',
      icon: Brain,
      path: '/memory-match',
      gradient: 'from-[#00b4db] to-[#0083b0]', // Cyan to blue
      active: true,
      shadowColor: 'shadow-cyan-500/30'
    },
    {
      id: 'mbti',
      name: '属灵性格测试',
      desc: '探索你的 MBTI 与属灵恩赐',
      icon: Heart,
      path: '/spirit-personality-test',
      gradient: 'from-[#ff9a9e] to-[#fad0c4]', // Pink/Peach
      active: true,
      shadowColor: 'shadow-pink-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 relative overflow-hidden flex flex-col">
      {/* Background Stars/Decorations - Adjusted for light theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-indigo-300/40 animate-pulse">★</div>
        <div className="absolute top-20 right-20 text-blue-300/40 text-xl">★</div>
        <div className="absolute bottom-40 left-1/3 text-indigo-200/50 text-sm">★</div>
        <div className="absolute top-1/3 right-10 text-blue-200/50 text-2xl">★</div>
        {/* Soft Glows */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6 px-6 mb-2 text-center">
         <div className="flex items-center justify-center relative">
            <button 
                onClick={() => navigate('/')} 
                className="absolute left-0 p-2 text-slate-600 hover:bg-black/5 rounded-full transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 tracking-wide">趣味时刻</h1>
         </div>
      </header>

      {/* Game List */}
      <div className="flex-1 px-4 pb-8 space-y-4 max-w-md mx-auto w-full overflow-y-auto">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={game.active ? { scale: 1.02 } : {}}
            whileTap={game.active ? { scale: 0.98 } : {}}
            onClick={() => game.active && navigate(game.path)}
            className={`
              relative w-full aspect-[2/1] rounded-2xl p-6
              bg-gradient-to-br ${game.gradient}
              text-white
              ${game.active ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'}
              ${game.shadowColor} shadow-xl
              border border-white/20
              overflow-hidden
              flex items-center
            `}
          >
            {/* Glass effect overlay for depth */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
            
            {/* Content Container */}
            <div className="relative z-10 flex items-center w-full gap-5">
                {/* Icon Box */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 flex-shrink-0 shadow-inner">
                    <game.icon className="w-8 h-8 text-white drop-shadow-md" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-2xl font-bold mb-1 tracking-wide drop-shadow-sm">
                        {game.name}
                    </h3>
                    <p className="text-white/90 text-sm font-medium truncate drop-shadow-sm">
                        {game.desc}
                    </p>
                </div>
            </div>

            {/* Background Decorations within Card */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 p-2">
                 <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
             <div className="absolute bottom-4 right-10">
                 <div className="text-white/20 text-xl">★</div>
            </div>
            
            {/* Lock/Coming Soon Indicator */}
            {!game.active && (
                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                     <span className="text-xs font-medium text-white/90">即将推出</span>
                </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
