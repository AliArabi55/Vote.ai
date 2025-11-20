/**
 * Layout Component - Premium Glassmorphism Wrapper
 * Includes: Animated Background + Floating Glass Navbar + Content Area
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const Layout = ({ children, showNavbar = true }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ========================================
          🌌 ANIMATED MESH BACKGROUND
          ======================================== */}
      <div className="mesh-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.12)_0%,transparent_50%),radial-gradient(circle_at_40%_20%,rgba(6,182,212,0.1)_0%,transparent_50%),radial-gradient(circle_at_90%_30%,rgba(236,72,153,0.08)_0%,transparent_50%)] bg-[length:400%_400%] animate-mesh-move" />
      </div>

      {/* ========================================
          🪟 FLOATING GLASS NAVBAR
          ======================================== */}
      {showNavbar && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="mx-4 mt-4">
            <div className="glass-card rounded-2xl px-6 py-4 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                {/* Logo Section */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate('/home')}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl blur-md opacity-75 animate-glow-pulse" />
                    <div className="relative bg-gradient-to-r from-neon-purple to-neon-blue p-3 rounded-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text">Vote.ai</h1>
                    <p className="text-xs text-gray-400">Ambassador Voice Platform</p>
                  </div>
                </motion.div>

                {/* Right Side - User Info + Logout */}
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass-card px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-neon-purple" />
                    <span className="text-sm font-medium text-white">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </motion.div>

                  {/* Logout Button */}
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'glass-card px-4 py-2 rounded-xl',
                      'flex items-center gap-2',
                      'hover:bg-red-500/10 hover:border-red-500/30',
                      'transition-all duration-300'
                    )}
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">Logout</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.nav>
      )}

      {/* ========================================
          📄 MAIN CONTENT AREA
          ======================================== */}
      <main className={cn(showNavbar ? 'pt-28' : 'pt-8', 'relative z-10')}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
