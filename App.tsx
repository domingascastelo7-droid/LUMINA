
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Home, Image as ImageIcon, Film, Music, Settings, X, Play, FolderOpen, Globe, Plus, Tv, Activity, 
  ArrowRight, SortAsc, Heart, Loader2, Sparkles, Library, Layers, CheckCircle2, LayoutGrid, 
  Brain, Zap, Volume2, Subtitles, Monitor, Settings2, Pause, RotateCw, Wind, Link as LinkIcon, RefreshCcw, Trash2
} from 'lucide-react';
import { MOCK_MEDIA } from './mockData';
import { MediaItem, NavigationSection, NavState, MediaType, Album, ViewMode, NetworkSource } from './types';
import { gemini } from './services/geminiService';

const SIDEBAR_ITEMS = [
  { id: 'all', label: 'Início', icon: Home },
  { id: 'ai_hub', label: 'Inteligência', icon: Brain },
  { id: 'albums', label: 'Coleções', icon: Library },
  { id: 'sources', label: 'Fontes de Rede', icon: Globe },
  { id: 'image', label: 'Fotos', icon: ImageIcon },
  { id: 'video', label: 'Vídeos', icon: Film },
  { id: 'audio', label: 'Áudio', icon: Music },
  { id: 'files', label: 'Arquivos', icon: FolderOpen },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

const VIDEO_RESOLUTIONS = ['Auto', '4K (2160p)', '1080p', '720p', '480p'];
const PHOTO_ROTATIONS = ['0°', '90°', '180°', '270°'];
const PHOTO_TRANSITIONS = ['Suave (Fade)', 'Impacto (Zoom)', 'Nenhum'];

const App: React.FC = () => {
  // Navigation State
  const [navState, setNavState] = useState<NavState>({
    section: NavigationSection.SIDEBAR,
    sidebarIndex: 0,
    contentIndex: 0,
    headerIndex: 0,
    pickerIndex: 0,
    playerControlIndex: 0,
    playerOptionIndex: 0
  });
  
  // Data States
  const [userMedia, setUserMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [networkSources, setNetworkSources] = useState<NetworkSource[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [sourceViewMode, setSourceViewMode] = useState<'content' | 'manager'>('content');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Playback States
  const [isPlayerSettingsOpen, setIsPlayerSettingsOpen] = useState(false);
  const [activeRes, setActiveRes] = useState('Auto');
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeRotation, setActiveRotation] = useState(0); 
  const [isSwitchingRes, setIsSwitchingRes] = useState(false);

  // IA States
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // UI States
  const [overlayRect, setOverlayRect] = useState<{ top: number; left: number; width: number; height: number; borderRadius: string } | null>(null);
  const [isAddingStream, setIsAddingStream] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isPickingAlbum, setIsPickingAlbum] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamName, setStreamName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Persistência e Limpeza
  useEffect(() => {
    const savedMedia = localStorage.getItem('lumina_media');
    const savedAlbums = localStorage.getItem('lumina_albums');
    const savedSources = localStorage.getItem('lumina_sources');
    if (savedMedia) setUserMedia(JSON.parse(savedMedia));
    if (savedAlbums) setAlbums(JSON.parse(savedAlbums));
    if (savedSources) setNetworkSources(JSON.parse(savedSources));

    return () => {
      // Limpeza de Blob URLs para evitar vazamento de memória
      userMedia.forEach(m => { if (m.url.startsWith('blob:')) URL.revokeObjectURL(m.url); });
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_media', JSON.stringify(userMedia));
    localStorage.setItem('lumina_albums', JSON.stringify(albums));
    localStorage.setItem('lumina_sources', JSON.stringify(networkSources));
  }, [userMedia, albums, networkSources]);

  // Helpers
  const extractVideoFrame = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl; video.crossOrigin = "anonymous"; video.currentTime = 2;
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640; canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
        } else reject('Canvas failure');
      };
      video.onerror = () => reject('Video load failure');
    });
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach(async (file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      if (!isVideo && !isImage && !isAudio) return;

      const url = URL.createObjectURL(file);
      const id = `file-${Date.now()}-${Math.random()}`;
      let thumbnail = isImage ? url : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400';

      const newItem: MediaItem = {
        id, url, thumbnail, title: file.name, type: isImage ? 'image' : isVideo ? 'video' : 'audio',
        description: `Importado de: ${file.webkitRelativePath || 'Dispositivo'}`,
        category: 'Local', date: new Date().toISOString().split('T')[0], source: 'usb',
        folder: file.webkitRelativePath.split('/')[0] || 'Raiz'
      };

      setUserMedia(prev => [newItem, ...prev]);

      if (isVideo) {
        try {
          const frame = await extractVideoFrame(url);
          const aiThumb = await gemini.generateAiThumbnail(frame, file.name);
          if (aiThumb) setUserMedia(prev => prev.map(m => m.id === id ? { ...m, thumbnail: aiThumb } : m));
        } catch (e) { console.error(e); }
      }
    });
  };

  const fetchAiDescription = useCallback(async (media: MediaItem) => {
    if (media.aiDescription) { setAiDescription(media.aiDescription); return; }
    setIsLoadingAi(true); setAiDescription("Consultando Lumina Brain...");
    const desc = await gemini.describeMedia(media.url, media.type);
    setAiDescription(desc);
    setUserMedia(prev => prev.map(m => m.id === media.id ? { ...m, aiDescription: desc } : m));
    setIsLoadingAi(false);
  }, []);

  const filteredMedia = useMemo(() => {
    const activeId = SIDEBAR_ITEMS[navState.sidebarIndex].id;
    let base = [...MOCK_MEDIA, ...userMedia];
    if (activeId === 'ai_hub') return base.filter(m => !m.aiDescription);
    if (activeId === 'albums' && selectedAlbum) return base.filter(m => selectedAlbum.mediaIds.includes(m.id));
    if (activeId === 'sources') return base.filter(m => m.sourceId || m.type === 'stream');
    if (activeId === 'all') return base;
    return base.filter(m => m.type === activeId);
  }, [navState.sidebarIndex, userMedia, selectedAlbum]);

  // Keyboard/Remote Navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isAddingStream || isCreatingAlbum || isPickingAlbum || isBulkProcessing) {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        setIsAddingStream(false); setIsCreatingAlbum(false); setIsPickingAlbum(false);
      }
      return;
    }

    setNavState(prev => {
      const newState = { ...prev };
      const COLS = viewMode === 'grid' ? 4 : 1;

      if (selectedMedia) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          if (isPlayerSettingsOpen) setIsPlayerSettingsOpen(false);
          else { setSelectedMedia(null); setActiveRotation(0); }
        }
        if (e.key === 'Enter') setIsPlayerSettingsOpen(!isPlayerSettingsOpen);
        return newState;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (newState.section === NavigationSection.CONTENT) {
            if (newState.contentIndex < COLS) newState.section = NavigationSection.HEADER;
            else newState.contentIndex -= COLS;
          } else if (newState.section === NavigationSection.SIDEBAR) {
            newState.sidebarIndex = Math.max(0, newState.sidebarIndex - 1);
          }
          break;
        case 'ArrowDown':
          if (newState.section === NavigationSection.SIDEBAR) {
            newState.sidebarIndex = Math.min(SIDEBAR_ITEMS.length - 1, newState.sidebarIndex + 1);
          } else if (newState.section === NavigationSection.HEADER) {
            newState.section = NavigationSection.CONTENT;
          } else if (newState.section === NavigationSection.CONTENT) {
            newState.contentIndex = Math.min(filteredMedia.length - 1, newState.contentIndex + COLS);
          }
          break;
        case 'ArrowLeft':
          if (newState.section === NavigationSection.CONTENT && newState.contentIndex % COLS === 0) newState.section = NavigationSection.SIDEBAR;
          else if (newState.section === NavigationSection.CONTENT) newState.contentIndex -= 1;
          else if (newState.section === NavigationSection.HEADER) newState.section = NavigationSection.SIDEBAR;
          break;
        case 'ArrowRight':
          if (newState.section === NavigationSection.SIDEBAR) newState.section = NavigationSection.CONTENT;
          else if (newState.section === NavigationSection.CONTENT) newState.contentIndex = Math.min(filteredMedia.length - 1, newState.contentIndex + 1);
          break;
        case 'Enter':
          if (newState.section === NavigationSection.CONTENT && filteredMedia[newState.contentIndex]) {
            const media = filteredMedia[newState.contentIndex];
            setSelectedMedia(media);
            fetchAiDescription(media);
          }
          break;
      }
      return newState;
    });
  }, [filteredMedia, isAddingStream, isCreatingAlbum, isPickingAlbum, isBulkProcessing, selectedMedia, isPlayerSettingsOpen, fetchAiDescription, viewMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update Overlay focus
  useEffect(() => {
    const updateFocus = () => {
      let selector = '';
      if (navState.section === NavigationSection.SIDEBAR) selector = `.sidebar-item-${navState.sidebarIndex}`;
      else if (navState.section === NavigationSection.CONTENT) selector = `.content-item-${navState.contentIndex}`;
      
      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setOverlayRect({ top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: '1.5rem' });
      }
    };
    updateFocus();
    const t = setTimeout(updateFocus, 100);
    return () => clearTimeout(t);
  }, [navState, filteredMedia]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020617] text-slate-100 font-inter">
      <input type="file" ref={folderInputRef} className="hidden" 
        // @ts-ignore
        webkitdirectory="true" directory="true" multiple onChange={handleFolderUpload}
      />

      {/* Navegação Overlay de Foco */}
      {overlayRect && !selectedMedia && (
        <div className="focus-overlay visible" style={{ ...overlayRect }} />
      )}

      {/* Sidebar Luxo */}
      <aside className={`w-80 border-r border-white/5 flex flex-col z-20 sidebar-glass bg-slate-900/40 backdrop-blur-2xl transition-opacity duration-500 ${navState.section !== NavigationSection.SIDEBAR ? 'opacity-50' : 'opacity-100'}`}>
        <div className="p-12 flex items-center space-x-4">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20"><Tv className="text-white" /></div>
          <div><h1 className="text-2xl font-black tracking-tighter">LUMINA</h1><span className="text-[8px] font-bold tracking-[0.3em] text-sky-500 uppercase">Premium TV Hub</span></div>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          {SIDEBAR_ITEMS.map((item, idx) => (
            <div key={item.id} className={`sidebar-item-${idx} flex items-center space-x-5 p-5 rounded-2xl transition-all duration-300 ${navState.sidebarIndex === idx ? 'bg-white/5 text-white' : 'text-slate-500'}`}>
              <item.icon size={24} strokeWidth={navState.sidebarIndex === idx ? 2.5 : 2} />
              <span className="text-xl font-bold">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 flex flex-col p-16 overflow-hidden">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-sky-500 mb-2"><Activity size={16} /><span className="text-xs font-black uppercase tracking-widest">Sincronizado</span></div>
            <h2 className="text-7xl font-black tracking-tighter">{SIDEBAR_ITEMS[navState.sidebarIndex].label}</h2>
          </div>
          <button onClick={() => folderInputRef.current?.click()} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-sky-500 transition-all flex items-center space-x-4">
            <Plus size={24} /><span className="font-bold text-lg uppercase tracking-tighter">Adicionar</span>
          </button>
        </header>

        <div className="grid grid-cols-4 gap-10 overflow-y-auto no-scrollbar pb-32">
          {filteredMedia.map((media, idx) => (
            <div key={media.id} className={`content-item-${idx} grid-item-enter relative aspect-video rounded-[1.8rem] overflow-hidden transition-all duration-500 ${navState.contentIndex === idx && navState.section === NavigationSection.CONTENT ? 'scale-105 z-10 shadow-2xl ring-4 ring-sky-500/50' : 'opacity-60 scale-95'}`}>
              <img src={media.thumbnail} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end p-6">
                <h3 className="font-bold text-xl truncate">{media.title}</h3>
                <span className="text-sky-400 text-[10px] font-black uppercase">{media.type}</span>
              </div>
            </div>
          ))}
          {filteredMedia.length === 0 && (
            <div className="col-span-4 py-32 text-center opacity-20">
              <FolderOpen size={80} className="mx-auto mb-6" />
              <p className="text-3xl font-bold">Nenhuma mídia encontrada nesta seção</p>
            </div>
          )}
        </div>
      </main>

      {/* Player Avançado */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in zoom-in duration-500">
          {/* Header do Player */}
          <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-10 pointer-events-none">
            <div className="flex items-center space-x-6 bg-black/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5">
              <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center">
                {selectedMedia.type === 'video' ? <Film size={32} /> : selectedMedia.type === 'audio' ? <Music size={32} /> : <ImageIcon size={32} />}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter">{selectedMedia.title}</h2>
                <p className="text-sky-400 text-xs font-bold uppercase tracking-widest">{selectedMedia.category} • {selectedMedia.date}</p>
              </div>
            </div>
            <button onClick={() => setSelectedMedia(null)} className="p-8 bg-red-500/20 text-red-500 rounded-full border border-red-500/20 pointer-events-auto"><X size={32} /></button>
          </div>

          <div className="flex-1 flex">
            {/* Área de Visualização Principal */}
            <div className="flex-[3] flex items-center justify-center p-20 relative">
              {selectedMedia.type === 'video' && (
                <video ref={videoRef} src={selectedMedia.url} autoPlay className="max-h-full rounded-[2rem] shadow-2xl shadow-black/50" controls />
              )}
              {selectedMedia.type === 'image' && (
                <img src={selectedMedia.url} className="max-w-full max-h-full object-contain rounded-xl transition-transform duration-700" style={{ transform: `rotate(${activeRotation}deg)` }} alt="" />
              )}
              {selectedMedia.type === 'audio' && (
                <div className="flex flex-col items-center space-y-12">
                   <div className="w-96 h-96 rounded-[3rem] bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-2xl animate-pulse">
                      <Music size={120} className="text-white" />
                   </div>
                   <div className="flex space-x-2">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-2 bg-sky-500 rounded-full animate-bounce" style={{ height: `${Math.random()*40 + 20}px`, animationDelay: `${i*0.1}s` }} />)}
                   </div>
                   <audio ref={audioRef} src={selectedMedia.url} autoPlay controls className="w-[40rem]" />
                </div>
              )}
            </div>

            {/* Painel lateral de IA */}
            <aside className="w-[40rem] bg-slate-900/60 border-l border-white/5 p-20 flex flex-col justify-center space-y-12 backdrop-blur-3xl">
              <section className="space-y-6">
                <div className="inline-flex items-center space-x-3 px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/10 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles size={14} /> <span>Lumina IA Insight</span>
                </div>
                {isLoadingAi ? (
                  <div className="flex items-center space-x-4 text-slate-400">
                    <Loader2 className="animate-spin" />
                    <span className="text-2xl font-bold animate-pulse">Tecendo análise poética...</span>
                  </div>
                ) : (
                  <p className="text-4xl font-serif italic text-slate-200 leading-snug">"{aiDescription}"</p>
                )}
              </section>

              <div className="pt-12 border-t border-white/5 grid grid-cols-2 gap-8 text-slate-500">
                <div><span className="text-[10px] font-black uppercase block mb-1">Origem</span><p className="text-xl font-bold text-white">{selectedMedia.source?.toUpperCase()}</p></div>
                <div><span className="text-[10px] font-black uppercase block mb-1">Formato</span><p className="text-xl font-bold text-white">{selectedMedia.type.toUpperCase()}</p></div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Modal de Processamento em Massa */}
      {isBulkProcessing && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-24">
          <div className="w-full max-w-4xl text-center space-y-12">
            <div className="relative inline-block">
              <div className="w-64 h-64 border-4 border-sky-500/20 rounded-full animate-spin border-t-sky-500" />
              <Brain size={80} className="absolute inset-0 m-auto text-sky-400" />
            </div>
            <h2 className="text-6xl font-black tracking-tighter">LUMINA INTELLIGENCE ACTIVE</h2>
            <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${bulkProgress}%` }} />
            </div>
            <p className="text-2xl text-slate-400 font-bold uppercase tracking-widest">{bulkProgress}% Processado</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
