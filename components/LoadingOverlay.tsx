import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  text: string;
}

export const LoadingOverlay: React.FC<Props> = ({ text }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
        <div className="relative bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={20} />
                AI 正在生成{dots}
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs text-center">{text}</p>
        </div>
      </div>
    </div>
  );
};
