import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUserPlus, FaCheckCircle, FaSpinner, FaUser, FaGlobe, FaEnvelope } from 'react-icons/fa';

function Membership() {
  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
    email: ''
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      // جلب الأعضاء المعتمدين فقط
      const { data, error } = await supabase
        .from('members')
        .select('full_name, country, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!formData.full_name.trim()) {
      setError('الرجاء إدخال الاسم الكامل');
      return;
    }
    if (!formData.country.trim()) {
      setError('الرجاء إدخال اسم البلد');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('membership_requests')
        .insert([{
          full_name: formData.full_name.trim(),
          country: formData.country.trim(),
          email: formData.email.trim(),
          status: 'pending'
        }]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ full_name: '', country: '', email: '' });
      setToast({ message: 'تم إرسال طلبك لإدارة الموقع، سوف يتم الموافقة على طلب العضوية بأسرع وقت ممكن', type: 'success' });
      
      setTimeout(() => setToast(null), 5000);
    } catch (error) {
      setError('حدث خطأ في إرسال الطلب. الرجاء المحاولة مرة أخرى.');
      setToast({ message: 'حدث خطأ في إرسال الطلب', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="membership-page">
      <div className="container">
        {/* Toast Notification */}
        {toast && (
          <div className={`toast-membership ${toast.type}`}>
            {toast.type === 'success' ? <FaCheckCircle /> : <FaSpinner />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Hero Section */}
        <div className="membership-hero">
          <div className="hero-icon">
            <FaUserPlus />
          </div>
          <h1>سجل عضويتك في مدرسة توحدنا للسماع</h1>
          <p>يتيح لك تسجيل العضوية توثيق اسمك في القناة لشمول الإجازات العامة والاستدعاءات</p>
        </div>

        {/* Form Section */}
        <div className="membership-form-container">
          <h2>معلومات التسجيل</h2>
          <p className="form-note">سيظهر اسمك في قائمة الأعضاء بعد الموافقة من الإدارة</p>
          
          {submitted ? (
            <div className="success-message">
              <FaCheckCircle />
              <h3>تم إرسال طلبك بنجاح!</h3>
              <p>سوف يتم مراجعة طلبك والموافقة عليه في أقرب وقت ممكن</p>
              <button onClick={() => setSubmitted(false)} className="btn-new-request">
                تقديم طلب جديد
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="membership-form">
              <div className="form-group">
                <label><FaUser /> الاسم الكامل</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              
              <div className="form-group">
                <label><FaGlobe /> البلد</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="أدخل اسم بلدك"
                />
              </div>
              
              <div className="form-group">
                <label><FaEnvelope /> البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                />
              </div>

              {error && <div className="form-error">{error}</div>}
              
              <button type="submit" className="btn-submit-membership" disabled={submitLoading}>
                {submitLoading ? 'جاري الإرسال...' : 'إرسال طلب العضوية'}
              </button>
            </form>
          )}
        </div>

        {/* Members List Section */}
        <div className="members-list-container">
          <h2>قائمة الأعضاء</h2>
          <p>الأعضاء المعتمدون في مدرسة توحدنا للسماع</p>
          
          {loading ? (
            <LoadingSpinner />
          ) : members.length === 0 ? (
            <div className="no-members">
              <p>لا يوجد أعضاء معتمدون حالياً</p>
            </div>
          ) : (
            <div className="members-grid">
              {members.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-avatar">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h4>{member.full_name}</h4>
                    <p>{member.country}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .membership-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
          padding: 2rem 0 4rem;
        }

        .toast-membership {
          position: fixed;
          top: 90px;
          right: 20px;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideInRight 0.3s ease;
          border-right: 3px solid;
        }

        .toast-membership.success {
          border-right-color: #27ae60;
        }
        .toast-membership.success svg {
          color: #27ae60;
        }
        .toast-membership.error {
          border-right-color: #dc2626;
        }
        .toast-membership.error svg {
          color: #dc2626;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .membership-hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2.5rem;
          color: #e8b339;
        }

        .membership-hero h1 {
          font-size: 2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .membership-hero p {
          color: #6c757d;
          font-size: 1rem;
        }

        .membership-form-container {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .membership-form-container h2 {
          font-size: 1.5rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .form-note {
          color: #e8b339;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e9ecef;
        }

        .membership-form .form-group {
          margin-bottom: 1.25rem;
        }

        .membership-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #1b4f6e;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .membership-form input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .membership-form input:focus {
          outline: none;
          border-color: #e8b339;
          box-shadow: 0 0 0 3px rgba(232,179,57,0.1);
        }

        .form-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 10px;
          margin-bottom: 1rem;
        }

        .btn-submit-membership {
          width: 100%;
          background: linear-gradient(135deg, #e8b339, #c99a1a);
          color: #1b4f6e;
          padding: 1rem;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit-membership:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(232,179,57,0.3);
        }

        .success-message {
          text-align: center;
          padding: 2rem;
        }

        .success-message svg {
          font-size: 3rem;
          color: #27ae60;
          margin-bottom: 1rem;
        }

        .success-message h3 {
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .btn-new-request {
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 50px;
          margin-top: 1rem;
          cursor: pointer;
        }

        .members-list-container {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .members-list-container h2 {
          font-size: 1.5rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .members-list-container p {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .member-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .member-card:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .member-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #e8b339;
        }

        .member-info h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .member-info p {
          font-size: 0.8rem;
          color: #e8b339;
          margin: 0;
        }

        .no-members {
          text-align: center;
          padding: 2rem;
          color: #adb5bd;
        }

        @media (max-width: 768px) {
          .membership-hero h1 {
            font-size: 1.5rem;
          }
          
          .members-grid {
            grid-template-columns: 1fr;
          }
          
          .toast-membership {
            left: 15px;
            right: 15px;
            top: 80px;
          }
        }
      `}</style>
    </div>
  );
}

export default Membership;