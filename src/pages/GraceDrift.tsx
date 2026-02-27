import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mail, X, Sparkles, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Animation variants
const envelopeVariants = {
  hidden: { y: 100, opacity: 0, scale: 0.5, rotate: -10 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10,
      duration: 1.5 
    }
  },
  open: {
    scale: 1.1,
    opacity: 0, // Fade out envelope
    transition: { duration: 0.5 }
  },
  hover: {
    y: -10,
    rotate: 2,
    transition: {
      y: { yoyo: Infinity, duration: 2, ease: "easeInOut" },
      rotate: { yoyo: Infinity, duration: 3, ease: "easeInOut" }
    }
  }
};

const paperVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.2 // Wait for envelope to start fading
    }
  }
};

export default function GraceDrift() {
  const navigate = useNavigate();
  const [isFishing, setIsFishing] = useState(false);
  const [bottleContent, setBottleContent] = useState<string | null>(null);
  const [showBottle, setShowBottle] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // System default messages in case DB is empty
  const defaultMessages = [
    "凡事包容，凡事相信，凡事盼望，凡事忍耐。（哥林多前书 13:7）",
    "应当一无挂虑，只要凡事藉着祷告、祈求，和感谢，将你们所要的告诉神。（腓立比书 4:6）",
    "神就是爱；住在爱里面的，就是住在神里面，神也住在他里面。（约翰一书 4:16）",
    "你要专心仰赖耶和华，不可倚靠自己的聪明。（箴言 3:5）",
    "愿耶和华赐福给你，保护你。（民数记 6:24）"
  ];

  const handleFish = async () => {
    if (isFishing || showBottle) return;
    setIsFishing(true);
    setBottleContent(null);

    try {
      // 1. Get total count
      const { count, error: countError } = await supabase
        .from('drift_bottles')
        .select('*', { count: 'exact', head: true });
      
      let message = '';

      if (countError || count === 0 || count === null) {
        // Fallback to local random message
        message = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      } else {
        // 2. Get random offset
        const randomIndex = Math.floor(Math.random() * count);
        const { data, error } = await supabase
          .from('drift_bottles')
          .select('content')
          .range(randomIndex, randomIndex)
          .maybeSingle();
        
        if (error || !data) {
           message = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
        } else {
           message = data.content;
        }
      }

      // Simulate network/fishing delay + animation time
      setTimeout(() => {
        setBottleContent(message);
        setIsFishing(false);
        setShowBottle(true);
      }, 2000);

    } catch (err) {
      console.error("Error fishing:", err);
      setBottleContent(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
      setIsFishing(false);
      setShowBottle(true);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFeedback({ type: 'error', message: "请先登录再发送漂流瓶哦！" });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('drift_bottles')
        .insert([
          { user_id: user.id, content: newMessage.trim() }
        ]);

      if (error) throw error;

      setNewMessage('');
      setIsWriting(false);
      setFeedback({ type: 'success', message: "漂流瓶已发送，愿它能温暖某人的心！" });
      
      // Auto dismiss feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
      
    } catch (err) {
      console.error("Error sending bottle:", err);
      setFeedback({ type: 'error', message: "发送失败，请稍后再试。" });
    } finally {
      setLoading(false);
    }
  };

  const resetBottle = () => {
    setShowBottle(false);
    setBottleContent(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-gradient-to-b from-sky-300 via-blue-200 to-blue-400">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sun/Moon Reflection */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-100/40 rounded-full blur-xl animate-pulse"></div>
        {/* Clouds */}
        <div className="absolute top-20 left-10 w-32 h-12 bg-white/30 rounded-full blur-md"></div>
        <div className="absolute top-40 right-1/4 w-48 h-16 bg-white/20 rounded-full blur-lg"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-6 flex justify-between items-center">
        <button 
            onClick={() => navigate('/games')} 
            className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white drop-shadow-md">灵感漂流瓶</h1>
        <button 
            onClick={() => setIsWriting(true)}
            className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
        >
            <Send className="w-5 h-5" />
        </button>
      </header>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md border ${
              feedback.type === 'success' 
                ? 'bg-green-500/80 border-green-400 text-white' 
                : 'bg-red-500/80 border-red-400 text-white'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-0">
        
        {/* Water Surface Line (Visual) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-600/40 to-transparent pointer-events-none"></div>
        
        {/* Fishing Button (Only visible when no bottle) */}
        {!showBottle && !isFishing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFish}
            className="z-10 px-8 py-4 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-white font-bold text-xl shadow-lg flex items-center gap-2 hover:bg-white/30 transition-all"
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
            捞一个
          </motion.button>
        )}

        {/* Fishing Animation / Bottle Reveal */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <AnimatePresence mode="wait">
              {(isFishing || (showBottle && !bottleContent)) && (
                <motion.div
                  key="envelope"
                  variants={envelopeVariants}
                  initial="hidden"
                  animate={showBottle ? "open" : "visible"}
                  exit="hidden"
                  className="relative w-64 h-48 cursor-pointer pointer-events-auto"
                  onClick={showBottle ? undefined : () => setShowBottle(true)}
                >
                  {/* Envelope Graphics */}
                  <div className="w-full h-full bg-[#f3e5ab] shadow-2xl rounded-lg relative overflow-hidden">
                     {/* Flap */}
                     <div className="absolute top-0 left-0 w-full h-1/2 bg-[#e6d28a] origin-top clip-path-polygon-[0_0,50%_100%,100%_0] z-10"></div>
                     {/* Body */}
                     <div className="absolute bottom-0 left-0 w-full h-full bg-[#f3e5ab] border-t-2 border-[#e6d28a]/50 flex items-center justify-center">
                        <Mail className="w-12 h-12 text-[#d4b456]/50" />
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showBottle && bottleContent && (
                 <motion.div 
                   key="paper"
                   variants={paperVariants}
                   initial="hidden"
                   animate="visible"
                   exit="hidden"
                   className="absolute pointer-events-auto w-80 max-w-[90vw] bg-[#fff9e6] p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center border border-[#e6d28a] z-30"
                 >
                    <Sparkles className="w-10 h-10 text-yellow-400 mb-6" />
                    <div className="font-serif text-slate-700 text-xl leading-relaxed italic mb-8 overflow-y-auto max-h-[60vh]">
                      "{bottleContent}"
                    </div>
                    <button 
                      onClick={resetBottle}
                      className="px-8 py-3 bg-blue-500 text-white rounded-full text-base font-medium hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
                    >
                      收下祝福
                    </button>
                 </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* Writing Modal */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsWriting(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-500" />
                写下你的祝福
              </h2>
              
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="写一句鼓励的话，或分享一个感恩的见证..."
                className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-slate-700 mb-4"
              />
              
              <div className="flex justify-end">
                <button
                  onClick={handleSend}
                  disabled={loading || !newMessage.trim()}
                  className={`
                    px-6 py-2 rounded-full font-medium text-white flex items-center gap-2
                    ${loading || !newMessage.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg'}
                    transition-all
                  `}
                >
                  {loading ? '发送中...' : '放入漂流瓶'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
