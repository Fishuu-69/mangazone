import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Requirement [cite: 19]

const Signup = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success("Account Created: Identity Verified"); // Requirement 
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data || "Registration Protocols Failed"); // Requirement [cite: 19]
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans selection:bg-cyan-500/30">
            
            {/* --- PREMIUM AMBIENT GLOW --- */}
            <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>

            {/* --- SIGNUP CARD --- */}
            <div className="relative z-10 w-full max-w-[440px] px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                    
                    {/* LOGO & HEADER */}
                    <div className="text-center mb-10">
                        <div className="inline-flex w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-cyan-500/20 mb-6 hover:rotate-[360deg] transition-transform duration-1000">
                            <span className="text-white font-black text-2xl">M</span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                            Join the <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Vault</span>
                        </h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Initialize New Reader Profile</p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="form-control">
                            <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Choose Username</label>
                            <input 
                                type="text" 
                                placeholder="Unique Identity"
                                className="input input-bordered bg-white/5 border-white/5 rounded-2xl focus:border-cyan-500/50 focus:bg-white/10 transition-all font-bold text-sm" 
                                onChange={(e) => setForm({...form, username: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        <div className="form-control">
                            <label className="label text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Key</label>
                            <input 
                                type="password" 
                                placeholder="Encrypted Password"
                                className="input input-bordered bg-white/5 border-white/5 rounded-2xl focus:border-cyan-500/50 focus:bg-white/10 transition-all font-bold text-sm" 
                                onChange={(e) => setForm({...form, password: e.target.value})} 
                                required 
                            />
                        </div>

                        <div className="flex items-center gap-2 px-2 py-1">
                            <input type="checkbox" className="checkbox checkbox-xs checkbox-primary rounded-md border-white/20" required />
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">I accept the MangaZone archival protocols</span>
                        </div>

                        <button 
                            className={`btn bg-cyan-500 hover:bg-cyan-600 border-none w-full h-14 rounded-2xl font-black uppercase tracking-widest text-white mt-2 shadow-xl shadow-cyan-500/20 transition-all active:scale-95`}
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : 'Establish Identity'}
                        </button>
                    </form>

                    {/* REDIRECT */}
                    <p className="mt-10 text-center text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        Already Registered? <Link to="/" className="text-cyan-400 hover:underline">Access Session</Link>
                    </p>
                </div>

                <div className="mt-8 text-center opacity-40">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.6em]">System Version 0.7.0 • MERN Stack</p>
                </div>
            </div>
        </div>
    );
};

export default Signup;