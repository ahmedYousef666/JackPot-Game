
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Play, RefreshCcw, Sparkles, Settings2, Download } from 'lucide-react';
import { TextList, SpinResult } from './types';
import ListManager from './components/ListManager';
import SlotMachine from './components/SlotMachine';

const DEFAULT_LISTS: TextList[] = [
  {
    id: '1',
    title: 'الفاعل',
    items: ['قطة', 'رائد فضاء', 'مبرمج', 'طباخ', 'تنين'],
    rawText: 'قطة\nرائد فضاء\nمبرمج\nطباخ\nتنين'
  },
  {
    id: '2',
    title: 'الفعل',
    items: ['يأكل', 'يبرمج', 'يرقص', 'يطير فوق', 'يكتب'],
    rawText: 'يأكل\nيبرمج\nيرقص\nيطير فوق\nيكتب'
  },
  {
    id: '3',
    title: 'المفعول به',
    items: ['بيتزا ببروني', 'تطبيق ذكاء اصطناعي', 'سحابة وردية', 'كتاب سحري', 'لابتوب'],
    rawText: 'بيتزا ببروني\nتطبيق ذكاء اصطناعي\nسحابة وردية\nكتاب سحري\nلابتوب'
  }
];

const App: React.FC = () => {
  const [lists, setLists] = useState<TextList[]>(DEFAULT_LISTS);
  const [results, setResults] = useState<SpinResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const addList = () => {
    const newList: TextList = {
      id: Math.random().toString(36).substr(2, 9),
      title: `قائمة جديدة ${lists.length + 1}`,
      items: [],
      rawText: ''
    };
    setLists([...lists, newList]);
  };

  const removeList = (id: string) => {
    if (lists.length <= 1) return;
    setLists(lists.filter(l => l.id !== id));
  };

  const updateList = (id: string, updates: Partial<TextList>) => {
    setLists(lists.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const spin = useCallback(() => {
    if (isSpinning) return;
    
    const emptyLists = lists.filter(l => l.items.length === 0);
    if (emptyLists.length > 0) {
      alert("يرجى التأكد من ملء جميع القوائم بالكلمات أولاً");
      return;
    }

    setIsSpinning(true);
    
    const newResults: SpinResult[] = lists.map(list => ({
      listId: list.id,
      selectedItem: list.items[Math.floor(Math.random() * list.items.length)]
    }));

    setTimeout(() => {
      setResults(newResults);
      setIsSpinning(false);
      // الاهتزاز عند الانتهاء (لو متاح على الجوال)
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    }, 2000);
  }, [lists, isSpinning]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 overflow-x-hidden pb-24">
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-indigo-400 to-purple-400">
              ماكينة الحظ
            </h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-900/20"
            >
              <Download className="w-4 h-4" />
              تثبيت التطبيق
            </button>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full transition-colors border ${showSettings ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
          >
            <Settings2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-8">
          <SlotMachine 
            lists={lists} 
            results={results} 
            isSpinning={isSpinning} 
          />
          
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`
              group relative flex items-center gap-4 px-10 py-4 md:px-12 md:py-5 rounded-full text-xl md:text-2xl font-bold transition-all duration-300
              ${isSpinning 
                ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)]'
              }
            `}
          >
            {isSpinning ? (
              <>
                <RefreshCcw className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                <span>سحب...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                <span>SPIN</span>
              </>
            )}
          </button>
        </div>

        {results.length > 0 && !isSpinning && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 py-6 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-2xl md:text-5xl font-extrabold text-center leading-tight">
              {results.map((res, idx) => (
                <React.Fragment key={res.listId}>
                  <span className="px-3 py-1 md:px-4 md:py-2 bg-slate-900 rounded-xl md:rounded-2xl border border-slate-700 shadow-xl text-indigo-400">
                    {res.selectedItem}
                  </span>
                  {idx < results.length - 1 && <span className="text-slate-600 text-xl">+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {showSettings && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-400">
                إعدادات القوائم
              </h2>
              <button
                onClick={addList}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-600/30 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة قائمة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {lists.map((list) => (
                <ListManager 
                  key={list.id} 
                  list={list} 
                  onUpdate={(updates) => updateList(list.id, updates)}
                  onRemove={() => removeList(list.id)}
                  isRemovable={lists.length > 1}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-600 text-xs">
        <p>Jackpot Engine v1.0 • PWA Ready</p>
      </footer>
    </div>
  );
};

export default App;
