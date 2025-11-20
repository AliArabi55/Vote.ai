/**
 * Login Page - Premium Glassmorphism Split Screen
 * Features: 3D Hero Text + Glowing Glass Form + Staggered Animations
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { cn } from '../utils/cn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify({ email }));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Stagger animation for form elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="mesh-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.12)_0%,transparent_50%),radial-gradient(circle_at_40%_20%,rgba(6,182,212,0.1)_0%,transparent_50%)] bg-[length:400%_400%] animate-mesh-move" />
      </div>

      {/* Main Content - Split Screen */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* ========================================
              LEFT SIDE - HERO SECTION
              ======================================== */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
            className="text-center lg:text-left"
          >
            {/* Floating Icons */}
            <div className="relative mb-8">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 left-1/4 lg:left-10"
              >
                <Sparkles className="w-12 h-12 text-neon-purple opacity-50" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-20 right-1/4 lg:right-10"
              >
                <Zap className="w-10 h-10 text-neon-cyan opacity-50" />
              </motion.div>
            </div>

            {/* Hero Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              <span className="gradient-text">Empowering</span>
              <br />
              <span className="text-white">Student Voices</span>
              <br />
              <span className="gradient-text-pink">with AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
              Transform ideas into impact. Vote on suggestions, powered by intelligent
              duplicate detection and community collaboration.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {['AI-Powered', 'Real-time Voting', 'Smart Filters'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="glass-card px-4 py-2 rounded-full text-sm font-semibold text-gray-300"
                >
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ========================================
              RIGHT SIDE - LOGIN FORM
              ======================================== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            {/* Glass Card Container */}
            <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan opacity-20 blur-2xl rounded-3xl" />

              <div className="relative z-10">
                {/* Form Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-400">Sign in to continue to Vote.ai</p>
                </motion.div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Input */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ali@microsoft.com"
                        required
                        className={cn(
                          'glass-input w-full pl-12 pr-4 py-3 rounded-xl',
                          'text-white placeholder-gray-500',
                          'focus:ring-2 focus:ring-neon-purple'
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={cn(
                          'glass-input w-full pl-12 pr-4 py-3 rounded-xl',
                          'text-white placeholder-gray-500',
                          'focus:ring-2 focus:ring-neon-purple'
                        )}
                      />
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="glass-card bg-red-500/10 border-red-500/30 px-4 py-3 rounded-xl"
                    >
                      <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full btn-primary py-4 rounded-xl',
                      'flex items-center justify-center gap-2',
                      'font-bold text-lg',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Demo Credentials */}
                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Demo: ali@microsoft.com / mypassword123
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
