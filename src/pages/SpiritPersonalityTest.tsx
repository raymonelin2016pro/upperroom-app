import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, RefreshCw, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { questions, Question } from '../data/mbtiQuestions';
import { mbtiResults, MbtiResult } from '../data/mbtiResults';

type TestStatus = 'intro' | 'test' | 'result';

export default function SpiritPersonalityTest() {
  const [status, setStatus] = useState<TestStatus>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleStart = () => {
    setStatus('test');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = (value: string) => {
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 200); // Small delay for feedback
    } else {
      setTimeout(() => {
        setStatus('result');
      }, 300);
    }
  };

  const calculateResult = () => {
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    Object.values(answers).forEach(val => {
      if (val in scores) {
        scores[val as keyof typeof scores]++;
      }
    });

    const type = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('');

    const resultData = mbtiResults[type] || {
        type,
        name: '未知类型',
        character: '未知',
        keywords: [],
        description: '暂无数据',
        ministry: []
    };

    return { type, scores, ...resultData };
  };

  const result = useMemo(() => {
    if (status !== 'result') return null;
    return calculateResult();
  }, [status, answers]);

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-slate-800 font-sans selection:bg-orange-100 flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-2 flex items-center justify-between">
        <Link to="/games" className="p-2 text-slate-500 hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="text-sm font-medium text-slate-400 tracking-widest uppercase">MBTI Test</div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col max-w-md mx-auto w-full px-6 py-4">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {status === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto"
            >
              <div className="w-32 h-32 bg-white rounded-full shadow-xl shadow-orange-100 flex items-center justify-center mb-4">
                <Heart className="w-16 h-16 text-orange-400 fill-orange-400" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-800 leading-tight">
                  教会青年<br />
                  <span className="text-orange-500">属灵性格测试</span>
                </h1>
                <p className="text-slate-500 leading-relaxed px-4">
                  透过 MBTI 探索神创造的独特自我<br />
                  找到你在国度中的恩赐与呼召
                </p>
              </div>

              <div className="pt-8 w-full space-y-4">
                <button
                  onClick={handleStart}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  开始探索
                </button>
                <div className="text-xs text-slate-400">
                  共 {questions.length} 题 · 约需 5 分钟
                </div>
              </div>
            </motion.div>
          )}

          {/* Test Screen */}
          {status === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Progress */}
              <div className="mb-8 space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <span>Question {currentQuestionIndex + 1}</span>
                  <span>{questions.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="flex-1 flex flex-col justify-center pb-12">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold text-slate-800 leading-snug min-h-[4rem]">
                    {currentQuestion.question}
                  </h2>

                  <div className="space-y-4">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        className="w-full text-left p-6 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-orange-200 hover:shadow-md active:border-orange-400 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 font-bold flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            {option.label}
                          </div>
                          <span className="text-slate-700 font-medium text-lg">
                            {option.text}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Result Screen */}
          {status === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center pb-8 overflow-y-auto w-full"
            >
              {/* Result Card for Sharing */}
              <div id="result-card" className="bg-white rounded-3xl shadow-xl overflow-hidden w-full mb-6 border border-slate-100 relative">
                  {/* Decorative Header */}
                  <div className="h-32 bg-gradient-to-br from-orange-400 to-pink-500 relative p-6 flex items-end">
                     <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Heart size={80} fill="white" />
                     </div>
                     <div className="text-white relative z-10">
                        <div className="text-sm font-medium opacity-90 mb-1">你的属灵性格类型</div>
                        <h2 className="text-3xl font-bold tracking-tight">{result.name}</h2>
                     </div>
                  </div>

                  <div className="p-6 pt-8 relative">
                     {/* Floating Type Badge */}
                     <div className="absolute -top-10 right-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-orange-50 transform rotate-3">
                        <span className="text-2xl font-bold bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            {result.type}
                        </span>
                     </div>

                     {/* Character & Quote */}
                     <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">圣经人物</span>
                           <h3 className="text-xl font-bold text-slate-800">{result.character}</h3>
                        </div>
                        {result.quote && (
                            <blockquote className="text-slate-500 italic text-sm border-l-4 border-orange-200 pl-3 my-3">
                                {result.quote}
                            </blockquote>
                        )}
                     </div>

                     {/* Keywords */}
                     <div className="flex flex-wrap gap-2 mb-6">
                        {result.keywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                                # {kw}
                            </span>
                        ))}
                     </div>

                     {/* Description */}
                     <div className="mb-6">
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {result.description}
                        </p>
                     </div>

                     {/* Ministry */}
                     <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-400 rounded-full"></span>
                            适合服事方向
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {result.ministry.map((m, i) => (
                                <div key={i} className="bg-orange-50 text-orange-800 px-3 py-2 rounded-lg text-sm font-medium text-center">
                                    {m}
                                </div>
                            ))}
                        </div>
                     </div>
                  </div>
              </div>

              {/* Detailed Scores (Optional, kept separate from share card to keep it clean, or included?) 
                  Let's keep scores separate/collapsible or just below.
              */}
              <div className="w-full bg-white/50 p-4 rounded-2xl mb-6">
                 <div className="text-xs text-slate-400 font-medium mb-2 text-center">维度倾向</div>
                 <div className="flex justify-between gap-1">
                    {['E/I', 'S/N', 'T/F', 'J/P'].map((dim, i) => {
                        const [left, right] = dim.split('/');
                        const lScore = result.scores[left as keyof typeof result.scores];
                        const rScore = result.scores[right as keyof typeof result.scores];
                        const total = lScore + rScore;
                        const lPercent = total === 0 ? 50 : (lScore / total) * 100;
                        
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="h-16 w-1.5 bg-white rounded-full overflow-hidden relative shadow-sm">
                                    <div 
                                        className="absolute bottom-0 w-full bg-slate-300 transition-all duration-500"
                                        style={{ height: `${lPercent}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold">{lScore > rScore ? left : right}</div>
                            </div>
                        )
                    })}
                 </div>
              </div>

              <div className="flex gap-3 w-full">
                 <button 
                    onClick={() => setStatus('intro')}
                    className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                 >
                    <RefreshCw size={18} /> 重测
                 </button>
                 <button 
                    onClick={() => alert('请截图保存此页面分享给朋友！')}
                    className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
                 >
                    <Share2 size={18} /> 分享结果
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
