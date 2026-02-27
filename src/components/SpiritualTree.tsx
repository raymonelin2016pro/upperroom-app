import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sprout, TreeDeciduous, TreePine, Flower, CloudSun, BookOpen, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import scriptures from '../data/scriptures.json';

interface SpiritualTreeProps {
  initialPoints: number;
  lastCheckIn: string | null;
  onPointsUpdate: (newPoints: number, newLastCheckIn: string) => void;
}

export default function SpiritualTree({ initialPoints, lastCheckIn, onPointsUpdate }: SpiritualTreeProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showScripture, setShowScripture] = useState(false);
  const [currentScripture, setCurrentScripture] = useState<{ 
    verse: { en: string; zh: string }; 
    reference: { en: string; zh: string } 
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Check if checked in today
  const isCheckedInToday = () => {
    if (!lastCheckIn) return false;
    const today = new Date().toDateString();
    const lastDate = new Date(lastCheckIn).toDateString();
    return today === lastDate;
  };

  const getTreeLevel = (points: number) => {
    if (points < 20) return { name: t('spiritual_tree.levels.seed'), icon: <Sprout className="w-12 h-12 text-green-400" />, nextLevel: 20 };
    if (points < 50) return { name: t('spiritual_tree.levels.sprout'), icon: <Flower className="w-16 h-16 text-green-500" />, nextLevel: 50 };
    if (points < 100) return { name: t('spiritual_tree.levels.sapling'), icon: <TreeDeciduous className="w-20 h-20 text-green-600" />, nextLevel: 100 };
    if (points < 200) return { name: t('spiritual_tree.levels.tree'), icon: <TreePine className="w-24 h-24 text-green-700" />, nextLevel: 200 };
    return { name: t('spiritual_tree.levels.mighty_tree'), icon: <TreePine className="w-32 h-32 text-emerald-800" />, nextLevel: 500 }; // Cap at 500 for progress bar
  };

  const currentLevel = getTreeLevel(initialPoints);
  const progress = Math.min(100, (initialPoints / currentLevel.nextLevel) * 100);

  const handleCheckIn = async () => {
    if (isCheckedInToday()) {
      if (!currentScripture) {
        const randomScripture = scriptures[Math.floor(Math.random() * scriptures.length)];
        setCurrentScripture(randomScripture);
      }
      setShowScripture(true);
      return;
    }

    if (loading) return;

    setLoading(true);
    
    // Pick random scripture
    const randomScripture = scriptures[Math.floor(Math.random() * scriptures.length)];
    setCurrentScripture(randomScripture);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPoints = initialPoints + 10;
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          growth_points: newPoints,
          last_check_in: now
        })
        .eq('id', user.id);

      if (error) throw error;

      onPointsUpdate(newPoints, now);
      setShowScripture(true);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-6 shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 p-4 opacity-20 pointer-events-none">
        <CloudSun className="w-24 h-24 text-yellow-500" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="text-emerald-700/60 hover:text-emerald-800 transition-colors p-1"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <h3 className="text-xl font-bold text-emerald-900 mb-2">{t('spiritual_tree.title')}</h3>
        <p className="text-emerald-600 text-sm mb-6">{t('spiritual_tree.subtitle')}</p>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 left-0 right-0 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg text-xs text-emerald-800 z-30 mx-6 border border-emerald-100"
            >
              <p className="mb-2"><strong>{t('spiritual_tree.info.title')}</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('spiritual_tree.info.daily_check_in')}</li>
                <li>{t('spiritual_tree.info.create_post')}</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="bg-white/40 backdrop-blur-sm p-8 rounded-full shadow-inner mb-6 ring-4 ring-white/50"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {currentLevel.icon}
        </motion.div>

        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-between text-xs font-bold text-emerald-700 mb-1">
            <span>{currentLevel.name}</span>
            <span>{initialPoints} / {currentLevel.nextLevel} pts</span>
          </div>
          <div className="h-3 bg-white/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className={`mt-6 flex items-center px-6 py-3 rounded-full font-bold shadow-md transition-all transform hover:scale-105 active:scale-95 ${
            isCheckedInToday() 
              ? 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : isCheckedInToday() ? (
            <>
              <span className="mr-2">✅</span> {t('spiritual_tree.checked_in')}
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5 mr-2" /> {t('spiritual_tree.check_in')}
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showScripture && currentScripture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowScripture(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">{t('spiritual_tree.daily_verse')}</h4>
                
                <p className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                  "{i18n.language.startsWith('zh') ? currentScripture.verse.zh : currentScripture.verse.en}"
                </p>
                
                <p className="text-sm font-bold text-emerald-600 mb-8">
                  — {i18n.language.startsWith('zh') ? currentScripture.reference.zh : currentScripture.reference.en}
                </p>
                
                <button
                  onClick={() => setShowScripture(false)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  {t('spiritual_tree.amen')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
