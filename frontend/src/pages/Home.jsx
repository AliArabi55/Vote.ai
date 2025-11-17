/**
 * Home Page - Vote.ai Premium Edition ✨
 * Stunning glassmorphism design with Framer Motion animations
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LogOut, Activity, TrendingUp, CheckCircle, Plus, Filter } from 'lucide-react';
import { suggestionsAPI, healthAPI } from '../services/api';
import SuggestionCard from '../components/SuggestionCard';
import CreateSuggestionModal from '../components/CreateSuggestionModal';

const Home = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, etc.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkBackendHealth();
    loadSuggestions();
  }, [filterStatus]);

  const checkBackendHealth = async () => {
    try {
      await healthAPI.check();
      setBackendStatus('healthy');
    } catch (err) {
      setBackendStatus('unhealthy');
      console.error('Backend health check failed:', err);
    }
  };

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await suggestionsAPI.getAll(params);
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setError(err.response?.data?.detail || 'Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    // Optionally refetch suggestions
    // loadSuggestions();
  };

  const handleSuggestionCreated = () => {
    // Reload suggestions after new suggestion is created
    loadSuggestions();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Filter buttons
  const filters = [
    { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'implemented', label: 'Implemented', color: 'bg-blue-100 text-blue-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="min-h-screen">
      {/* Glassmorphism Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="glass-dark sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo & Title */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg shadow-purple-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Vote.ai
                </h1>
                <p className="text-sm text-gray-400">AI-Powered Suggestions Platform</p>
              </div>
            </motion.div>

            {/* Right Side: Status & Logout */}
            <div className="flex items-center gap-4">
              {/* Backend Status */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10"
              >
                <motion.div
                  animate={{
                    scale: backendStatus === 'healthy' ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-3 h-3 rounded-full ${
                    backendStatus === 'healthy'
                      ? 'bg-green-500 shadow-lg shadow-green-500/50'
                      : backendStatus === 'unhealthy'
                      ? 'bg-red-500 shadow-lg shadow-red-500/50'
                      : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                  }`}
                ></motion.div>
                <span className="text-sm text-gray-300 font-medium">
                  {backendStatus === 'healthy'
                    ? 'Online'
                    : backendStatus === 'unhealthy'
                    ? 'Offline'
                    : 'Checking...'}
                </span>
              </motion.div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-300 rounded-lg font-bold hover:from-red-500/20 hover:to-rose-500/20 transition-all border border-red-500/30"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Filter by:</span>
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    filterStatus === filter.value
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md scale-105'
                      : filter.color + ' hover:scale-105'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{suggestions.length}</p>
                <p className="text-sm text-gray-500">Total Suggestions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {suggestions.reduce((sum, s) => sum + (s.vote_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Votes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {suggestions.filter((s) => s.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading suggestions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 font-semibold mb-2">Error Loading Suggestions</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadSuggestions}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && suggestions.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600 font-semibold text-lg mb-2">No suggestions found</p>
            <p className="text-gray-500">Be the first to create a suggestion!</p>
          </div>
        )}

        {/* Suggestions Grid */}
        {!loading && !error && suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onVoteSuccess={handleVoteSuccess}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              © 2024 Vote.ai - Powered by Azure OpenAI & PostgreSQL
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Built with</span>
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-gray-400">by Ali Arabi</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) - Create Suggestion */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-5 rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group z-40"
        aria-label="Create new suggestion"
      >
        <svg
          className="w-8 h-8 transform group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Create Suggestion Modal */}
      <CreateSuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuggestionCreated={handleSuggestionCreated}
      />
    </div>
  );
};

export default Home;
