import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  FaTelegram, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, 
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaTrash, 
  FaCheckCircle, FaEnvelopeOpen, FaUser, FaCalendarAlt, 
  FaUserPlus, FaTimes, FaSpinner 
} from 'react-icons/fa';

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
const [membershipRequests, setMembershipRequests] = useState([]);
const [members, setMembers] = useState([]);
const [loading, setLoading] = useState(false);
const [activeTab, setActiveTab] = useState('info');
const [activeSubTab, setActiveSubTab] = useState('pending');  // أضف هذا السطر
const [saving, setSaving] = useState(false);
const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchContactInfo();
    fetchMessages();
    fetchMembershipRequests();
    fetchMembers();
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
      }
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function fetchMembershipRequests() {
    try {
      const { data, error } = await supabase
        .from('membership_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setMembershipRequests(data);
    } catch (error) {
      console.error('Error fetching membership requests:', error);
    }
  }

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
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

  // دوال إدارة العضوية
  async function approveRequest(id, fullName, country, email) {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) return;
    
    try {
      const { error: updateError } = await supabase
        .from('membership_requests')
        .update({ status: 'approved', approved_at: new Date() })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      const { error: insertError } = await supabase
        .from('members')
        .insert([{ full_name: fullName, country: country, email: email }]);
      
      if (insertError) throw insertError;
      
      showToast('تم الموافقة على العضوية وإضافة العضو', 'success');
      fetchMembershipRequests();
      fetchMembers();
    } catch (error) {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
  }

  async function rejectRequest(id) {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    
    try {
      const { error } = await supabase
        .from('membership_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) throw error;
      
      showToast('تم رفض الطلب', 'success');
      fetchMembershipRequests();
    } catch (error) {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
  }

  async function deleteMember(id, fullName) {
    if (!confirm(`هل أنت متأكد من حذف العضو "${fullName}"؟`)) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showToast('تم حذف العضو بنجاح', 'success');
      fetchMembers();
    } catch (error) {
      showToast('حدث خطأ: ' + error.message, 'error');
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
  const pendingRequestsCount = membershipRequests.filter(r => r.status === 'pending').length;

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
        <button 
          className={`tab-btn ${activeTab === 'membership' ? 'active' : ''}`}
          onClick={() => setActiveTab('membership')}
        >
          <FaUserPlus /> طلبات العضوية
          {pendingRequestsCount > 0 && <span className="badge">{pendingRequestsCount}</span>}
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

      {activeTab === 'membership' && (
        <div className="membership-section">
          <div className="section-header-premium">
            <h2>📋 طلبات العضوية</h2>
            <p>إدارة طلبات التسجيل في مدرسة توحدنا للسماع</p>
          </div>

          <div className="membership-stats">
            <div className={`stat-badge pending ${pendingRequestsCount > 0 ? 'has-items' : ''}`}>
              قيد الانتظار: {pendingRequestsCount}
            </div>
            <div className="stat-badge approved">
              تم الموافقة: {membershipRequests.filter(r => r.status === 'approved').length}
            </div>
            <div className="stat-badge rejected">
              مرفوض: {membershipRequests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="stat-badge total">
              إجمالي الأعضاء: {members.length}
            </div>
          </div>

          <div className="membership-sub-tabs">
            <button 
              className={`sub-tab ${activeSubTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('pending')}
            >
              طلبات الانتظار {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('all')}
            >
              جميع الطلبات
            </button>
            <button 
              className={`sub-tab ${activeSubTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('members')}
            >
              الأعضاء المعتمدون ({members.length})
            </button>
          </div>

          {activeSubTab === 'pending' && (
            <div className="membership-requests-list">
              {membershipRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="empty-state">
                  <FaUserPlus />
                  <h3>لا توجد طلبات قيد الانتظار</h3>
                  <p>جميع الطلبات تمت معالجتها</p>
                </div>
              ) : (
                membershipRequests.filter(r => r.status === 'pending').map(request => (
                  <div key={request.id} className="request-card pending">
                    <div className="request-header">
                      <div className="request-user">
                        <div className="user-avatar">
                          {request.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="user-details">
                          <strong>{request.full_name}</strong>
                          <span>{request.country}</span>
                          <span className="request-email">{request.email}</span>
                        </div>
                      </div>
                      <div className="request-status-badge pending">قيد الانتظار</div>
                    </div>
                    <div className="request-meta">
                      تاريخ الطلب: {new Date(request.created_at).toLocaleDateString('ar')}
                    </div>
                    <div className="request-actions">
                      <button onClick={() => approveRequest(request.id, request.full_name, request.country, request.email)} className="btn-approve">
                        <FaCheckCircle /> موافقة
                      </button>
                      <button onClick={() => rejectRequest(request.id)} className="btn-reject">
                        <FaTimes /> رفض
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'all' && (
            <div className="membership-requests-list">
              {membershipRequests.length === 0 ? (
                <div className="empty-state">
                  <FaUserPlus />
                  <h3>لا توجد طلبات</h3>
                  <p>لم يتم تقديم أي طلب عضوية بعد</p>
                </div>
              ) : (
                membershipRequests.map(request => (
                  <div key={request.id} className={`request-card ${request.status}`}>
                    <div className="request-header">
                      <div className="request-user">
                        <div className="user-avatar">
                          {request.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="user-details">
                          <strong>{request.full_name}</strong>
                          <span>{request.country}</span>
                          <span className="request-email">{request.email}</span>
                        </div>
                      </div>
                      <div className={`request-status-badge ${request.status}`}>
                        {request.status === 'pending' ? 'قيد الانتظار' : 
                         request.status === 'approved' ? 'تم الموافقة' : 'مرفوض'}
                      </div>
                    </div>
                    <div className="request-meta">
                      تاريخ الطلب: {new Date(request.created_at).toLocaleDateString('ar')}
                      {request.approved_at && ` | تاريخ الموافقة: ${new Date(request.approved_at).toLocaleDateString('ar')}`}
                    </div>
                    {request.status === 'pending' && (
                      <div className="request-actions">
                        <button onClick={() => approveRequest(request.id, request.full_name, request.country, request.email)} className="btn-approve">
                          <FaCheckCircle /> موافقة
                        </button>
                        <button onClick={() => rejectRequest(request.id)} className="btn-reject">
                          <FaTimes /> رفض
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'members' && (
            <div className="members-list">
              {members.length === 0 ? (
                <div className="empty-state">
                  <FaUser />
                  <h3>لا يوجد أعضاء معتمدون</h3>
                  <p>قم بالموافقة على طلبات العضوية لإضافة أعضاء</p>
                </div>
              ) : (
                members.map(member => (
                  <div key={member.id} className="member-card-admin">
                    <div className="member-avatar-admin">
                      {member.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="member-info-admin">
                      <strong>{member.full_name}</strong>
                      <span>{member.country}</span>
                      <small className="member-email-admin">{member.email}</small>
                    </div>
                    <button onClick={() => deleteMember(member.id, member.full_name)} className="btn-delete-member">
                      <FaTrash /> حذف
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .manage-contact-premium {
          max-width: 1200px;
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
        .messages-section,
        .membership-section {
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

        /* Membership Styles */
        .membership-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .stat-badge {
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .stat-badge.pending {
          background: #fff3cd;
          color: #f39c12;
        }
        .stat-badge.pending.has-items {
          animation: pulse 1s infinite;
        }
        .stat-badge.approved {
          background: #d4edda;
          color: #27ae60;
        }
        .stat-badge.rejected {
          background: #fee2e2;
          color: #dc2626;
        }
        .stat-badge.total {
          background: #e8b33920;
          color: #e8b339;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .membership-sub-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .sub-tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.2s ease;
        }

        .sub-tab.active {
          color: #e8b339;
          border-bottom: 2px solid #e8b339;
        }

        .membership-requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .request-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          border-right: 3px solid;
        }

        .request-card.pending {
          border-right-color: #f39c12;
        }
        .request-card.approved {
          border-right-color: #27ae60;
        }
        .request-card.rejected {
          border-right-color: #dc2626;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .request-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #e8b339;
        }

        .user-details strong {
          display: block;
          color: #1b4f6e;
        }

        .user-details span {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .request-email {
          font-size: 0.7rem;
          color: #e8b339 !important;
        }

        .request-status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
        }
        .request-status-badge.pending {
          background: #fff3cd;
          color: #f39c12;
        }
        .request-status-badge.approved {
          background: #d4edda;
          color: #27ae60;
        }
        .request-status-badge.rejected {
          background: #fee2e2;
          color: #dc2626;
        }

        .request-meta {
          font-size: 0.7rem;
          color: #adb5bd;
          margin-bottom: 0.75rem;
        }

        .request-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .btn-approve {
          background: #d4edda;
          color: #27ae60;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .btn-reject {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .members-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .member-card-admin {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .member-avatar-admin {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          color: #e8b339;
        }

        .member-info-admin {
          flex: 1;
        }

        .member-info-admin strong {
          display: block;
          color: #1b4f6e;
          font-size: 0.9rem;
        }

        .member-info-admin span {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .member-email-admin {
          font-size: 0.65rem;
          color: #e8b339 !important;
        }

        .btn-delete-member {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          padding: 0.3rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #adb5bd;
        }

        .empty-state svg {
          font-size: 3rem;
          margin-bottom: 1rem;
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
          
          .membership-stats {
            flex-direction: column;
          }
          
          .request-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .member-card-admin {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageContact;