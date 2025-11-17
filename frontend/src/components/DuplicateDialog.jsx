/**
 * DuplicateDialog Component
 * Shows when a similar suggestion is found
 */
import React from 'react';
import './DuplicateDialog.css';

const DuplicateDialog = ({ similarSuggestions, onVoteExisting, onCreateNew, onClose }) => {
  if (!similarSuggestions || similarSuggestions.length === 0) return null;

  const topMatch = similarSuggestions[0];

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>🔍 Similar Suggestion Found</h2>
        
        <div className="similar-suggestion">
          <div className="similarity-score">
            {Math.round(topMatch.similarity * 100)}% match
          </div>
          <h3>{topMatch.title}</h3>
          <p>{topMatch.description}</p>
          <div className="vote-info">
            <strong>{topMatch.vote_count} votes</strong>
          </div>
        </div>

        <p className="dialog-message">
          This suggestion already has {topMatch.vote_count} votes. 
          Voting on it is better than creating a duplicate.
        </p>

        <div className="dialog-actions">
          <button className="btn-primary" onClick={() => onVoteExisting(topMatch.id)}>
            ✅ Vote on Existing Suggestion
          </button>
          <button className="btn-secondary" onClick={onCreateNew}>
            ➕ Create New Suggestion
          </button>
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateDialog;
