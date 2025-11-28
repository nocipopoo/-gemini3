import React, { useState, useEffect } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ImageUpload } from './components/ImageUpload';
import { LoadingOverlay } from './components/LoadingOverlay';
import { generateCover, editGeneratedImage } from './services/geminiService';
import { CoverFormData, PLATFORMS, STYLE_TAGS, Platform } from './types';
import { 
  Sparkles, 
  Palette, 
  Layout, 
  Type, 
  Send, 
  Download, 
  Wand2, 
  AlertCircle,
  Smartphone,
  BookOpen,
  Tv,
  Youtube
} from 'lucide-react';

// Icon mapping helper
const getPlatformIcon = (id: Platform) => {
  switch (id) {
    case 'douyin': return <Smartphone size={24} />;
    case 'xiaohongshu': return <BookOpen size={24} />;
    case 'bilibili': return <Tv size={24} />;
    case 'youtube': return <Youtube size={24} />;
    default: return <Layout size={24} />;
  }
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Edit Mode State
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<CoverFormData>({
    mainTitle: '',
    subTitle: '',
    platform: 'douyin',
    subjectImage: null,
    styleRefImage: null,
    customPrompt: '',
    styleTags: []
  });

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
  };

  const toggleStyleTag = (tag: string) => {
    setFormData(prev => {
      const tags = prev.styleTags.includes(tag)
        ? prev.styleTags.filter(t => t !== tag)
        : [...prev.styleTags, tag];
      return { ...prev, styleTags: tags };
    });
  };

  const handleGenerate = async () => {
    if (!apiKey) return;
    if (!formData.mainTitle) {
      setError('请输入主标题');
      return;
    }
    
    setError(null);
    setLoading(true);
    setLoadingText('正在分析素材并构建构图...');
    
    try {
      const imageUrl = await generateCover(apiKey, formData);
      setGeneratedImage(imageUrl);
      // Scroll to result on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || '生成失败，请检查 API Key 或重试');
      if (err.message.includes('403') || err.message.includes('key')) {
         localStorage.removeItem('GEMINI_API_KEY');
         setApiKey(null);
         alert('API Key 无效或已过期，请重新输入');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!apiKey || !generatedImage || !editPrompt) return;

    setError(null);
    setIsEditing(true);
    
    try {
        const newImageUrl = await editGeneratedImage(apiKey, generatedImage, editPrompt);
        setGeneratedImage(newImageUrl);
        setEditPrompt('');
    } catch (err: any) {
        setError('修图失败: ' + err.message);
    } finally {
        setIsEditing(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `cover-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!apiKey) {
    return <ApiKeyInput onSave={handleApiKeySave} />;
  }

  return (
    <div className="min-h-screen pb-20">
      {(loading || isEditing) && <LoadingOverlay text={isEditing ? 'AI 正在精修图片...' : loadingText} />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              视频封面工坊
            </h1>
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full border border-slate-200">
              Gemini 3.0 Pro
            </span>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('GEMINI_API_KEY'); setApiKey(null); }}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            切换 Key
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input Configuration */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section: Platform */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Layout className="text-blue-500" size={20} />
              第一步：选择平台
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFormData({ ...formData, platform: p.id })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.platform === p.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`mb-2 ${formData.platform === p.id ? 'text-blue-600' : 'text-slate-400'}`}>
                    {getPlatformIcon(p.id)}
                  </div>
                  <span className="font-bold text-sm">{p.name}</span>
                  <span className="text-xs opacity-70 mt-1">{p.ratio}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Section: Content */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Type className="text-blue-500" size={20} />
              第二步：标题内容
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">主标题 (必填)</label>
                <input
                  type="text"
                  value={formData.mainTitle}
                  onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
                  placeholder="例如：月入过万的副业！"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">副标题</label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  placeholder="例如：新手必看 保姆级教程"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section: Visuals */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Palette className="text-blue-500" size={20} />
              第三步：视觉素材
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <ImageUpload 
                    label="主体图 (人物/产品)" 
                    image={formData.subjectImage}
                    onChange={(file) => setFormData({ ...formData, subjectImage: file })}
                    description="作为画面中心"
                />
                 <ImageUpload 
                    label="风格参考图" 
                    image={formData.styleRefImage}
                    onChange={(file) => setFormData({ ...formData, styleRefImage: file })}
                    description="模仿配色和排版"
                />
            </div>
          </section>

          {/* Section: Fine Tuning */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-20">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Wand2 className="text-blue-500" size={20} />
              第四步：风格细节
            </h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">风格标签</label>
                <div className="flex flex-wrap gap-2">
                    {STYLE_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleStyleTag(tag)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                formData.styleTags.includes(tag) 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">AI 详细指令</label>
                <textarea
                    rows={3}
                    value={formData.customPrompt}
                    onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                    placeholder="例如：背景要虚化，人物表情要夸张惊讶，整体色调偏暖..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Result & Actions (Sticky on desktop) */}
        <div className="lg:col-span-7 space-y-6">
            <div className="sticky top-24 space-y-6">
                
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Action Button (Mobile only logic handled by CSS ordering usually, but here duplicates for simplicity or use sticky footer) */}
                <div className="hidden lg:block">
                     <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="animate-pulse" />
                        生成爆款封面
                    </button>
                </div>

                {/* Result Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
                    <div className="flex-1 bg-slate-100 flex items-center justify-center relative group">
                        {generatedImage ? (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img 
                                    src={generatedImage} 
                                    alt="Generated Cover" 
                                    className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
                                />
                                <div className="absolute top-6 right-6 flex gap-2">
                                     <button 
                                        onClick={downloadImage}
                                        className="bg-white/90 backdrop-blur text-slate-800 p-3 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                                        title="下载图片"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12">
                                <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="text-blue-300" size={48} />
                                </div>
                                <h3 className="text-slate-400 font-medium text-lg">等待生成...</h3>
                                <p className="text-slate-400 text-sm mt-2">在左侧配置好参数后点击生成</p>
                            </div>
                        )}
                    </div>

                    {/* Editor Footer */}
                    {generatedImage && (
                        <div className="bg-white p-4 border-t border-slate-100">
                             <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Wand2 size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="AI 修图：把背景改成红色，或把标题变大..."
                                        className="w-full pl-9 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                    />
                                </div>
                                <button
                                    onClick={handleEdit}
                                    disabled={isEditing || !editPrompt}
                                    className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send size={18} />
                                    <span className="hidden sm:inline">修改</span>
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-20">
         <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
            <Sparkles size={24} />
            {loading ? '生成中...' : '立即生成封面'}
        </button>
      </div>
    </div>
  );
};

export default App;
