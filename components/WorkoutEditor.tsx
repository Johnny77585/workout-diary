import React, { useState } from 'react';
import { Exercise, WorkoutSet } from '../types';
import { Button } from './Button';
import { Plus, Trash2, Dumbbell, Save, Copy } from 'lucide-react';

interface WorkoutEditorProps {
  date: string;
  initialExercises: Exercise[];
  onSave: (exercises: Exercise[]) => void;
  onCopyContent?: () => void;
  isToday: boolean;
}

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ 
  date, 
  initialExercises, 
  onSave, 
  onCopyContent,
  isToday 
}) => {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [newExerciseName, setNewExerciseName] = useState('');

  const addExercise = () => {
    if (!newExerciseName.trim()) return;
    const newEx: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName,
      sets: [{ id: Date.now().toString() + '-s1', reps: 10, weight: 0 }]
    };
    setExercises([...exercises, newEx]);
    setNewExerciseName('');
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const previousSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      id: Date.now().toString(),
      reps: previousSet ? previousSet.reps : 10,
      weight: previousSet ? previousSet.weight : 0
    });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(exercises);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-primary">{date}</span> 訓練紀錄
        </h2>
        {/* Allow copy even if it is today, in case user wants to duplicate to tomorrow */}
        {onCopyContent && (
           <Button variant="secondary" onClick={onCopyContent} title="複製此紀錄">
             <Copy size={16} /> 複製
           </Button>
        )}
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.length === 0 && (
          <div className="text-center py-10 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            尚無訓練項目，請新增動作
          </div>
        )}
        {exercises.map((exercise, exIndex) => (
          <div key={exercise.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                <Dumbbell size={18} /> {exercise.name}
              </h3>
              <button 
                onClick={() => removeExercise(exIndex)}
                className="text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-10 gap-2 text-xs text-slate-400 mb-1 px-1">
                <div className="col-span-2 text-center">組數</div>
                <div className="col-span-3 text-center">重量 (kg)</div>
                <div className="col-span-3 text-center">次數</div>
                <div className="col-span-2"></div>
              </div>
              
              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="grid grid-cols-10 gap-2 items-center">
                  <div className="col-span-2 flex justify-center">
                    <span className="bg-slate-700 text-slate-300 w-6 h-6 flex items-center justify-center rounded-full text-xs font-mono">
                      {setIndex + 1}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, 'weight', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, 'reps', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button 
                      onClick={() => removeSet(exIndex, setIndex)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => addSet(exIndex)}
              className="mt-3 w-full py-1.5 rounded border border-dashed border-slate-600 text-slate-400 text-sm hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={14} /> 新增組數
            </button>
          </div>
        ))}
      </div>

      {/* Add New Exercise Input */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <label className="block text-sm text-slate-400 mb-2">新增動作</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="例如：深蹲、臥推..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addExercise()}
          />
          <Button onClick={addExercise} disabled={!newExerciseName.trim()}>
            <Plus size={20} />
          </Button>
        </div>
      </div>

      {/* Floating Save Button - Moved up to bottom-24 to avoid nav bar */}
      <div className="fixed bottom-24 right-6 z-10">
        <Button 
          onClick={handleSave} 
          className="shadow-2xl shadow-emerald-500/30 py-3 px-6 text-lg rounded-full"
        >
          <Save size={20} /> 儲存紀錄
        </Button>
      </div>
    </div>
  );
};