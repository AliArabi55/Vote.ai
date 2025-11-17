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
        alert('✅ تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(
        isLogin
          ? 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.'
          : 'فشل التسجيل. قد يكون البريد الإلكتروني مسجلاً بالفعل.'
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🗳️ صوت السفراء</h1>
        <h2>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="input-field"
            />
          )}

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="input-field"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="input-field"
          />

          <button type="submit" className="btn-submit">
            {isLogin ? 'دخول' : 'تسجيل'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          <button className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'سجل الآن' : 'سجل الدخول'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
