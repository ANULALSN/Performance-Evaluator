import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('sipp_token', data.token);
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/student');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-10 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-text-muted mb-8">Login to access your performance platform.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
            <input 
              type="email" required className="input-premium"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
            <input 
              type="password" required className="input-premium"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-accent-error text-sm bg-accent-error/10 p-3 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className="text-center text-text-muted text-sm mt-8">
            Don't have an account? <Link to="/register" className="text-accent-purple font-bold">Register here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
