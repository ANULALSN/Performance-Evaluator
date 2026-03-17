import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAppContext } from '../context/AppContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    techStack: '',
    skillLevel: 'Beginner'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const techStackArray = formData.techStack.split(',').map(s => s.trim()).filter(s => s);
    try {
      const { data } = await authAPI.register({ ...formData, techStack: techStackArray });
      localStorage.setItem('sipp_token', data.token);
      setUser(data.user);
      navigate('/student');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 py-20">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-10 w-full max-w-xl"
      >
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-text-muted mb-8">Join SIPP to track your full-stack journey.</p>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
            <input 
              type="text" required className="input-premium"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Alex Rivera"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
            <input 
              type="email" required className="input-premium"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="alex@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
            <input 
              type="password" required className="input-premium"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Tech Stack (comma-separated)</label>
            <input 
              type="text" required className="input-premium"
              value={formData.techStack} onChange={(e) => setFormData({...formData, techStack: e.target.value})}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Skill Level</label>
            <select 
              className="input-premium"
              value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            {error && <p className="text-accent-error text-sm bg-accent-error/10 p-3 rounded-lg mb-6">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 h-14 text-lg">
              {loading ? 'Creating Account...' : 'Continue to Dashboard'}
            </button>
            <p className="text-center text-text-muted text-sm mt-8">
              Already have an account? <Link to="/login" className="text-accent-purple font-bold">Sign in</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
