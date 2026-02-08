import React, { useEffect, useState, useRef } from 'react';
import { fetchManga, deleteManga, addManga, updateManga } from '../services/api';
import toast from 'react-hot-toast'; 
import { useNavigate } from 'react-router-dom';
import { 
  Search, LogOut, ShieldCheck, Clapperboard, 
  Star, Trash2, Pencil, Plus, 
  TrendingUp, Clock, Activity, Sparkles, X, User, Filter, ChevronDown, Database
} from 'lucide-react';

const Dashboard = () => {
    const [mangas, setMangas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); 
    const [vaultFilter, setVaultFilter] = useState('All'); 
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState('All Authors');
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [isAuthorOpen, setIsAuthorOpen] = useState(false);
    const [selectedManga, setSelectedManga] = useState(null); 
    const [mangaToDelete, setMangaToDelete] = useState(null); 
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [glitch, setGlitch] = useState(false); 
    
    const navigate = useNavigate();
    const genreRef = useRef(null);
    const authorRef = useRef(null);

    const loadData = async () => {
        try {
            const { data } = await fetchManga();
            setMangas(data);
        } catch (err) {
            toast.error("DATA_LINK_FAILURE");
            if (err.response?.status === 401) navigate('/');
        }
    };

    const triggerGlitch = () => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 300);
    };

    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const controlNavbar = () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) { setIsVisible(false); }
        else { setIsVisible(true); }
        setLastScrollY(window.scrollY);
    };

    useEffect(() => {
        loadData();
        window.addEventListener('scroll', controlNavbar);
        const handleClickOutside = (e) => {
            if (genreRef.current && !genreRef.current.contains(e.target)) setIsGenreOpen(false);
            if (authorRef.current && !authorRef.current.contains(e.target)) setIsAuthorOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', controlNavbar);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [lastScrollY]);

    const totalManga = mangas.length;
    const readingCount = mangas.filter(m => m.readStatus === 'Reading').length;
    const avgRating = mangas.length > 0 
        ? (mangas.reduce((acc, m) => acc + (Number(m.rating) || 0), 0) / mangas.length).toFixed(1) 
        : "0.0";
    const completionPercentage = totalManga > 0 ? Math.round((mangas.filter(m => m.readStatus === 'Completed').length / totalManga) * 100) : 0;

    const allGenres = [...new Set(mangas.flatMap(m => Array.isArray(m.genre) ? m.genre : []))];
    const allAuthors = ['All Authors', ...new Set(mangas.map(m => m.author).filter(Boolean))];

    const toggleGenre = (genre) => {
        setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
        triggerGlitch();
    };

    const toggleFavourite = async (e, manga) => {
        e.stopPropagation();
        try {
            const updatedData = { ...manga, isFavourite: !manga.isFavourite };
            await updateManga(manga._id, updatedData);
            loadData();
            toast.success(!manga.isFavourite ? "ID_STARRED" : "ID_UNSTARRED");
        } catch (err) { toast.error("SYNC_ERROR"); }
    };

    const handleAddManga = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.genre = data.genre.split(',').map(g => g.trim());
        try {
            await addManga(data);
            toast.success("Entry Archived"); 
            e.target.reset();
            document.getElementById('add_modal').close();
            loadData();
        } catch (err) { toast.error("WRITE_ERROR"); }
    };

    const handleUpdateManga = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.genre = data.genre.split(',').map(g => g.trim());
        try {
            await updateManga(selectedManga._id, data);
            toast.success(`${data.title} updated successfully`); 
            document.getElementById('edit_modal').close();
            loadData();
        } catch (err) { toast.error("UPDATE_DENIED"); }
    };

    const confirmDelete = async () => {
        const deletedTitle = mangaToDelete?.title;
        try {
            await deleteManga(mangaToDelete._id);
            toast.success(`${deletedTitle} deleted successfully`); 
            document.getElementById('delete_modal').close();
            setMangaToDelete(null);
            loadData();
        } catch (err) { toast.error("PURGE_FAIL"); }
    };

    const filteredManga = mangas.filter(m => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = m.title.toLowerCase().includes(searchLower) || (m.author && m.author.toLowerCase().includes(searchLower));
        const matchesStatus = filterStatus === 'All' || m.readStatus === filterStatus;
        let matchesVault = true;
        if (vaultFilter === 'Recommended') matchesVault = m.rating >= 8;
        if (vaultFilter === 'Starred') matchesVault = m.isFavourite;
        const matchesAuthor = selectedAuthor === 'All Authors' || m.author === selectedAuthor;
        const matchesGenres = selectedGenres.length === 0 || selectedGenres.every(g => Array.isArray(m.genre) ? m.genre.includes(g) : m.genre === g);
        return matchesSearch && matchesStatus && matchesVault && matchesAuthor && matchesGenres;
    });

    return (
        <div className="min-h-screen bg-[#030712] text-slate-200 font-sans pb-80 relative overflow-x-hidden" onMouseMove={handleMouseMove}>
            
            <style>
                {`
                    @keyframes glitch {
                        0% { transform: translate(0); text-shadow: -2px 0 #ff00c1, 2px 0 #00fff9; }
                        25% { transform: translate(-2px, 2px); }
                        50% { transform: translate(2px, -2px); text-shadow: 2px 0 #ff00c1, -2px 0 #00fff9; }
                        75% { transform: translate(-2px, -1px); }
                        100% { transform: translate(0); }
                    }
                    @keyframes cardEnter {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .glitch-active { animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite; }
                    .bg-grain { background-image: url("https://www.transparenttextures.com/patterns/black-linen.png"); }
                    .card-animate { animation: cardEnter 0.6s ease forwards; }
                `}
            </style>

            <div className="fixed inset-0 z-0 bg-grain opacity-[0.05] pointer-events-none"></div>
            <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="pointer-events-none fixed inset-0 z-0 opacity-40 transition-opacity duration-500"
                style={{ background: `radial-gradient(1000px at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.12), transparent 80%)` }}
            />

            <nav className={`fixed top-8 left-0 right-0 z-[100] mx-auto w-[94%] transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-40 opacity-0'}`}>
                <div className="bg-[#0a0a0c]/60 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] px-10 py-5 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex justify-between items-center">
                    <div className="flex items-center gap-5 group cursor-pointer">
                        <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[1.2rem] flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:rotate-[360deg] transition-all duration-1000">
                            <Clapperboard className="text-black w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">Manga<span className="text-cyan-400">Zone</span></span>
                            <span className="text-[8px] font-black tracking-[0.6em] text-cyan-500/40 uppercase mt-1">Archive System v4.0</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="relative group hidden xl:block">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-500/20 group-focus-within:text-cyan-400 w-4 h-4" strokeWidth={3} />
                            <input 
                                type="text" 
                                placeholder="SEARCH DATA VAULT..." 
                                className="input h-14 bg-white/[0.02] border border-white/[0.08] rounded-2xl w-[450px] pl-16 focus:border-cyan-500/40 focus:bg-white/[0.05] text-[11px] font-black tracking-[0.25em] transition-all outline-none uppercase text-white shadow-inner" 
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); triggerGlitch();}} 
                            />
                        </div>
                        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 hover:border-rose-500/40 transition-all flex items-center justify-center">
                            <LogOut size={18} className="text-slate-500 hover:text-rose-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="p-8 pt-52 max-w-[1600px] mx-auto relative z-10">
                
                {/* BENTO CONTROL TERMINAL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-24 relative z-[150]">
                    <div className="lg:col-span-8 bg-slate-900/20 border border-white/[0.05] rounded-[3.5rem] p-5 flex flex-wrap items-center gap-6 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-3 p-2 bg-black/40 rounded-[2.2rem] border border-white/[0.05]">
                            {[{ id: 'All', icon: <Database size={16} />, label: 'Archive' }, { id: 'Recommended', icon: <Sparkles size={16} />, label: 'Top' }, { id: 'Starred', icon: <Star size={16} />, label: 'Fav' }].map((v) => (
                                <button key={v.id} onClick={() => { setVaultFilter(v.id); triggerGlitch(); }} className={`flex items-center gap-2 px-6 py-4 rounded-[1.6rem] transition-all duration-500 font-black text-[10px] uppercase tracking-widest ${vaultFilter === v.id ? 'bg-cyan-500 text-black shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'bg-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}>
                                    {v.icon} <span className="hidden sm:inline">{v.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative" ref={genreRef}>
                                <button onClick={() => setIsGenreOpen(!isGenreOpen)} className="flex items-center gap-4 px-8 h-16 bg-white/[0.03] border border-white/[0.05] rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
                                    <Filter size={14} className="text-cyan-400" />
                                    GENRE {selectedGenres.length > 0 && <span className="bg-cyan-500 text-black px-2 rounded ml-1 font-black">{selectedGenres.length}</span>}
                                </button>
                                {isGenreOpen && (
                                    <div className="absolute top-20 left-0 w-72 bg-[#0a0a0c] border border-white/[0.08] rounded-[2.5rem] p-6 z-[200] shadow-[0_50px_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 backdrop-blur-3xl">
                                        <div className="max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                                            {allGenres.map(g => (
                                                <div key={g} onClick={() => toggleGenre(g)} className={`flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer transition-all ${selectedGenres.includes(g) ? 'bg-cyan-500 text-black font-black' : 'hover:bg-white/5 text-slate-400 font-bold'}`}>
                                                    <span className="text-[11px] uppercase tracking-tighter">{g}</span>
                                                    {selectedGenres.includes(g) && <X size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={authorRef}>
                                <button onClick={() => setIsAuthorOpen(!isAuthorOpen)} className="flex items-center gap-4 px-8 h-16 bg-white/[0.03] border border-white/[0.05] rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.08] transition-all">
                                    <User size={14} className="text-cyan-400" /> {selectedAuthor}
                                </button>
                                {isAuthorOpen && (
                                    <div className="absolute top-20 left-0 w-80 bg-[#0a0a0c] border border-white/[0.08] rounded-[2.5rem] p-6 z-[200] shadow-[0_50px_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 backdrop-blur-3xl">
                                        <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-hide">
                                            {allAuthors.map(a => (
                                                <div key={a} onClick={() => { setSelectedAuthor(a); setIsAuthorOpen(false); triggerGlitch(); }} className={`px-5 py-4 rounded-2xl cursor-pointer text-[11px] uppercase transition-all ${selectedAuthor === a ? 'bg-cyan-500 text-black font-black' : 'hover:bg-white/5 text-slate-400 font-bold'}`}>{a}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-slate-900/20 border border-white/[0.05] rounded-[3.5rem] p-5 flex items-center justify-between backdrop-blur-xl">
                        <div className="flex bg-black/50 p-2 rounded-[2rem] border border-white/[0.05] w-full">
                            {['All', 'Reading', 'Completed'].map(status => (
                                <button key={status} onClick={() => { setFilterStatus(status); triggerGlitch(); }} className={`flex-1 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${filterStatus === status ? 'bg-white/10 text-cyan-400 shadow-lg border border-white/5' : 'text-slate-600 hover:text-white'}`}>{status}</button>
                            ))}
                        </div>
                        <button className="ml-5 w-16 h-16 bg-cyan-500 rounded-[2rem] flex items-center justify-center text-black shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-110 transition-all duration-700" onClick={() => document.getElementById('add_modal').showModal()}>
                            <Plus size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                <div className="mb-20">
                    <h1 className={`text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none opacity-90 ${glitch ? 'glitch-active' : ''}`}>
                        {vaultFilter === 'All' ? 'System' : vaultFilter}<span className="text-cyan-500">.</span>Archive
                    </h1>
                    <div className="flex items-center gap-4 mt-6">
                         <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                         <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] italic">
                            Found {filteredManga.length} Manga based on your search
                        </p>
                    </div>
                </div>

                {/* HOLOGRAPHIC GRID WITH CASCADE ANIMATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-12 gap-y-28 min-h-[600px] relative z-10">
                    {filteredManga.map((m, idx) => (
                        <div 
                            key={m._id + filterStatus + vaultFilter + searchTerm} 
                            className="group perspective-card relative card-animate" 
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <div className="absolute -inset-2 bg-cyan-500/10 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative aspect-[3/4.6] overflow-hidden rounded-[3.2rem] border border-white/[0.08] bg-[#0d0d0f] shadow-2xl transition-all duration-700 group-hover:-translate-y-6 group-hover:border-cyan-500/30">
                                <img src={m.posterUrl || 'https://via.placeholder.com/300x450'} alt={m.title} className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-transparent opacity-90" />
                                <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-20">
                                    <div className="bg-black/80 backdrop-blur-2xl border border-white/10 px-5 py-2 rounded-2xl flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${m.readStatus === 'Completed' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-cyan-50 animate-pulse shadow-[0_0_15px_#06b6d4]'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{m.readStatus}</span>
                                    </div>
                                    <button onClick={(e) => toggleFavourite(e, m)} className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center border border-white/10 transition-all duration-500 ${m.isFavourite ? 'bg-cyan-500 text-black shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-110' : 'bg-black/60 backdrop-blur-2xl text-white hover:bg-white hover:text-black'}`}>
                                        <Star size={20} fill={m.isFavourite ? "black" : "none"} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <div className="absolute bottom-12 left-12 right-12 z-20">
                                    <div className="flex gap-2 mb-4 font-black uppercase tracking-widest text-[9px] italic">
                                        <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">⭐ SCR: {m.rating}</div>
                                        <div className="px-3 py-1.5 bg-white/5 border border-white/5 text-white/40">{m.chapters} CH.</div>
                                    </div>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-[0.85] mb-8 group-hover:text-cyan-400 transition-colors duration-500 line-clamp-2">{m.title}</h2>
                                    <div className="flex items-center justify-between pt-8 border-t border-white/[0.05]">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 leading-none">Author</span>
                                            <span className="text-[11px] font-bold text-white/70 truncate max-w-[140px] italic">{m.author || "UNKNOWN"}</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedManga(m); document.getElementById('edit_modal').showModal(); }} className="p-4 bg-white/[0.03] hover:bg-cyan-500 transition-all rounded-2xl hover:text-black shadow-xl"><Pencil size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); setMangaToDelete(m); document.getElementById('delete_modal').showModal(); }} className="p-4 bg-white/[0.03] hover:bg-rose-600 transition-all rounded-2xl hover:text-white shadow-xl"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-[100] bg-[#030712]/90 backdrop-blur-3xl border-t border-white/[0.05] p-10">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="flex items-center gap-8 border-r border-white/[0.05]">
                        <div className="p-5 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] text-cyan-500 shadow-inner"><TrendingUp /></div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">Vault_Capacity</span>
                            <span className="text-5xl font-black italic tracking-tighter leading-none text-white mt-3">{totalManga}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 border-r border-white/[0.05]">
                        <div className="relative flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/[0.03]" />
                                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={263.8} strokeDashoffset={263.8 - (263.8 * completionPercentage) / 100} strokeLinecap="round" className="text-cyan-500 transition-all duration-[2.5s] shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                            </svg>
                            <span className="absolute text-sm font-black text-white italic">{completionPercentage}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">Efficiency</span>
                            <span className="text-4xl font-black italic tracking-tighter text-white mt-3">{readingCount} Active</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 border-r border-white/[0.05]">
                        <div className="p-5 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] text-cyan-500"><Activity className="animate-pulse" /></div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">Archiving</span>
                            <span className="text-5xl font-black italic tracking-tighter text-white mt-3">{mangas.filter(m => m.readStatus === 'Plan to Read').length}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="p-5 bg-white/[0.02] rounded-[2rem] border border-white/[0.05] text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]"><ShieldCheck /></div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] leading-none">Global_Rank</span>
                            <span className="text-5xl font-black italic tracking-tighter text-cyan-400 mt-3">{avgRating}</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MODALS */}
            <dialog id="add_modal" className="modal backdrop-blur-3xl">
                <div className="modal-box bg-[#0a0a0c] border border-white/[0.08] rounded-[4rem] p-16 max-w-2xl shadow-2xl">
                    <h3 className="text-3xl font-black uppercase italic text-white mb-10 tracking-tighter underline decoration-cyan-500 decoration-4">New_Record</h3>
                    <form onSubmit={handleAddManga} className="grid grid-cols-1 gap-6">
                        <input name="title" type="text" placeholder="TITLE" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white uppercase text-xs shadow-inner" required />
                        <div className="grid grid-cols-2 gap-6">
                            <input name="author" type="text" placeholder="AUTHOR" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase" required />
                            <input name="chapters" type="number" placeholder="CHAPTERS" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase" required />
                        </div>
                        <input name="genre" type="text" placeholder="GENRES" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase" required />
                        <div className="grid grid-cols-2 gap-6">
                            <input name="type" type="text" placeholder="TYPE" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase" required />
                            <input name="rating" type="number" min="1" max="10" placeholder="RATING" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase" required />
                        </div>
                        <select name="readStatus" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase"><option className="bg-[#0a0a0c]">Plan to Read</option><option className="bg-[#0a0a0c]">Reading</option><option className="bg-[#0a0a0c]">Completed</option></select>
                        <input name="posterUrl" type="text" placeholder="POSTER URL" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/5 focus:border-cyan-500 outline-none font-bold text-white text-xs uppercase" />
                        <div className="modal-action mt-10">
                            <button type="submit" className="flex-1 h-20 bg-cyan-500 rounded-[2rem] font-black text-black uppercase text-xs shadow-xl">Archive</button>
                            <button type="button" className="px-10 h-20 bg-white/5 rounded-[2rem] text-white font-black text-xs uppercase" onClick={() => document.getElementById('add_modal').close()}>Abort</button>
                        </div>
                    </form>
                </div>
            </dialog>

            <dialog id="edit_modal" className="modal backdrop-blur-3xl">
                <div className="modal-box bg-[#0a0a0c] border border-white/10 rounded-[4rem] p-16 max-w-2xl shadow-2xl">
                    <h3 className="text-3xl font-black uppercase italic text-white mb-10 tracking-tighter">
                        Editing <span className="text-cyan-400">"{selectedManga?.title}"</span>
                    </h3>
                    {selectedManga && (
                        <form onSubmit={handleUpdateManga} className="grid grid-cols-1 gap-6">
                            <input name="title" defaultValue={selectedManga.title} className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-bold text-white text-xs uppercase" required />
                            <div className="grid grid-cols-2 gap-6">
                                <input name="author" defaultValue={selectedManga.author} className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-bold text-white text-xs uppercase" required />
                                <input name="chapters" defaultValue={selectedManga.chapters} type="number" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-bold text-white text-xs uppercase" required />
                            </div>
                            <input name="genre" defaultValue={selectedManga.genre.join(", ")} className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-black text-white text-xs uppercase" required />
                            <div className="grid grid-cols-2 gap-6">
                                <input name="type" defaultValue={selectedManga.type} className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-black text-white text-xs uppercase" required />
                                <input name="rating" defaultValue={selectedManga.rating} type="number" className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-black text-white text-xs uppercase" required />
                            </div>
                            <select name="readStatus" defaultValue={selectedManga.readStatus} className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] font-bold text-white text-xs uppercase outline-none"><option className="bg-[#0a0a0c]">Plan to Read</option><option className="bg-[#0a0a0c]">Reading</option><option className="bg-[#0a0a0c]">Completed</option></select>
                            <input name="posterUrl" defaultValue={selectedManga.posterUrl} className="h-16 bg-white/[0.03] rounded-2xl px-8 border border-white/[0.05] outline-none focus:border-cyan-500 font-bold text-white text-xs uppercase" />
                            <div className="modal-action mt-10">
                                <button type="submit" className="flex-1 h-20 bg-cyan-500 text-black rounded-[2rem] font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Confirm Edit</button>
                                <button type="button" className="px-10 h-20 bg-white/5 rounded-[2rem] text-white font-black text-xs uppercase" onClick={() => document.getElementById('edit_modal').close()}>Abort</button>
                            </div>
                        </form>
                    )}
                </div>
            </dialog>

            <dialog id="delete_modal" className="modal">
                <div className="modal-box bg-[#0a0a0c] border border-rose-500/20 rounded-[4rem] p-16 text-center shadow-2xl">
                    <h3 className="text-3xl font-black uppercase text-white mb-6 italic tracking-tighter">Confirm_Purge</h3>
                    <p className="text-xs text-slate-500 mb-10 uppercase tracking-[0.4em]">Disconnect record permanently?</p>
                    <div className="flex gap-6">
                        <button onClick={confirmDelete} className="btn flex-1 h-20 bg-rose-600 border-none text-white rounded-[2rem] font-black text-xs uppercase shadow-xl shadow-rose-900/40">Purge</button>
                        <button onClick={() => document.getElementById('delete_modal').close()} className="btn flex-1 h-20 bg-white/5 border-none text-white rounded-[2rem] font-black text-xs uppercase">Abort</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default Dashboard;