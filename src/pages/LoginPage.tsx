import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/login', { email, password });
            const { access_token, refresh_token, user } = response.data;
            login(access_token, refresh_token, user);
            showToast('Login successful!', 'success');
            setTimeout(() => navigate('/'), 600);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Invalid credentials', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4">
            <ToastContainer toasts={toasts} />
            <div className="max-w-md w-full bg-white border border-slate-300 rounded-2xl p-8 shadow-xl mx-auto">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 border border-indigo-100 shadow-sm">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-black">Welcome Back</h2>
                    <p className="text-sm text-slate-600 font-medium mt-1">Sign in to Employee Performance Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-black text-sm outline-none focus:border-indigo-600 font-medium"
                            placeholder="admin@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-black text-sm outline-none focus:border-indigo-600 font-medium"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Sign In</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;