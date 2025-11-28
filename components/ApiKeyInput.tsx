import React, { useState } from 'react';
import { Key, ChevronRight } from 'lucide-react';

interface Props {
  onSave: (key: string) => void;
}

export const ApiKeyInput: React.FC<Props> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.startsWith('AIza')) {
      setError('无效的 API Key，请检查格式 (通常以 AIza 开头)');
      return;
    }
    onSave(key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <Key size={48} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          欢迎使用爆款封面工坊
        </h2>
        <p className="text-center text-slate-500 mb-8">
          请输入您的 Google Gemini API Key 以开始生成高清视频封面。您的 Key 仅保存在本地浏览器中。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="AIza..."
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            开始创作 <ChevronRight size={20} />
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-400">
          还没有 Key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">去 Google AI Studio 获取</a>
        </div>
      </div>
    </div>
  );
};
