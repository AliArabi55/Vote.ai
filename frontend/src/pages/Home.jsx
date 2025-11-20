/**
 * Home Dashboard - Premium Glassmorphism Masonry Layout
 * Features: Glass filter bar + Masonry grid + FAB button with pulse
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, TrendingUp, Clock, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import SuggestionCard from '../components/SuggestionCard';
import CreateSuggestionModal from '../components/CreateSuggestionModal';
import { suggestionsAPI } from '../services/api';
import { cn } from '../utils/cn';

const Home = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'top', 'new'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email || '';

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Apply filter when suggestions or filter changes
  useEffect(() => {
    applyFilter();
  }, [suggestions, filter]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const data = await suggestionsAPI.getAll();
      setSuggestions(data);
    } catch (err) {
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...suggestions];

    switch (filter) {
      case 'top':
        // Sort by votes descending
        filtered.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case 'new':
        // Sort by created_at descending
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        // 'all' - keep original order
        break;
    }

    setFilteredSuggestions(filtered);
  };

  const handleVote = async (suggestionId) => {
    try {
      await suggestionsAPI.vote(suggestionId);
      // Update local state
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                votes: (s.votes || 0) + 1,
                voters: [...(s.voters || []), userEmail],
              }
            : s
        )
      );
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to vote');
    }
  };

  const handleCreateSuggestion = async (text) => {
    try {
      const newSuggestion = await suggestionsAPI.create(text);
      setSuggestions((prev) => [newSuggestion, ...prev]);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to create suggestion');
    }
  };

  const handleCheckSimilarity = async (text) => {
    try {
      const similar = await suggestionsAPI.checkSimilarity(text);
      return similar;
    } catch (err) {
      console.error('Similarity check failed:', err);
      return [];
    }
  };

  // Filter button config
  const filterButtons = [
    { id: 'all', label: 'All Ideas', icon: Filter },
    { id: 'top', label: 'Top Voted', icon: TrendingUp },
    { id: 'new', label: 'Latest', icon: Clock },
  ];

  // Staggered grid animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl font-black mb-4">
              <span className="gradient-text">Student Voice</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Vote on the best suggestions and help shape the future of our community
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 mb-8 flex flex-wrap gap-3 justify-center"
          >
            {filterButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <motion.button
                  key={btn.id}
                  onClick={() => setFilter(btn.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all',
                    filter === btn.id
                      ? 'btn-primary shadow-glow-md'
                      : 'glass-card hover:bg-glass-glow'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{btn.label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full"
              />
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card bg-red-500/10 border-red-500/30 rounded-2xl p-6 text-center mb-8"
            >
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Suggestions Grid - Masonry Layout */}
          {!loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredSuggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                  >
                    <SuggestionCard
                      suggestion={suggestion}
                      onVote={handleVote}
                      userEmail={userEmail}
                      maxVotes={Math.max(...filteredSuggestions.map((s) => s.votes || 0), 1)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && filteredSuggestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Sparkles className="w-16 h-16 text-neon-purple mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2">No suggestions yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share your idea!</p>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-8 py-3 rounded-xl font-bold"
              >
                Create First Suggestion
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full btn-primary shadow-glow-lg flex items-center justify-center z-30 animate-glow-pulse"
      >
        <Plus className="w-8 h-8 text-white" />
      </motion.button>

      {/* Create Suggestion Modal */}
      <CreateSuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSuggestion}
        checkSimilarity={handleCheckSimilarity}
      />
    </Layout>
  );
};

export default Home;
