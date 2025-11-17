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
        <h2>🔍 مقترح مشابه موجود</h2>
        
        <div className="similar-suggestion">
          <div className="similarity-score">
            {Math.round(topMatch.similarity * 100)}% تشابه
          </div>
          <h3>{topMatch.title}</h3>
          <p>{topMatch.description}</p>
          <div className="vote-info">
            <strong>{topMatch.vote_count} صوت</strong>
          </div>
        </div>

        <p className="dialog-message">
          هذا المقترح لديه بالفعل {topMatch.vote_count} صوت. 
          التصويت عليه أفضل من إنشاء مقترح مكرر.
        </p>

        <div className="dialog-actions">
          <button className="btn-primary" onClick={() => onVoteExisting(topMatch.id)}>
            ✅ صوّت على المقترح الموجود
          </button>
          <button className="btn-secondary" onClick={onCreateNew}>
            ➕ أنشئ مقترح جديد
          </button>
          <button className="btn-cancel" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateDialog;
