/**
 * SuggestionCard Component
 * Displays a single suggestion with voting functionality
 */
import React from 'react';
import { useOptimisticVote } from '../hooks/useOptimisticVote';
import { suggestionsAPI } from '../services/api';
import './SuggestionCard.css';

const SuggestionCard = ({ suggestion, onVoteSuccess }) => {
  const { voteCount, userHasVoted, isVoting, handleVote } = useOptimisticVote(
    suggestion.vote_count,
    suggestion.user_has_voted
  );

  const onVoteClick = async () => {
    try {
      await handleVote(() => suggestionsAPI.toggleVote(suggestion.id));
      if (onVoteSuccess) onVoteSuccess();
    } catch (error) {
      alert('Vote failed. Please try again.');
    }
  };

  return (
    <div className="suggestion-card">
      <div className="vote-section">
        <div className="vote-badge">{voteCount} 👍</div>
        <button
          className={`vote-button ${userHasVoted ? 'voted' : ''}`}
          onClick={onVoteClick}
          disabled={isVoting}
        >
          {userHasVoted ? 'Unvote' : 'Vote'}
        </button>
      </div>

      <div className="content-section">
        <h3 className="title">{suggestion.title}</h3>
        <p className="description">{suggestion.description}</p>

        <div className="metadata">
          <span className="status-badge status-{suggestion.status}">
            {suggestion.status === 'pending' && 'Under Review'}
            {suggestion.status === 'approved' && 'Approved'}
            {suggestion.status === 'rejected' && 'Rejected'}
          </span>
          <span className="date">
            {new Date(suggestion.created_at).toLocaleDateString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
