import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FaPhone, FaEnvelope, FaTelegram, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Contact() {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  async function fetchContactInfo() {
    try {
      const { data } = await supabase
        .from('contact_info')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();
      
      if (data) setContactInfo(data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus({ type: 'success', message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً إن شاء الله.' });
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Auto hide success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const socialLinks = [
    { type: 'telegram', url: contactInfo?.telegram, icon: FaTelegram, color: '#0088cc', name: 'تيليجرام' },
    { type: 'facebook', url: contactInfo?.facebook, icon: FaFacebook, color: '#1877f2', name: 'فيسبوك' },
    { type: 'twitter', url: contactInfo?.twitter, icon: FaTwitter, color: '#1da1f2', name: 'تويتر' },
    { type: 'whatsapp', url: contactInfo?.whatsapp, icon: FaWhatsapp, color: '#25d366', name: 'واتساب' },
    { type: 'instagram', url: contactInfo?.instagram, icon: FaInstagram, color: '#e4405f', name: 'انستقرام' }
  ].filter(link => link.url);

  return (
    <div className="contact-page-modern">
      <div className="container">
        {/* Header Section */}
        <div className="page-header-modern">
          <div className="header-icon">
            <FaPaperPlane />
          </div>
          <h1>تواصل معنا</h1>
          <p>نسعد بتواصلكم واستفساراتكم، فريقنا ينتظر رسائلكم</p>
        </div>

        {/* Hero Banner */}
        <div className="contact-hero">
          <div className="hero-content">
            <h2>نحن هنا لخدمتك</h2>
            <p>تواصل معنا لأي استفسار أو اقتراح، وسنرد عليك في أقرب وقت</p>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="contact-grid-modern">
          {/* Contact Info Side */}
          <div className="contact-info-side">
            <h3>معلومات الاتصال</h3>
            
            {contactInfo?.address && (
              <div className="info-card">
                <div className="info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-content">
                  <strong>العنوان</strong>
                  <p>{contactInfo.address}</p>
                </div>
              </div>
            )}
            
            {contactInfo?.phone && (
              <div className="info-card">
                <div className="info-icon">
                  <FaPhone />
                </div>
                <div className="info-content">
                  <strong>رقم الهاتف</strong>
                  <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                </div>
              </div>
            )}
            
            {contactInfo?.email && (
              <div className="info-card">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-content">
                  <strong>البريد الإلكتروني</strong>
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="social-section">
                <h4>تابعونا على وسائل التواصل</h4>
                <div className="social-grid">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-card"
                      style={{ borderColor: link.color }}
                    >
                      <div className="social-icon" style={{ background: link.color }}>
                        <link.icon />
                      </div>
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form Side */}
          <div className="contact-form-side">
            <h3>أرسل لنا رسالة</h3>
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك"
                  />
                </div>
                
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@domain.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              
              <div className="form-group">
                <label>الرسالة</label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="اكتب رسالتك هنا..."
                  rows="6"
                ></textarea>
              </div>

              {submitStatus && (
                <div className={`alert-message ${submitStatus.type}`}>
                  {submitStatus.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                  {submitStatus.message}
                </div>
              )}
              
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <>جاري الإرسال...</>
                ) : (
                  <>إرسال الرسالة <FaPaperPlane /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .contact-page-modern {
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
          padding-bottom: 3rem;
        }
        
        .page-header-modern {
          text-align: center;
          margin: 2rem 0 3rem;
        }
        
        .header-icon {
          font-size: 3rem;
          color: #e8b339;
          margin-bottom: 1rem;
        }
        
        .page-header-modern h1 {
          font-size: 2.5rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }
        
        .page-header-modern p {
          color: #6c757d;
          font-size: 1rem;
        }
        
        .contact-hero {
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .contact-hero h2 {
          font-size: 1.8rem;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .contact-hero p {
          color: rgba(255,255,255,0.8);
        }
        
        .contact-grid-modern {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
        }
        
        .contact-info-side {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        
        .contact-info-side h3 {
          font-size: 1.3rem;
          color: #1b4f6e;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e8b339;
          display: inline-block;
        }
        
        .info-card {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .info-card:hover {
          transform: translateX(-5px);
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .info-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 1.3rem;
        }
        
        .info-content strong {
          display: block;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
          font-size: 0.85rem;
        }
        
        .info-content p,
        .info-content a {
          color: #6c757d;
          text-decoration: none;
          font-size: 0.9rem;
        }
        
        .info-content a:hover {
          color: #e8b339;
        }
        
        .social-section {
          margin-top: 1.5rem;
        }
        
        .social-section h4 {
          color: #1b4f6e;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .social-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .social-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem;
          background: #f8f9fa;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          border-right: 3px solid;
        }
        
        .social-card:hover {
          transform: translateY(-2px);
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .social-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
        }
        
        .social-card span {
          color: #1b4f6e;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .contact-form-side {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        
        .contact-form-side h3 {
          font-size: 1.3rem;
          color: #1b4f6e;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e8b339;
          display: inline-block;
        }
        
        .modern-form .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .modern-form .form-group {
          margin-bottom: 1.25rem;
        }
        
        .modern-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #1b4f6e;
          font-size: 0.85rem;
        }
        
        .modern-form input,
        .modern-form textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 14px;
          font-size: 0.9rem;
          font-family: 'Cairo', sans-serif;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }
        
        .modern-form input:focus,
        .modern-form textarea:focus {
          outline: none;
          border-color: #e8b339;
          background: white;
          box-shadow: 0 0 0 3px rgba(232, 179, 57, 0.1);
        }
        
        .alert-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 14px;
          margin-bottom: 1.25rem;
          font-size: 0.85rem;
        }
        
        .alert-message.success {
          background: #d4edda;
          color: #155724;
          border-right: 3px solid #27ae60;
        }
        
        .alert-message.error {
          background: #fee2e2;
          color: #dc2626;
          border-right: 3px solid #dc2626;
        }
        
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #e8b339, #c99a1a);
          color: #1b4f6e;
          padding: 1rem;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(232, 179, 57, 0.3);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        @media (max-width: 968px) {
          .contact-grid-modern {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .modern-form .form-row {
            grid-template-columns: 1fr;
          }
          
          .social-grid {
            grid-template-columns: 1fr;
          }
          
          .contact-hero h2 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Contact;