import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserShield } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      navigate('/admin');
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      if (userData.password_hash === password) {
        // حفظ بيانات المستخدم مع الاسم
        const userToStore = {
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          role: userData.role,
          created_at: userData.created_at
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
        navigate('/admin');
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      setError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-brand">
            <div className="login-icon">
              <FaUserShield />
            </div>
            <h2>مرحباً بعودتك</h2>
            <p>تسجيل الدخول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <div className="input-icon">
                <FaEnvelope />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <FaLock />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'جاري الدخول...' : 'دخول'}
              <FaSignInAlt />
            </button>
          </form>

          <div className="login-footer">
            <p>منصة إدارة محتوى توحدنا للسماع</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0d2b3e 0%, #1b4f6e 100%);
          padding: 2rem;
        }

        .login-wrapper {
          width: 100%;
          max-width: 450px;
        }

        .login-container {
          background: white;
          border-radius: 32px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-brand {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #e8b339, #c99a1a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          color: white;
        }

        .login-brand h2 {
          font-size: 1.8rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .login-brand p {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .input-group {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .input-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #c0c0c0;
          font-size: 1rem;
        }

        .input-group input {
          width: 100%;
          padding: 1rem 3rem 1rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          font-size: 1rem;
          font-family: 'Cairo', sans-serif;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .input-group input:focus {
          outline: none;
          border-color: #e8b339;
          background: white;
          box-shadow: 0 0 0 4px rgba(232, 179, 57, 0.1);
        }

        .login-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #e8b339, #c99a1a);
          color: #1b4f6e;
          padding: 1rem;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(232, 179, 57, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
          font-size: 0.75rem;
          color: #adb5bd;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 1.5rem;
          }
          
          .login-brand h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;