/**
 * Login Page
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await authAPI.login(formData.email, formData.password);
        navigate('/');
      } else {
        await authAPI.register(formData.email, formData.password, formData.fullName);
        alert('✅ Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(
        isLogin
          ? 'Login failed. Check your email and password.'
          : 'Registration failed. Email may already be registered.'
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🗳️ Ambassador Voice</h1>
        <h2>{isLogin ? 'Login' : 'Create New Account'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="input-field"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="input-field"
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="input-field"
          />

          <button type="submit" className="btn-submit">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
