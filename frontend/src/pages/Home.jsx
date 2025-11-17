/**
 * Home Page
 * Main feed showing all suggestions sorted by votes
 */
import React, { useEffect, useState } from 'react';
import { suggestionsAPI } from '../services/api';
import SuggestionCard from '../components/SuggestionCard';
import DuplicateDialog from '../components/DuplicateDialog';
import './Home.css';

const Home = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({ title: '', description: '' });
  const [duplicateCheck, setDuplicateCheck] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await suggestionsAPI.getAll();
      setSuggestions(data);
    } catch (error) {
      alert('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!newSuggestion.title.trim()) {
      alert('Please enter a suggestion title');
      return;
    }

    try {
      const result = await suggestionsAPI.checkDuplicate(
        newSuggestion.title,
        newSuggestion.description
      );

      if (result.duplicate_found) {
        setDuplicateCheck(result);
      } else {
        // No duplicates, create directly
        await createSuggestion();
      }
    } catch (error) {
      alert('Failed to check for duplicates');
    }
  };

  const createSuggestion = async () => {
    try {
      await suggestionsAPI.create(newSuggestion.title, newSuggestion.description);
      setNewSuggestion({ title: '', description: '' });
      setShowCreateForm(false);
      setDuplicateCheck(null);
      loadSuggestions();
      alert('✅ Suggestion created successfully!');
    } catch (error) {
      alert('Failed to create suggestion');
    }
  };

  const handleVoteExisting = async (suggestionId) => {
    try {
      await suggestionsAPI.toggleVote(suggestionId);
      setDuplicateCheck(null);
      setNewSuggestion({ title: '', description: '' });
      setShowCreateForm(false);
      loadSuggestions();
      alert('✅ Vote recorded on existing suggestion!');
    } catch (error) {
      alert('Failed to vote');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>🗳️ Ambassador Voice</h1>
        <p>Most popular suggestions appear at the top</p>
        <button className="btn-create" onClick={() => setShowCreateForm(true)}>
          ➕ New Suggestion
        </button>
      </header>

      {showCreateForm && (
        <div className="create-form">
          <h2>Create New Suggestion</h2>
          <input
            type="text"
            placeholder="Suggestion Title"
            value={newSuggestion.title}
            onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="Detailed Description (optional)"
            value={newSuggestion.description}
            onChange={(e) =>
              setNewSuggestion({ ...newSuggestion, description: e.target.value })
            }
            className="textarea-field"
            rows="4"
          />
          <div className="form-actions">
            <button className="btn-submit" onClick={handleCheckDuplicate}>
              Create Suggestion
            </button>
            <button className="btn-cancel" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="suggestions-list">
        {suggestions.length === 0 ? (
          <p className="empty-state">No suggestions yet. Be the first to add one!</p>
        ) : (
          suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onVoteSuccess={loadSuggestions}
            />
          ))
        )}
      </div>

      {duplicateCheck && (
        <DuplicateDialog
          similarSuggestions={duplicateCheck.similar_suggestions}
          onVoteExisting={handleVoteExisting}
          onCreateNew={createSuggestion}
          onClose={() => setDuplicateCheck(null)}
        />
      )}
    </div>
  );
};

export default Home;
