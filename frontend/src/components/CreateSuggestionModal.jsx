/**
 * CreateSuggestionModal - AI-Powered Glassmorphism Modal
 * Features: Spring expansion animation + AI similarity detection + Sparkle effects
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Send } from 'lucide-react';
import { cn } from '../utils/cn';

const CreateSuggestionModal = ({ isOpen, onClose, onSubmit, checkSimilarity }) => {
  const [suggestionText, setSuggestionText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [similarSuggestions, setSimilarSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = async (e) => {
    const text = e.target.value;
    setSuggestionText(text);
    setError('');

    // Check for similar suggestions when user types
    if (text.trim().length > 10 && checkSimilarity) {
      setIsChecking(true);
      try {
        const similar = await checkSimilarity(text);
        setSimilarSuggestions(similar || []);
      } catch (err) {
        console.error('Similarity check failed:', err);
      } finally {
        setIsChecking(false);
      }
    } else {
      setSimilarSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestionText.trim()) {
      setError('Please enter a suggestion');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(suggestionText);
      setSuggestionText('');
      setSimilarSuggestions([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuggestionText('');
    setSimilarSuggestions([]);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-void/80 backdrop-blur-md z-40"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-2xl pointer-events-auto"
            >
              {/* Glass Card */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                {/* Animated Glow Border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan opacity-30 blur-2xl animate-glow-pulse" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
                      >
                        <Sparkles className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Create Suggestion</h2>
                        <p className="text-sm text-gray-400">AI will check for similar ideas</p>
                      </div>
                    </div>

                    {/* Close Button */}
                    <motion.button
                      onClick={handleClose}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Textarea */}
                    <div className="relative">
                      <textarea
                        value={suggestionText}
                        onChange={handleTextChange}
                        placeholder="Describe your suggestion... (AI will check for duplicates)"
                        rows={6}
                        className={cn(
                          'glass-input w-full px-4 py-3 rounded-xl resize-none',
                          'text-white placeholder-gray-500',
                          'focus:ring-2 focus:ring-neon-purple'
                        )}
                        disabled={isSubmitting}
                      />

                      {/* AI Checking Indicator */}
                      {isChecking && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-4 right-4"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Character Count */}
                    <div className="text-right text-sm text-gray-500">
                      {suggestionText.length} characters
                    </div>

                    {/* Similar Suggestions Section */}
                    <AnimatePresence>
                      {similarSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          className="space-y-3"
                        >
                          {/* Warning Header */}
                          <div className="flex items-center gap-2 text-yellow-400">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">AI found {similarSuggestions.length} similar suggestion(s):</span>
                          </div>

                          {/* Similar Cards */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {similarSuggestions.map((similar, index) => (
                              <motion.div
                                key={similar.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card rounded-xl p-4 border-l-4 border-yellow-500/50"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium mb-1">
                                      {similar.suggestion_text}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <span>{similar.votes || 0} votes</span>
                                      <span>•</span>
                                      <span>
                                        {Math.round(similar.similarity_score * 100)}% similar
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Proceed Anyway Message */}
                          <p className="text-sm text-gray-400 italic">
                            💡 You can still submit your suggestion if it's different enough
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                      type="submit"
                      disabled={isSubmitting || !suggestionText.trim()}
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      className={cn(
                        'w-full btn-primary py-4 rounded-xl',
                        'flex items-center justify-center gap-2',
                        'font-bold text-lg',
                        (isSubmitting || !suggestionText.trim()) && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Suggestion</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateSuggestionModal;
