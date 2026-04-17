import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  Image as ImageIcon, 
  Download, 
  Languages, 
  Sparkles, 
  Trash2, 
  Plus, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Move,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Palette,
  Layout,
  ArrowRight,
  Home
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { cn } from './lib/utils';
import { TEMPLATES, FONTS, COLORS } from './constants';
import { type TextItem, type Language, type Template, type View } from './types';
import { generatePostcardText } from './services/aiService';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [language, setLanguage] = useState<Language>('en');
  const [textItems, setTextItems] = useState<TextItem[]>([
    {
      id: 'initial-text',
      content: 'Hello from the other side!',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
      fontFamily: '"Dancing Script", cursive',
      textAlign: 'center'
    }
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>('initial-text');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMode, setAiMode] = useState<'en' | 'zh' | 'bilingual'>('en');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null);

  // Initialize language from browser
  useEffect(() => {
    const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    setLanguage(browserLang);
    setAiMode(browserLang);
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    const item = textItems.find(t => t.id === id);
    if (!item) return;
    
    setSelectedTextId(id);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      id,
      startX: clientX,
      startY: clientY,
      itemX: item.x,
      itemY: item.y
    };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    const dx = ((clientX - dragRef.current.startX) / canvasRef.current.offsetWidth) * 100;
    const dy = ((clientY - dragRef.current.startY) / canvasRef.current.offsetHeight) * 100;
    
    setTextItems(prev => prev.map(item => 
      item.id === dragRef.current?.id 
        ? { ...item, x: Math.max(0, Math.min(100, dragRef.current.itemX + dx)), y: Math.max(0, Math.min(100, dragRef.current.itemY + dy)) }
        : item
    ));
  };

  const handleDragEnd = () => {
    dragRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  const handleAIButtonClick = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      const result = await generatePostcardText(aiPrompt, aiMode);
      const newItem: TextItem = {
        id: `ai-${Date.now()}`,
        content: result,
        x: 50,
        y: 50,
        fontSize: 18,
        color: '#000000',
        fontFamily: '"Inter", sans-serif',
        textAlign: 'center'
      };
      setTextItems(prev => [...prev, newItem]);
      setSelectedTextId(newItem.id);
      setAiPrompt('');
    } catch (err) {
      alert("AI generation failed. Please check your API key.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toJpeg(canvasRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `postcard-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const updateSelectedText = (updates: Partial<TextItem>) => {
    if (!selectedTextId) return;
    setTextItems(prev => prev.map(t => t.id === selectedTextId ? { ...t, ...updates } : t));
  };

  const addText = () => {
    const newItem: TextItem = {
      id: `text-${Date.now()}`,
      content: language === 'en' ? 'New Message' : '新消息',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
      fontFamily: '"Inter", sans-serif',
      textAlign: 'center'
    };
    setTextItems(prev => [...prev, newItem]);
    setSelectedTextId(newItem.id);
  };

  const removeText = (id: string) => {
    setTextItems(prev => prev.filter(t => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const t = useMemo(() => ({
    en: {
      logo: 'DreamSpace',
      subLogo: 'Custom Postcards',
      title: 'Postcard Studio',
      gallery: 'Templates',
      editor: 'Editor',
      ai: 'AI Message',
      promptPlaceholder: 'Enter mood or keywords...',
      generate: 'Generate',
      export: 'Export JPEG',
      addText: 'Add Text',
      fontSize: 'Size',
      color: 'Color',
      align: 'Align',
      font: 'Font',
      noTextSelected: 'Select text to edit',
      langToggle: '中文',
      diyMode: 'DIY Postcard',
      dreamMode: 'Dream Postcard',
      modeDescDIY: 'Create freely with your own style.',
      modeDescDream: 'AI-assisted artistic creations.',
      start: 'Get Started',
      backToHome: 'Home'
    },
    zh: {
      logo: '筑梦空间——明信片の定制篇',
      subLogo: 'DreamSpace',
      title: '明信片工作室',
      gallery: '样式库',
      editor: '编辑器',
      ai: 'AI 生成寄语',
      promptPlaceholder: '输入心情或关键词...',
      generate: '生成',
      export: '导出图片',
      addText: '添加文字',
      fontSize: '大小',
      color: '颜色',
      align: '对齐',
      font: '字体',
      noTextSelected: '选择文字进行编辑',
      langToggle: 'English',
      diyMode: 'DIY 明信片',
      dreamMode: '筑梦明信片',
      modeDescDIY: '自由发挥，定义你的专属风格。',
      modeDescDream: '使用筑梦空间社团精选的30张优秀手绘明信片',
      start: '立即开始',
      backToHome: '返回首页'
    }
  }[language]), [language]);

  const selectedItem = textItems.find(t => t.id === selectedTextId);

  if (view === 'landing') {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-theme-bg flex flex-col items-center justify-center p-4 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center py-8 sm:py-0 mb-6 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-16 h-16 bg-theme-accent rounded-2xl flex items-center justify-center text-white shadow-[0_10px_30px_-5px_var(--color-theme-accent)]"
            >
               <Sparkles size={32} />
            </motion.div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tighter text-theme-dark leading-none">
                {t.logo}<span className="text-theme-accent">.</span>
              </h1>
              <p className="text-theme-muted font-bold tracking-[0.2em] uppercase text-[10px] mt-1">
                {t.subLogo}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-5xl px-2 sm:px-4">
          <motion.button
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('diy')}
            className="group relative h-auto min-h-[220px] sm:h-[400px] bg-theme-pane rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 flex flex-col justify-between overflow-hidden shadow-xl sm:shadow-2xl border border-theme-border transition-all"
          >
            <div className="absolute -top-12 -right-12 p-8 text-theme-bg/10 rotate-12 transition-transform group-hover:scale-110">
              <Layout size={240} className="hidden sm:block" />
              <Layout size={140} className="sm:hidden" />
            </div>
            <div className="z-10 text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6 sm:mb-8 shadow-sm">
                <Palette size={24} className="sm:size-[28px]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-theme-dark mb-2 sm:mb-3 tracking-tight">{t.diyMode}</h2>
              <p className="text-theme-muted text-sm sm:text-base leading-relaxed max-w-[200px] font-medium">{t.modeDescDIY}</p>
            </div>
            <div className="z-10 flex items-center gap-2 sm:gap-3 text-theme-accent font-black text-xs sm:text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform mt-4 sm:mt-0">
              {t.start} <ArrowRight size={18} className="sm:size-[20px]" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(212, 163, 115, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setView('dream');
              setAiPrompt(language === 'en' ? 'A dreamy, artistic scenery' : '一个梦幻、充满艺术气息的风景');
            }}
            className="group relative h-auto min-h-[220px] sm:h-[400px] bg-theme-dark rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 flex flex-col justify-between overflow-hidden shadow-xl sm:shadow-2xl transition-all"
          >
            <div className="absolute -top-12 -right-12 p-8 text-white/5 -rotate-12 transition-transform group-hover:scale-110">
              <Sparkles size={240} className="hidden sm:block" />
              <Sparkles size={140} className="sm:hidden" />
            </div>
            <div className="z-10 text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-white/10 flex items-center justify-center text-theme-accent mb-6 sm:mb-8 shadow-sm border border-white/5">
                <Sparkles size={24} className="sm:size-[28px]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">{t.dreamMode}</h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-[200px] font-medium">{t.modeDescDream}</p>
            </div>
            <div className="z-10 flex items-center gap-2 sm:gap-3 text-theme-accent font-black text-xs sm:text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform mt-4 sm:mt-0">
              {t.start} <ArrowRight size={18} className="sm:size-[20px]" />
            </div>
          </motion.button>
        </div>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="mt-8 sm:mt-12 mb-8 sm:mb-0 flex items-center gap-2 text-[10px] font-black text-theme-muted hover:text-theme-accent transition-colors uppercase tracking-[0.25em]"
        >
          <Languages size={14} /> {language === 'en' ? '中文' : 'ENGLISH'}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden landscape:flex-row">
      {/* Header / Sidebar Navigation */}
      <header className="h-[60px] landscape:h-screen landscape:w-[60px] flex landscape:flex-col items-center justify-between px-6 landscape:px-0 landscape:py-6 bg-theme-pane border-b landscape:border-b-0 landscape:border-r border-theme-border z-30">
        <div className="flex landscape:flex-col items-center gap-2">
          <button 
            onClick={() => setView('landing')}
            className="w-10 h-10 bg-theme-accent rounded-xl flex items-center justify-center text-white hover:opacity-80 transition-opacity"
            title={t.backToHome}
          >
            <Home size={20} />
          </button>
          <div className="hidden landscape:block h-px w-8 bg-theme-border my-2" />
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
               "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
               sidebarOpen ? "bg-theme-bg text-theme-accent" : "text-theme-muted hover:bg-theme-bg"
            )}
            title={t.gallery}
          >
            <ImageIcon size={20} />
          </button>
        </div>

        <div className="flex landscape:flex-col items-center gap-4">
          <button 
            onClick={addText}
            className="w-10 h-10 rounded-xl bg-theme-bg text-theme-dark flex items-center justify-center hover:bg-theme-border"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={handleExport}
            className="w-10 h-10 rounded-xl bg-theme-dark text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            title={t.export}
          >
            <Download size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative landscape:flex-row">
        {/* Gallery Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: sidebarOpen ? (window.innerWidth < 640 ? '100%' : 240) : 0, 
            opacity: sidebarOpen ? 1 : 0,
            x: sidebarOpen ? 0 : -20
          }}
          className={cn(
            "bg-theme-pane border-r border-theme-border overflow-hidden flex flex-col shadow-inner z-20",
            window.innerWidth < 640 && sidebarOpen && "absolute inset-0"
          )}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-[10px] uppercase tracking-[2px] text-theme-muted font-black flex-1">{t.gallery}</h2>
              <button onClick={() => setSidebarOpen(false)} className="sm:hidden p-1 text-theme-muted"><ChevronLeft size={20}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-20">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template); if(window.innerWidth < 640) setSidebarOpen(false); }}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    selectedTemplate.id === template.id ? "border-theme-accent ring-2 ring-theme-accent/20" : "border-transparent"
                  )}
                >
                  <img src={template.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Main Editor */}
        <main className="flex-1 bg-theme-bg overflow-hidden flex flex-col relative landscape:flex-row">
          <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-12 relative overflow-auto custom-scrollbar">
             {/* Logo */}
             <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
                <div className="flex items-center gap-2 bg-theme-pane/50 backdrop-blur-md px-6 py-2 rounded-full border border-theme-border shadow-sm">
                   <h3 className="font-serif font-black text-theme-dark tracking-tighter text-lg uppercase leading-none">
                     {t.logo}<span className="text-theme-accent">.</span>
                   </h3>
                   <div className="w-px h-4 bg-theme-border mx-1" />
                   <span className="text-[9px] font-black text-theme-muted tracking-widest uppercase">{t.subLogo}</span>
                </div>
             </div>

            <div className="w-full max-w-[650px] relative">
              <div 
                id="postcard-canvas"
                ref={canvasRef}
                className="relative aspect-[16/10] bg-white rounded-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden select-none w-full border border-theme-border"
              >
                <img 
                  src={selectedTemplate.url} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Stamp Decorative */}
                <div className="absolute top-6 right-6 w-14 h-18 border-2 border-dashed border-theme-border/60 rounded-sm opacity-50" />
                
                <div className="absolute inset-0 p-8 sm:p-14 overflow-hidden">
                  <AnimatePresence>
                    {textItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onMouseDown={(e) => handleDragStart(e, item.id)}
                        onTouchStart={(e) => handleDragStart(e, item.id)}
                        className={cn(
                          "absolute cursor-move transition-transform",
                          selectedTextId === item.id && "ring-2 ring-theme-accent ring-offset-4 rounded-sm"
                        )}
                        style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}
                      >
                        <div 
                          className={cn(
                             "whitespace-pre-wrap max-w-[350px] p-3 transition-all",
                             selectedTextId === item.id && "bg-white/5 backdrop-blur-[1px]"
                          )}
                          style={{ 
                            fontSize: `${item.fontSize}px`, 
                            color: item.color, 
                            fontFamily: item.fontFamily, 
                            textAlign: item.textAlign,
                            fontWeight: 500,
                            lineHeight: 1.2,
                            textShadow: item.color === '#FFFFFF' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                          }}
                        >
                          {item.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls (Responsive) */}
          <aside className="w-full landscape:w-[340px] h-[40vh] landscape:h-full bg-theme-pane border-t landscape:border-t-0 landscape:border-l border-theme-border overflow-y-auto custom-scrollbar shadow-2xl z-10 p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-8 pb-10">
             {/* AI Section (More compact for horizontal) */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] uppercase font-bold text-theme-muted tracking-wider">{t.ai}</h2>
                  <div className="flex gap-1">
                    {['en', 'zh', 'bilingual'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setAiMode(m as any)}
                        className={cn("px-2 py-0.5 text-[8px] font-bold rounded", aiMode === m ? "bg-theme-accent text-white" : "bg-[#f0f0f0] text-theme-muted")}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  value={aiPrompt} 
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full text-xs p-3 bg-theme-bg/50 border border-theme-border rounded-lg focus:outline-none h-20"
                  placeholder={t.promptPlaceholder}
                />
                <button 
                  onClick={handleAIButtonClick}
                  disabled={isGeneratingAI}
                  className="w-full py-3 bg-theme-accent text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                >
                  {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {t.generate}
                </button>
             </div>

             <div className="h-px bg-theme-border" />

             {/* Formatting */}
             <div className="space-y-4">
                <h2 className="text-[10px] uppercase font-bold text-theme-muted tracking-wider">{t.editor}</h2>
                {selectedItem ? (
                  <div className="space-y-6">
                    <textarea 
                      value={selectedItem.content}
                      onChange={(e) => updateSelectedText({ content: e.target.value })}
                      className="w-full text-xs p-3 border border-theme-border rounded-lg h-20"
                    />
                    
                    <div className="grid grid-cols-4 gap-2">
                       {FONTS.map(f => (
                         <button 
                          key={f.name}
                          onClick={() => updateSelectedText({ fontFamily: f.value })}
                          className={cn("h-10 border rounded flex items-center justify-center text-lg", selectedItem.fontFamily === f.value ? "border-theme-accent bg-theme-bg" : "border-theme-border")}
                          style={{ fontFamily: f.value }}
                         >A</button>
                       ))}
                    </div>

                    <div className="flex items-center gap-4">
                       <input type="range" min="12" max="80" value={selectedItem.fontSize} onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) })} className="flex-1 accent-theme-accent" />
                       <div className="flex gap-1">
                          {[AlignLeft, AlignCenter, AlignRight].map((Icon, idx) => {
                             const align = ['left', 'center', 'right'][idx] as any;
                             return (
                               <button key={idx} onClick={() => updateSelectedText({ textAlign: align })} className={cn("p-1.5 rounded", selectedItem.textAlign === align ? "bg-theme-accent/10 text-theme-accent" : "text-theme-muted")}>
                                 <Icon size={16} />
                               </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => updateSelectedText({ color: c })} className={cn("w-5 h-5 rounded-full border border-theme-border", selectedItem.color === c && "ring-2 ring-theme-accent ring-offset-1")} style={{ backgroundColor: c }} />
                      ))}
                    </div>

                    <button onClick={() => removeText(selectedItem.id)} className="w-full py-2 bg-red-50 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      <Trash2 size={14} /> {language === 'en' ? 'Delete' : '删除'}
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-theme-muted italic">{t.noTextSelected}</p>
                )}
             </div>
          </div>
        </aside>
      </main>
    </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-theme-bg);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-theme-border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-theme-muted);
        }
      `}</style>
    </div>
  );
}
