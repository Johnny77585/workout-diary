import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WorkoutLog } from '../types';

interface StatsViewProps {
  log: WorkoutLog;
}

export const StatsView: React.FC<StatsViewProps> = ({ log }) => {
  const data = React.useMemo(() => {
    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      // Fix: Use local date generation to match App.tsx and CalendarView.tsx keys
      // (toISOString uses UTC which might cause mismatch in timezone)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      
      const exercises = log[key] || [];
      const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
      const totalVolume = exercises.reduce((acc, ex) => {
        return acc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
      }, 0);

      days.push({
        date: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        sets: totalSets,
        volume: totalVolume
      });
    }
    return days;
  }, [log]);

  const totalWorkouts = Object.keys(log).length;
  
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
             <div className="text-slate-400 text-sm">總訓練天數</div>
             <div className="text-3xl font-bold text-white">{totalWorkouts}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
             <div className="text-slate-400 text-sm">本週總組數</div>
             <div className="text-3xl font-bold text-primary">{data.reduce((a,b) => a + b.sets, 0)}</div>
          </div>
       </div>

       <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
         <h3 className="text-lg font-semibold text-white mb-4">過去7天訓練量 (Volume)</h3>
         {/* Fix: Explicit height ensures ResponsiveContainer has dimensions to measure */}
         <div style={{ width: '100%', height: 300, minHeight: 300 }}>
           <ResponsiveContainer width="100%" height="100%" minWidth={0}>
             <BarChart data={data}>
               <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
               <Tooltip 
                 cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
               />
               <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                 {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.volume > 0 ? '#10b981' : '#334155'} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>
       </div>
    </div>
  );
};