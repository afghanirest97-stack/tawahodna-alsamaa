import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FaTelegram, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaTrash, FaCheckCircle, FaEnvelopeOpen, FaUser, FaCalendarAlt } from 'react-icons/fa';

function ManageContact() {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    telegram: '',
    facebook: '',
    twitter: '',
    whatsapp: '',
    instagram: '',
    address: ''
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchContactInfo();
    fetchMessages();
  }, []);

  async function fetchContactInfo() {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact info:', error);
      }
      if (data) setContactInfo(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching messages:', error);
        showToast('حدث خطأ في جلب الرسائل', 'error');
      }
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: existing } = await supabase
        .from('contact_info')
        .select('id')
        .limit(1)
        .maybeSingle();

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('contact_info')
          .update(contactInfo)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('contact_info')
          .insert([contactInfo]);
        error = insertError;
      }

      if (!error) {
        showToast('تم تحديث معلومات التواصل بنجاح', 'success');
        fetchContactInfo();
      } else {
        showToast('حدث خطأ: ' + error.message, 'error');
      }
    } catch (error) {
      showToast('حدث خطأ: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function markAsRead(id) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
      } else {
        showToast('تم تعيين الرسالة كمقروءة', 'success');
        await fetchMessages();
      }
    } catch (error) {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
  }

  async function markAllAsRead() {
    const unreadIds = messages.filter(m => !m.is_read).map(m => m.id);
    if (unreadIds.length === 0) {
      showToast('لا توجد رسائل غير مقروءة', 'info');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      if (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
      } else {
        showToast('تم تعليم جميع الرسائل كمقروءة', 'success');
        await fetchMessages();
      }
    } catch (error) {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
  }

  async function deleteMessage(id) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .delete()
          .eq('id', id);
        
        if (error) {
          showToast('حدث خطأ: ' + error.message, 'error');
        } else {
          showToast('تم حذف الرسالة بنجاح', 'success');
          await fetchMessages();
        }
      } catch (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
      }
    }
  }

  async function deleteAllMessages() {
    if (confirm('هل أنت متأكد من حذف جميع الرسائل؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .delete()
          .neq('id', 0);
        
        if (error) {
          showToast('حدث خطأ: ' + error.message, 'error');
        } else {
          showToast('تم حذف جميع الرسائل بنجاح', 'success');
          await fetchMessages();
        }
      } catch (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
      }
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const socialFields = [
    { key: 'telegram', label: 'تيليجرام', icon: FaTelegram, color: '#0088cc', placeholder: 'https://t.me/username' },
    { key: 'facebook', label: 'فيسبوك', icon: FaFacebook, color: '#1877f2', placeholder: 'https://facebook.com/username' },
    { key: 'twitter', label: 'تويتر', icon: FaTwitter, color: '#1da1f2', placeholder: 'https://twitter.com/username' },
    { key: 'whatsapp', label: 'واتساب', icon: FaWhatsapp, color: '#25d366', placeholder: 'https://wa.me/XXXXXXXXX' },
    { key: 'instagram', label: 'انستقرام', icon: FaInstagram, color: '#e4405f', placeholder: 'https://instagram.com/username' }
  ];

  return (
    <div className="manage-contact-premium">
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' && <FaCheckCircle />}
          {toast.type === 'error' && <FaTrash />}
          {toast.type === 'info' && <FaEnvelopeOpen />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="tabs-premium">
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <FaPhone /> معلومات التواصل
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <FaEnvelope /> رسائل الزوار
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="contact-info-section">
          <div className="section-header-premium">
            <h2>⚙️ إعدادات التواصل</h2>
            <p>قم بتحديث معلومات الاتصال التي ستظهر في صفحة تواصل معنا</p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form-premium">
            <div className="form-grid-two">
              <div className="form-group-premium">
                <label><FaPhone /> رقم الهاتف</label>
                <input
                  type="tel"
                  value={contactInfo.phone || ''}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              <div className="form-group-premium">
                <label><FaEnvelope /> البريد الإلكتروني</label>
                <input
                  type="email"
                  value={contactInfo.email || ''}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="info@example.com"
                />
              </div>
            </div>

            <div className="form-group-premium">
              <label><FaMapMarkerAlt /> العنوان</label>
              <textarea
                rows="2"
                value={contactInfo.address || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                placeholder="عنوان المؤسسة..."
              />
            </div>

            <h3 className="section-subtitle">وسائل التواصل الاجتماعي</h3>
            <div className="social-grid">
              {socialFields.map(field => (
                <div key={field.key} className="form-group-premium">
                  <label><field.icon style={{ color: field.color }} /> {field.label}</label>
                  <input
                    type="url"
                    value={contactInfo[field.key] || ''}
                    onChange={(e) => setContactInfo({ ...contactInfo, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="form-actions-premium">
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? 'جاري الحفظ...' : (
                  <>
                    <FaSave /> حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-section">
          <div className="messages-header">
            <div className="section-header-premium">
              <h2>📬 رسائل الزوار</h2>
              <p>{messages.length} رسالة في صندوق الوارد</p>
            </div>
            {messages.length > 0 && (
              <div className="bulk-actions">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn-mark-all">
                    <FaCheckCircle /> تعليم الكل كمقروء
                  </button>
                )}
                <button onClick={deleteAllMessages} className="btn-delete-all">
                  <FaTrash /> حذف الكل
                </button>
              </div>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="empty-state-messages">
              <FaEnvelopeOpen />
              <h3>لا توجد رسائل</h3>
              <p>صندوق الوارد فارغ، ستظهر هنا رسائل الزوار عند إرسالها</p>
            </div>
          ) : (
            <div className="messages-list-premium">
              {messages.map(msg => (
                <div key={msg.id} className={`message-card ${!msg.is_read ? 'unread' : ''}`}>
                  <div className="message-status">
                    {!msg.is_read && <span className="unread-dot"></span>}
                  </div>
                  <div className="message-content">
                    <div className="message-sender">
                      <div className="sender-info">
                        <strong><FaUser /> {msg.name}</strong>
                        <span>{msg.email}</span>
                        {msg.phone && <span><FaPhone /> {msg.phone}</span>}
                      </div>
                      <div className="message-date">
                        <FaCalendarAlt /> {formatDate(msg.created_at)}
                      </div>
                    </div>
                    <div className="message-text">
                      <p>{msg.message}</p>
                    </div>
                    <div className="message-actions-premium">
                      {!msg.is_read && (
                        <button onClick={() => markAsRead(msg.id)} className="btn-read">
                          <FaCheckCircle /> تعليم كمقروء
                        </button>
                      )}
                      <button onClick={() => deleteMessage(msg.id)} className="btn-delete-message">
                        <FaTrash /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .manage-contact-premium {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }

        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease;
          border-right: 3px solid;
        }

        .toast-notification.success {
          border-right-color: #27ae60;
        }
        .toast-notification.success svg {
          color: #27ae60;
        }
        .toast-notification.error {
          border-right-color: #dc2626;
        }
        .toast-notification.error svg {
          color: #dc2626;
        }
        .toast-notification.info {
          border-right-color: #e8b339;
        }
        .toast-notification.info svg {
          color: #e8b339;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .tabs-premium {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: white;
          padding: 0.5rem;
          border-radius: 60px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #6c757d;
          transition: all 0.3s ease;
          position: relative;
        }

        .tab-btn.active {
          background: #e8b339;
          color: #1b4f6e;
        }

        .badge {
          position: absolute;
          top: -5px;
          right: 5px;
          background: #dc2626;
          color: white;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 50px;
        }

        .contact-info-section,
        .messages-section {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .section-header-premium {
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f0f2f5;
        }

        .section-header-premium h2 {
          font-size: 1.3rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .section-header-premium p {
          color: #6c757d;
          font-size: 0.85rem;
        }

        .section-subtitle {
          font-size: 1rem;
          color: #1b4f6e;
          margin: 1.5rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .form-grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .form-group-premium {
          margin-bottom: 1rem;
        }

        .form-group-premium label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #1b4f6e;
          font-size: 0.85rem;
        }

        .form-group-premium input,
        .form-group-premium textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: 'Cairo', sans-serif;
          transition: all 0.3s ease;
        }

        .form-group-premium input:focus,
        .form-group-premium textarea:focus {
          outline: none;
          border-color: #e8b339;
          box-shadow: 0 0 0 3px rgba(232,179,57,0.1);
        }

        .form-actions-premium {
          display: flex;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: #e8b339;
          border: none;
          border-radius: 12px;
          color: #1b4f6e;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-submit:hover {
          background: #d4a32a;
          transform: translateY(-2px);
        }

        .messages-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .bulk-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-mark-all,
        .btn-delete-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 10px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-mark-all {
          background: #d4edda;
          color: #27ae60;
        }

        .btn-mark-all:hover {
          background: #27ae60;
          color: white;
        }

        .btn-delete-all {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete-all:hover {
          background: #dc2626;
          color: white;
        }

        .messages-list-premium {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          gap: 1rem;
          transition: all 0.3s ease;
          border-right: 3px solid transparent;
        }

        .message-card.unread {
          background: #fff8e7;
          border-right-color: #e8b339;
        }

        .message-status {
          width: 30px;
          display: flex;
          justify-content: center;
          padding-top: 0.25rem;
        }

        .unread-dot {
          width: 10px;
          height: 10px;
          background: #e8b339;
          border-radius: 50%;
        }

        .message-content {
          flex: 1;
        }

        .message-sender {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .sender-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .sender-info strong {
          color: #1b4f6e;
        }

        .sender-info span {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .message-date {
          font-size: 0.7rem;
          color: #adb5bd;
        }

        .message-text p {
          color: #4a5568;
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }

        .message-actions-premium {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-read,
        .btn-delete-message {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.8rem;
          border: none;
          border-radius: 8px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-read {
          background: #e8b33920;
          color: #e8b339;
        }

        .btn-read:hover {
          background: #e8b339;
          color: white;
        }

        .btn-delete-message {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete-message:hover {
          background: #dc2626;
          color: white;
        }

        .empty-state-messages {
          text-align: center;
          padding: 3rem;
          color: #adb5bd;
        }

        .empty-state-messages svg {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state-messages h3 {
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .form-grid-two {
            grid-template-columns: 1fr;
          }
          
          .social-grid {
            grid-template-columns: 1fr;
          }
          
          .message-sender {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .messages-header {
            flex-direction: column;
          }
          
          .bulk-actions {
            width: 100%;
          }
          
          .btn-mark-all,
          .btn-delete-all {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageContact;