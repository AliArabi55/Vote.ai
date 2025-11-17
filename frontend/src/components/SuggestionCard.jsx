/**
 * SuggestionCard Component - Vote.ai Premium Edition ✨
 * Stunning glassmorphism design with Framer Motion animations
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Sparkles, Calendar, Hash } from 'lucide-react';
import { suggestionsAPI } from '../services/api';

const SuggestionCard = ({ suggestion, onVoteSuccess }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(suggestion.vote_count || 0);
  const [userVote, setUserVote] = useState(null); // 'upvote', 'downvote', or null
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in
  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  // Handle upvote
  const handleUpvote = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      alert('⚠️ Please login to vote');
      navigate('/login');
      return;
    }

    if (isVoting) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      if (userVote === 'upvote') {
        await suggestionsAPI.removeVote(suggestion.id);
        setUserVote(null);
        setLocalVoteCount(prev => prev - 1);
      } else {
        await suggestionsAPI.upvote(suggestion.id);
        setUserVote('upvote');
        setLocalVoteCount(prev => userVote === 'downvote' ? prev + 2 : prev + 1);
      }
      
      if (onVoteSuccess) onVoteSuccess();
    } catch (err) {
      console.error('Upvote error:', err);
      if (err.response?.status === 401) {
        alert('⚠️ Session expired. Please login again.');
        localStorage.removeItem('access_token');
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to vote. Please try again.');
      }
    } finally {
      setIsVoting(false);
    }
  };

  // Handle downvote
  const handleDownvote = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      alert('⚠️ Please login to vote');
      navigate('/login');
      return;
    }

    if (isVoting) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      if (userVote === 'downvote') {
        await suggestionsAPI.removeVote(suggestion.id);
        setUserVote(null);
        setLocalVoteCount(prev => prev + 1);
      } else {
        await suggestionsAPI.downvote(suggestion.id);
        setUserVote('downvote');
        setLocalVoteCount(prev => userVote === 'upvote' ? prev - 2 : prev - 1);
      }
      
      if (onVoteSuccess) onVoteSuccess();
    } catch (err) {
      console.error('Downvote error:', err);
      if (err.response?.status === 401) {
        alert('⚠️ Session expired. Please login again.');
        localStorage.removeItem('access_token');
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to vote. Please try again.');
      }
    } finally {
      setIsVoting(false);
    }
  };

  // Get status badge color and icon
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'from-yellow-500/20 to-amber-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-300',
          glow: 'shadow-yellow-500/20'
        };
      case 'approved':
        return {
          bg: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          text: 'text-green-300',
          glow: 'shadow-green-500/20'
        };
      case 'rejected':
        return {
          bg: 'from-red-500/20 to-rose-500/20',
          border: 'border-red-500/30',
          text: 'text-red-300',
          glow: 'shadow-red-500/20'
        };
      case 'implemented':
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          glow: 'shadow-blue-500/20'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-slate-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-300',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const statusStyle = getStatusStyle(suggestion.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className="relative group"
    >
      {/* Glassmorphism Card */}
      <div className="glass-dark rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500 pointer-events-none"></div>
        
        {/* Card Content */}
        <div className="relative p-6">
          {/* Header: Status & Vote Count */}
          <div className="flex justify-between items-start mb-4">
            {/* Status Badge */}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r ${statusStyle.bg} border ${statusStyle.border} ${statusStyle.text} backdrop-blur-sm shadow-lg ${statusStyle.glow}`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
            </motion.span>
            
            {/* Vote Count Badge */}
            <motion.div
              animate={{ 
                scale: userVote ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 rounded-full border border-purple-500/30 backdrop-blur-sm shadow-lg shadow-purple-500/20"
            >
              <ThumbsUp className="w-4 h-4 text-purple-400 mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                {localVoteCount}
              </span>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            whileHover={{ x: 5 }}
            className="text-2xl font-bold text-white mb-3 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all cursor-pointer"
          >
            {suggestion.title}
          </motion.h3>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {suggestion.description}
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm"
            >
              <p className="text-red-300 text-xs">{error}</p>
            </motion.div>
          )}

          {/* Voting Buttons */}
          <div className="flex gap-3 mt-6">
            {/* Upvote Button */}
            <motion.button
              onClick={handleUpvote}
              disabled={isVoting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 backdrop-blur-sm ${
                userVote === 'upvote'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50 border border-green-400'
                  : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp className="w-5 h-5" />
              {userVote === 'upvote' ? 'Upvoted' : 'Upvote'}
            </motion.button>

            {/* Downvote Button */}
            <motion.button
              onClick={handleDownvote}
              disabled={isVoting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 backdrop-blur-sm ${
                userVote === 'downvote'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50 border border-red-400'
                  : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-300 hover:from-red-500/20 hover:to-rose-500/20 border border-red-500/30'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsDown className="w-5 h-5" />
              {userVote === 'downvote' ? 'Downvoted' : 'Downvote'}
            </motion.button>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-white/5 backdrop-blur-sm px-6 py-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3" />
              <span className="font-mono">{suggestion.id.slice(0, 8)}...</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SuggestionCard;
