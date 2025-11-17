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
      alert('فشل تحميل المقترحات');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!newSuggestion.title.trim()) {
      alert('الرجاء إدخال عنوان المقترح');
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
      alert('فشل التحقق من التكرار');
    }
  };

  const createSuggestion = async () => {
    try {
      await suggestionsAPI.create(newSuggestion.title, newSuggestion.description);
      setNewSuggestion({ title: '', description: '' });
      setShowCreateForm(false);
      setDuplicateCheck(null);
      loadSuggestions();
      alert('✅ تم إنشاء المقترح بنجاح!');
    } catch (error) {
      alert('فشل إنشاء المقترح');
    }
  };

  const handleVoteExisting = async (suggestionId) => {
    try {
      await suggestionsAPI.toggleVote(suggestionId);
      setDuplicateCheck(null);
      setNewSuggestion({ title: '', description: '' });
      setShowCreateForm(false);
      loadSuggestions();
      alert('✅ تم تسجيل صوتك على المقترح الموجود!');
    } catch (error) {
      alert('فشل التصويت');
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>🗳️ صوت السفراء</h1>
        <p>المقترحات الأكثر شعبية تظهر في الأعلى</p>
        <button className="btn-create" onClick={() => setShowCreateForm(true)}>
          ➕ مقترح جديد
        </button>
      </header>

      {showCreateForm && (
        <div className="create-form">
          <h2>إنشاء مقترح جديد</h2>
          <input
            type="text"
            placeholder="عنوان المقترح"
            value={newSuggestion.title}
            onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
            className="input-field"
          />
          <textarea
            placeholder="الوصف التفصيلي (اختياري)"
            value={newSuggestion.description}
            onChange={(e) =>
              setNewSuggestion({ ...newSuggestion, description: e.target.value })
            }
            className="textarea-field"
            rows="4"
          />
          <div className="form-actions">
            <button className="btn-submit" onClick={handleCheckDuplicate}>
              إنشاء المقترح
            </button>
            <button className="btn-cancel" onClick={() => setShowCreateForm(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="suggestions-list">
        {suggestions.length === 0 ? (
          <p className="empty-state">لا توجد مقترحات حتى الآن. كن أول من يضيف واحدًا!</p>
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
