/**
 * CreateSuggestionModal Component
 * AI-Powered Smart Suggestion Submission with Real-time Similarity Detection
 */
import React, { useState, useEffect, useCallback } from 'react';
import { suggestionsAPI } from '../services/api';

const CreateSuggestionModal = ({ isOpen, onClose, onSuggestionCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // AI Similarity Detection State
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);
  const [similarSuggestions, setSimilarSuggestions] = useState([]);
  const [isNewIdea, setIsNewIdea] = useState(false);

  // Debounce timer reference
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Check similarity with debounce (500ms)
  const checkSimilarity = useCallback(async (searchTitle) => {
    if (!searchTitle || searchTitle.trim().length < 3) {
      setSimilarSuggestions([]);
      setIsNewIdea(false);
      return;
    }

    setCheckingSimilarity(true);
    setError(null);

    try {
      const results = await suggestionsAPI.checkSimilarity(searchTitle);
      
      if (results && results.length > 0) {
        setSimilarSuggestions(results);
        setIsNewIdea(false);
      } else {
        setSimilarSuggestions([]);
        setIsNewIdea(true);
      }
    } catch (err) {
      console.error('Similarity check failed:', err);
      setError('Failed to check for similar ideas. Please try again.');
      setSimilarSuggestions([]);
      setIsNewIdea(false);
    } finally {
      setCheckingSimilarity(false);
    }
  }, []);

  // Handle title change with debounce
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for 500ms debounce
    const timer = setTimeout(() => {
      checkSimilarity(title);
    }, 500);

    setDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [title]);

  // Handle voting on similar suggestion
  const handleVoteOnSimilar = async (suggestionId) => {
    try {
      await suggestionsAPI.upvote(suggestionId);
      setSuccessMessage('✅ Voted successfully! Closing...');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClose();
        if (onSuggestionCreated) {
          onSuggestionCreated();
        }
      }, 1500);
    } catch (err) {
      console.error('Vote failed:', err);
      setError('Failed to vote. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError('Please fill in both title and description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await suggestionsAPI.create(title.trim(), description.trim());
      setSuccessMessage('✅ Suggestion created successfully!');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClose();
        if (onSuggestionCreated) {
          onSuggestionCreated();
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to create suggestion:', err);
      setError(err.response?.data?.detail || 'Failed to create suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError(null);
    setSuccessMessage(null);
    setSimilarSuggestions([]);
    setIsNewIdea(false);
    setCheckingSimilarity(false);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Suggestion</h2>
                <p className="text-purple-100 text-sm">Share your idea with the community</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Suggestion Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Better food options at events"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              disabled={submitting}
            />

            {/* AI Similarity Feedback */}
            <div className="mt-3">
              {/* Checking Indicator */}
              {checkingSimilarity && (
                <div className="flex items-center gap-2 text-blue-600">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">Checking for similar ideas...</span>
                </div>
              )}

              {/* New Idea Detected */}
              {isNewIdea && !checkingSimilarity && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Great! This looks like a new idea. 🎉</span>
                </div>
              )}

              {/* Similar Suggestions Found */}
              {similarSuggestions.length > 0 && !checkingSimilarity && (
                <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-yellow-800">
                        We found similar ideas! Would you like to upvote these instead?
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Voting for existing ideas helps prioritize them faster. 🚀
                      </p>
                    </div>
                  </div>

                  {/* Similar Suggestions List */}
                  <div className="space-y-2">
                    {similarSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="bg-white border border-yellow-200 rounded-lg p-3 flex items-start justify-between gap-3 hover:border-yellow-300 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{suggestion.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              {suggestion.total_votes || 0} votes
                            </span>
                            {suggestion.similarity_score && (
                              <span className="text-purple-600 font-semibold">
                                {Math.round(suggestion.similarity_score * 100)}% match
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVoteOnSimilar(suggestion.id)}
                          className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Vote
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your suggestion..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              required
              disabled={submitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting || !title.trim() || !description.trim()}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Submit Suggestion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSuggestionModal;
