import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Disappear after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-24 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-2 font-bold border border-emerald-400 transform transition-all duration-300 animate-bounce">
        <CheckCircle size={20} strokeWidth={2.5} />
        {message}
      </div>
    </div>
  );
};