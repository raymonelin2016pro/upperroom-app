import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crown, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  best_score: number;
  rank: number;
}

interface WeeklyLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger: number;
}

export default function WeeklyLeaderboard({ isOpen, onClose, refreshTrigger }: WeeklyLeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, refreshTrigger]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('speed_king_weekly_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300 fill-slate-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;
      default:
        return <span className="text-white/60 font-bold w-6 text-center">{rank}</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">周排行榜</h2>
                  <p className="text-white/50 text-xs">每周一 00:00 重置</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="text-center py-10 text-white/50">加载中...</div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-10 text-white/50">本周暂无记录，快来挑战吧！</div>
              ) : (
                leaders.map((user) => (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      relative flex items-center gap-4 p-3 rounded-2xl
                      ${user.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}
                      border hover:bg-white/10 transition-colors
                    `}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar with Frame */}
                    <div className="relative">
                      {user.rank <= 3 && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ 
                            duration: user.rank === 1 ? 8 : 12, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                          className={`
                            absolute -inset-1 rounded-full border-2 border-dashed
                            ${user.rank === 1 ? 'border-yellow-400' : user.rank === 2 ? 'border-slate-300' : 'border-amber-600'}
                            opacity-70
                          `}
                        />
                      )}
                      {/* Active Lamb Breathing Effect for Top 3 */}
                       {user.rank <= 3 && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`
                            absolute -inset-1 rounded-full blur-md
                            ${user.rank === 1 ? 'bg-yellow-400/50' : user.rank === 2 ? 'bg-slate-300/50' : 'bg-amber-600/50'}
                          `}
                        />
                      )}
                      
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-white/20">
                         {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-indigo-500 to-purple-500">
                                {user.username?.[0]?.toUpperCase() || '?'}
                            </div>
                         )}
                      </div>
                      
                      {/* 1st Place Crown Overlay */}
                      {user.rank === 1 && (
                        <div className="absolute -top-3 -right-2 transform rotate-12">
                             <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow-lg" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <span className="text-white font-medium truncate">{user.username || '神秘羊羔'}</span>
                         {user.rank <= 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 border border-white/10">
                                手速王
                            </span>
                         )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-white">{user.best_score}</span>
                      <span className="text-xs text-white/50 ml-1">ms</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                 <p className="text-white/40 text-xs">
                    加油！只有前三名才能获得“手速王”称号哦
                 </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
