/**
 * SuggestionCard Component - Vote.ai
 * Beautiful UI component to display suggestions with upvote/downvote functionality
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'implemented':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
      {/* Card Header */}
      <div className="p-6">
        {/* Status Badge & Vote Count */}
        <div className="flex justify-between items-start mb-4">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
              suggestion.status
            )}`}
          >
            {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
          </span>
          
          <div className="flex items-center bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full border border-purple-200">
            <svg
              className="w-5 h-5 text-purple-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-lg font-bold text-purple-700">{localVoteCount}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-purple-600 transition-colors">
          {suggestion.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {suggestion.description}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}

        {/* Voting Buttons */}
        <div className="flex gap-3 mt-4">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              userVote === 'upvote'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:scale-105'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {userVote === 'upvote' ? 'Upvoted' : 'Upvote'}
          </button>

          {/* Downvote Button */}
          <button
            onClick={handleDownvote}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              userVote === 'downvote'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg scale-105'
                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 border border-red-200 hover:scale-105'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <svg className="w-5 h-5 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {userVote === 'downvote' ? 'Downvoted' : 'Downvote'}
          </button>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>{suggestion.id.slice(0, 8)}...</span>
          </div>
          
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
  );
};

export default SuggestionCard;
