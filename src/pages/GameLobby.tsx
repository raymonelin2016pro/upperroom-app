import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles, Zap, Brain, Heart, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';

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

  // 1. 动态背景扩散圆圈逻辑 (Dynamic Background Diffusion)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // 使用 Spring 创造"果冻般"的延迟跟随效果
  const springConfig = { damping: 20, stiffness: 100 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 减去圆圈半径的一半，使其中心对准鼠标 (假设圆圈约 400px)
      mouseX.set(e.clientX - 200);
      mouseY.set(e.clientY - 200);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // 生成随机星星数据
  const stars = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() > 0.6 ? 'text-lg' : 'text-xs',
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2
  }));

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
    },
    {
      id: 'grace-drift',
      name: '灵感漂流瓶',
      desc: '捞一个不期而遇的温暖',
      icon: Mail,
      path: '/grace-drift',
      gradient: 'from-[#4facfe] to-[#00f2fe]', // Blue/Cyan
      active: true,
      shadowColor: 'shadow-cyan-500/30'
    }
  ];

  // 3. 交错入场动画 Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden flex flex-col">
      {/* 1. 动态背景扩散圆圈 */}
      <motion.div 
        style={{ x, y }}
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-[80px] pointer-events-none z-0"
      />

      {/* 2. 背景闪烁星星 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map((star) => (
            <motion.div
                key={star.id}
                className={`absolute text-indigo-400/40 ${star.size}`}
                style={{ top: star.top, left: star.left }}
                animate={{ 
                    opacity: [0.3, 0.8, 0.3], 
                    scale: [1, 1.2, 1],
                    rotate: [0, 45, 0]
                }}
                transition={{ 
                    duration: star.duration, 
                    repeat: Infinity, 
                    delay: star.delay,
                    ease: "easeInOut" 
                }}
            >
                ★
            </motion.div>
        ))}
        {/* Soft Static Glows */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6 px-6 mb-2 text-center">
         <div className="flex items-center justify-center relative">
            <button 
                onClick={() => navigate('/')} 
                className="absolute left-0 p-2 text-slate-600 hover:bg-black/5 rounded-full transition-colors backdrop-blur-sm"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 tracking-wide">趣味时刻</h1>
         </div>
      </header>

      {/* 3. 游戏卡片列表 (Staggered Entrance) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex-1 px-4 pb-8 space-y-5 max-w-md mx-auto w-full overflow-y-auto scrollbar-hide"
      >
        {games.map((game) => (
          <motion.div
            key={game.id}
            variants={itemVariants}
            whileHover={game.active ? { scale: 1.02, y: -2 } : {}}
            // 4. While Tap Effect: Jelly feel
            whileTap={game.active ? { scale: 0.98, borderRadius: "2rem" } : {}}
            onClick={() => game.active && navigate(game.path)}
            className={`
              relative w-full aspect-[2.1/1] rounded-2xl p-6
              bg-gradient-to-br ${game.gradient}
              text-white
              ${game.active ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'}
              ${game.shadowColor} shadow-xl hover:shadow-2xl
              border border-white/20
              overflow-hidden
              flex items-center
              transition-shadow duration-300
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
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl border border-white/10 border-dashed"
            />
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
      </motion.div>
    </div>
  );
}
