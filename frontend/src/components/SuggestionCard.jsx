/**
 * SuggestionCard - Premium Glassmorphism Interactive Card
 * Features: Spring vote animations + Gradient borders + Hover glow
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, User, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../utils/cn';

const SuggestionCard = ({ suggestion, onVote, userEmail, maxVotes = 100 }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [localVotes, setLocalVotes] = useState(suggestion.votes || 0);
  const hasVoted = suggestion.voters?.includes(userEmail);

  // Calculate popularity percentage for progress bar
  const popularity = Math.min((localVotes / maxVotes) * 100, 100);

  const handleVote = async () => {
    if (isVoting || hasVoted) return;

    setIsVoting(true);
    setLocalVotes((prev) => prev + 1);

    try {
      await onVote(suggestion.id);
    } catch (error) {
      // Revert on error
      setLocalVotes((prev) => prev - 1);
    } finally {
      setTimeout(() => setIsVoting(false), 300);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'glass-card-hover rounded-2xl p-6',
        'relative overflow-hidden group'
      )}
    >
      {/* Gradient Border Glow on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple via-neon-blue to-neon-cyan opacity-20 blur-xl" />
      </div>

      <div className="relative z-10">
        {/* Header - Author & Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-300">
              {suggestion.author_email?.split('@')[0] || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDate(suggestion.created_at)}</span>
          </div>
        </div>

        {/* Suggestion Text */}
        <p className="text-white font-medium text-lg mb-6 leading-relaxed">
          {suggestion.suggestion_text}
        </p>

        {/* Footer - Votes & Progress */}
        <div className="space-y-3">
          {/* Popularity Progress Bar */}
          <div className="relative h-2 bg-glass-white rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${popularity}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-cyan/20 animate-shimmer" />
          </div>

          {/* Vote Button & Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>
                {popularity.toFixed(0)}% popular
              </span>
            </div>

            {/* Vote Button */}
            <motion.button
              onClick={handleVote}
              disabled={hasVoted || isVoting}
              whileHover={!hasVoted ? { scale: 1.05 } : {}}
              whileTap={!hasVoted ? { scale: 0.95 } : {}}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-bold',
                'transition-all duration-300',
                hasVoted
                  ? 'glass-card bg-neon-purple/20 text-neon-purple cursor-not-allowed'
                  : 'btn-primary hover:shadow-glow-lg'
              )}
            >
              {/* Vote Counter with Spring Animation */}
              <motion.span
                key={localVotes}
                initial={{ scale: 1.5, color: '#a855f7' }}
                animate={{ scale: 1, color: hasVoted ? '#a855f7' : '#ffffff' }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="text-lg font-black"
              >
                {localVotes}
              </motion.span>

              {/* Thumbs Up Icon */}
              <motion.div
                animate={isVoting ? { rotate: [0, -15, 15, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ThumbsUp
                  className={cn(
                    'w-5 h-5',
                    hasVoted && 'fill-neon-purple'
                  )}
                />
              </motion.div>

              <span className="text-sm">
                {hasVoted ? 'Voted' : 'Vote'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Ripple Effect on Vote */}
      {isVoting && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-neon-purple/30 rounded-2xl pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default SuggestionCard;
