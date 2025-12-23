import React, { useState, useEffect } from 'react';
import { Calendar, Activity, BarChart2, Sparkles, Copy, X } from 'lucide-react';
import { WorkoutLog, Exercise, AppView } from './types';
import { WorkoutEditor } from './components/WorkoutEditor';
import { CalendarView } from './components/CalendarView';
import { StatsView } from './components/StatsView';
import { generateWorkoutAdvice } from './services/geminiService';
import { Button } from './components/Button';
import { Toast } from './components/Toast';

const STORAGE_KEY = 'fittrack_log_v1';

// Helper for local date string YYYY-MM-DD
const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // State
  const [log, setLog] = useState<WorkoutLog>({});
  const [view, setView] = useState<AppView>(AppView.CALENDAR);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Copy Modal State
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetDate, setCopyTargetDate] = useState(getLocalDateString());

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLog(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
  }, []);

  // Persist data
  const saveLogs = (newLog: WorkoutLog) => {
    setLog(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLog));
  };

  const handleSaveWorkout = (exercises: Exercise[]) => {
    const newLog = { ...log, [selectedDate]: exercises };
    saveLogs(newLog);
    setToastMessage("儲存成功！");
  };

  const openCopyModal = () => {
    setCopyTargetDate(getLocalDateString());
    setShowCopyModal(true);
  };

  const confirmCopy = () => {
    const sourceExercises = log[selectedDate] || [];
    
    // Deep copy with new IDs
    const copiedExercises = sourceExercises.map(ex => ({
      ...ex,
      id: Date.now().toString() + Math.random(),
      sets: ex.sets.map(s => ({ ...s, id: Date.now().toString() + Math.random() }))
    }));

    const existingOnTarget = log[copyTargetDate] || [];
    const newLog = { 
      ...log, 
      [copyTargetDate]: [...existingOnTarget, ...copiedExercises] 
    };
    
    saveLogs(newLog);
    setShowCopyModal(false);
    
    // Switch to the target date view
    setSelectedDate(copyTargetDate);
    setView(AppView.EDITOR);
    setToastMessage("複製成功！");
  };

  const handleGetAdvice = async () => {
    setShowAiModal(true);
    if (!aiAdvice) {
      setIsAiLoading(true);
      const advice = await generateWorkoutAdvice(log, selectedDate);
      setAiAdvice(advice);
      setIsAiLoading(false);
    }
  };

  const today = getLocalDateString();

  return (
    <div className="min-h-screen pb-20">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center text-slate-900 font-bold">
              FT
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
              FitTrack
            </h1>
          </div>
          <Button 
            variant="ghost" 
            className="text-emerald-400"
            onClick={handleGetAdvice}
          >
            <Sparkles size={18} /> AI 教練
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 animate-fade-in">
        {view === AppView.CALENDAR && (
          <div className="space-y-6">
            <CalendarView 
              log={log} 
              selectedDate={selectedDate} 
              onSelectDate={(d) => {
                setSelectedDate(d);
                setView(AppView.EDITOR);
              }} 
            />
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
               <h3 className="text-slate-400 text-sm mb-2">快速開始</h3>
               <Button fullWidth onClick={() => {
                 setSelectedDate(today);
                 setView(AppView.EDITOR);
               }}>
                 紀錄今日訓練 ({today})
               </Button>
            </div>
          </div>
        )}

        {view === AppView.EDITOR && (
          <WorkoutEditor 
            date={selectedDate}
            initialExercises={log[selectedDate] || []}
            onSave={handleSaveWorkout}
            isToday={selectedDate === today}
            onCopyContent={openCopyModal}
          />
        )}

        {view === AppView.STATS && (
          <StatsView log={log} />
        )}
      </main>

      {/* Copy Date Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Copy size={20} className="text-primary" /> 複製紀錄
            </h3>
            <p className="text-slate-400 mb-4">
              將 <span className="text-white font-mono">{selectedDate}</span> 的訓練內容複製到：
            </p>
            
            <input 
              type="date"
              value={copyTargetDate}
              onChange={(e) => setCopyTargetDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-6"
            />
            
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowCopyModal(false)}>
                取消
              </Button>
              <Button fullWidth onClick={confirmCopy}>
                確定複製
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <Sparkles size={20} /> AI 教練建議
            </h3>
            
            <div className="min-h-[150px] bg-slate-900/50 rounded-xl p-4 text-slate-200 leading-relaxed border border-slate-700/50">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                  分析你的訓練數據中...
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                  {aiAdvice.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowAiModal(false)}>知道了</Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 pb-safe">
        <div className="max-w-2xl mx-auto grid grid-cols-3 h-16">
          <button 
            onClick={() => setView(AppView.CALENDAR)}
            className={`flex flex-col items-center justify-center gap-1 ${view === AppView.CALENDAR ? 'text-primary' : 'text-slate-500'}`}
          >
            <Calendar size={20} />
            <span className="text-xs">日曆</span>
          </button>
          
          <button 
            onClick={() => {
              // If entering editor from tab, default to today
              if (view !== AppView.EDITOR) setSelectedDate(today);
              setView(AppView.EDITOR);
            }}
            className={`flex flex-col items-center justify-center gap-1 ${view === AppView.EDITOR ? 'text-primary' : 'text-slate-500'}`}
          >
            <Activity size={20} />
            <span className="text-xs">紀錄</span>
          </button>
          
          <button 
            onClick={() => setView(AppView.STATS)}
            className={`flex flex-col items-center justify-center gap-1 ${view === AppView.STATS ? 'text-primary' : 'text-slate-500'}`}
          >
            <BarChart2 size={20} />
            <span className="text-xs">統計</span>
          </button>
        </div>
      </nav>
    </div>
  );
}