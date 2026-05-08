import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaEdit, FaTimes, FaUpload, FaImage, FaFilePdf, FaYoutube, FaCalendarAlt, FaMicrophoneAlt, FaEye, FaTelegram, FaVideo, FaFacebook, FaUsers } from 'react-icons/fa';
import dayjs from 'dayjs';

function ManageSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    session_date: '',
    youtube_url: '',
    telegram_url: '',
    meet_url: '',
    zoom_url: '',
    facebook_url: '',
    image: null,
    file: null
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    const { data } = await supabase
      .from('listening_sessions')
      .select('*')
      .order('session_date', { ascending: false });
    if (data) setSessions(data);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file: file });
      setPreviewFile({ name: file.name, size: (file.size / 1024).toFixed(1) });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    let fileUrl = null;

    if (formData.image && typeof formData.image !== 'string') {
      imageUrl = await uploadFile('sessions', formData.image, 'images/');
    }
    if (formData.file) {
      fileUrl = await uploadFile('sessions', formData.file, 'files/');
    }

    const sessionData = {
      title: formData.title,
      details: formData.details,
      session_date: formData.session_date || null,
      youtube_url: formData.youtube_url,
      telegram_url: formData.telegram_url,
      meet_url: formData.meet_url,
      zoom_url: formData.zoom_url,
      facebook_url: formData.facebook_url,
      image_url: imageUrl,
      file_url: fileUrl
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('listening_sessions')
        .update(sessionData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('listening_sessions')
        .insert([sessionData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل المجلس بنجاح' : 'تم إضافة المجلس بنجاح', 'success');
      resetForm();
      fetchSessions();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ 
      title: '', 
      details: '', 
      session_date: '', 
      youtube_url: '', 
      telegram_url: '',
      meet_url: '',
      zoom_url: '',
      facebook_url: '',
      image: null, 
      file: null 
    });
    setEditingId(null);
    setPreviewImage(null);
    setPreviewFile(null);
  }

  function handleEdit(session) {
    setEditingId(session.id);
    setFormData({
      title: session.title,
      details: session.details || '',
      session_date: session.session_date || '',
      youtube_url: session.youtube_url || '',
      telegram_url: session.telegram_url || '',
      meet_url: session.meet_url || '',
      zoom_url: session.zoom_url || '',
      facebook_url: session.facebook_url || '',
      image: null,
      file: null
    });
    setPreviewImage(session.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا المجلس؟')) {
      const { error } = await supabase
        .from('listening_sessions')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف المجلس بنجاح', 'success');
        fetchSessions();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return dayjs(date).format('DD MMMM YYYY');
  };

  // قائمة الروابط لعرضها في البطاقة
  const getAvailableLinks = (session) => {
    const links = [];
    if (session.youtube_url) links.push({ type: 'youtube', url: session.youtube_url, icon: FaYoutube, label: 'يوتيوب', color: '#ff0000' });
    if (session.telegram_url) links.push({ type: 'telegram', url: session.telegram_url, icon: FaTelegram, label: 'تيليجرام', color: '#0088cc' });
    if (session.meet_url) links.push({ type: 'meet', url: session.meet_url, icon: FaVideo, label: 'Google Meet', color: '#0f9d58' });
    if (session.zoom_url) links.push({ type: 'zoom', url: session.zoom_url, icon: FaUsers, label: 'Zoom', color: '#0e8cff' });
    if (session.facebook_url) links.push({ type: 'facebook', url: session.facebook_url, icon: FaFacebook, label: 'فيسبوك', color: '#1877f2' });
    return links;
  };

  return (
    <div className="manage-sessions-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل مجلس سماع' : '🎙️ إضافة مجلس سماع جديد'}</h2>
          <p>{editingId ? 'قم بتعديل بيانات المجلس' : 'أضف مجلس سماع جديداً إلى المكتبة'}</p>
        </div>

        <form onSubmit={handleSubmit} className="session-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان المجلس</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: مجلس سماع صحيح البخاري"
                />
              </div>

              <div className="form-group-premium">
                <label>تفاصيل المجلس</label>
                <textarea
                  rows="4"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="تفاصيل المجلس، تاريخه، المشاركون، السند..."
                />
              </div>

              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label><FaCalendarAlt /> تاريخ المجلس</label>
                  <input
                    type="date"
                    value={formData.session_date}
                    onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  />
                </div>
              </div>

              {/* روابط إضافية */}
              <div className="links-section">
                <h4 className="links-title">روابط إضافية (اختيارية)</h4>
                <div className="links-grid">
                  <div className="form-group-premium">
                    <label><FaYoutube style={{ color: '#ff0000' }} /> رابط يوتيوب</label>
                    <input
                      type="url"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="form-group-premium">
                    <label><FaTelegram style={{ color: '#0088cc' }} /> رابط تيليجرام</label>
                    <input
                      type="url"
                      value={formData.telegram_url}
                      onChange={(e) => setFormData({ ...formData, telegram_url: e.target.value })}
                      placeholder="https://t.me/..."
                    />
                  </div>

                  <div className="form-group-premium">
                    <label><FaVideo style={{ color: '#0f9d58' }} /> رابط Google Meet</label>
                    <input
                      type="url"
                      value={formData.meet_url}
                      onChange={(e) => setFormData({ ...formData, meet_url: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  <div className="form-group-premium">
                    <label><FaUsers style={{ color: '#0e8cff' }} /> رابط Zoom</label>
                    <input
                      type="url"
                      value={formData.zoom_url}
                      onChange={(e) => setFormData({ ...formData, zoom_url: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>

                  <div className="form-group-premium">
                    <label><FaFacebook style={{ color: '#1877f2' }} /> رابط فيسبوك</label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة المجلس (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('session-image').click()}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <FaImage />
                      <span>انقر لرفع صورة</span>
                      <small>jpg, png, gif</small>
                    </div>
                  )}
                  <input
                    id="session-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {previewImage && !previewImage.startsWith('http') && (
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData({ ...formData, image: null });
                    }}
                  >
                    <FaTimes /> إزالة الصورة
                  </button>
                )}
              </div>

              <div className="file-upload-box">
                <label>ملف مرفق (PDF - اختياري)</label>
                <div 
                  className="upload-area file-area"
                  onClick={() => document.getElementById('session-file').click()}
                >
                  {previewFile ? (
                    <div className="file-preview">
                      <FaFilePdf />
                      <div className="file-info">
                        <span>{previewFile.name}</span>
                        <small>{previewFile.size} KB</small>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FaUpload />
                      <span>انقر لرفع ملف PDF</span>
                      <small>PDF فقط</small>
                    </div>
                  )}
                  <input
                    id="session-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {previewFile && (
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => {
                      setPreviewFile(null);
                      setFormData({ ...formData, file: null });
                    }}
                  >
                    <FaTimes /> إزالة الملف
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions-premium">
            {editingId && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                <FaTimes /> إلغاء
              </button>
            )}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'جاري المعالجة...' : (
                <>
                  <FaSave /> {editingId ? 'تحديث المجلس' : 'إضافة المجلس'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📻 مجالس السماع المسجلة</h2>
          <p>{sessions.length} مجلس في المكتبة</p>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <FaMicrophoneAlt />
            <h3>لا توجد مجالس سماع</h3>
            <p>قم بإضافة مجلس سماع جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="sessions-grid-premium">
            {sessions.map(session => {
              const links = getAvailableLinks(session);
              return (
                <div key={session.id} className="session-card-premium">
                  <div className="session-image">
                    {session.image_url ? (
                      <img src={session.image_url} alt={session.title} />
                    ) : (
                      <div className="image-placeholder">
                        <FaMicrophoneAlt />
                      </div>
                    )}
                  </div>
                  <div className="session-details">
                    <h4>{session.title}</h4>
                    {session.session_date && (
                      <div className="session-date">
                        <FaCalendarAlt /> {formatDate(session.session_date)}
                      </div>
                    )}
                    {session.details && (
                      <p className="session-description">
                        {session.details.length > 100 
                          ? session.details.substring(0, 100) + '...' 
                          : session.details}
                      </p>
                    )}
                    
                    {/* عرض الروابط المتاحة */}
                    {links.length > 0 && (
                      <div className="session-links-list">
                        {links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="session-link-btn"
                            style={{ backgroundColor: link.color }}
                          >
                            <link.icon /> {link.label}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="session-meta">
                      {session.youtube_url && (
                        <span className="youtube-badge">
                          <FaYoutube /> فيديو
                        </span>
                      )}
                      {session.file_url && (
                        <span className="pdf-badge">
                          <FaFilePdf /> PDF
                        </span>
                      )}
                    </div>
                    <div className="session-actions">
                      {session.youtube_url && (
                        <a 
                          href={getYoutubeEmbedUrl(session.youtube_url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="watch-btn"
                        >
                          <FaYoutube /> مشاهدة
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(session)}
                        className="edit-btn"
                      >
                        <FaEdit /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="delete-btn"
                      >
                        <FaTrash /> حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .manage-sessions-premium {
          max-width: 1200px;
          margin: 0 auto;
        }

        .form-section-premium,
        .items-section-premium {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2rem;
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

        .session-form-premium {
          max-width: 100%;
        }

        .form-grid-premium {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2rem;
        }

        .form-group-premium {
          margin-bottom: 1.25rem;
        }

        .form-group-premium label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #1b4f6e;
          font-size: 0.85rem;
        }

        .form-group-premium label svg {
          margin-left: 0.25rem;
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

        .form-row-premium {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .links-section {
          margin-top: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e9ecef;
        }

        .links-title {
          font-size: 0.9rem;
          color: #1b4f6e;
          margin-bottom: 1rem;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .file-upload-box {
          margin-bottom: 1.5rem;
        }

        .file-upload-box label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #1b4f6e;
          font-size: 0.85rem;
        }

        .upload-area {
          background: #f8f9fa;
          border: 2px dashed #e9ecef;
          border-radius: 16px;
          cursor: pointer;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .upload-area:hover {
          border-color: #e8b339;
          background: #fff8e7;
        }

        .upload-area img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 14px;
        }

        .upload-placeholder {
          text-align: center;
          color: #adb5bd;
          padding: 1rem;
        }

        .upload-placeholder svg {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .upload-placeholder span {
          display: block;
          font-size: 0.85rem;
        }

        .upload-placeholder small {
          font-size: 0.7rem;
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .file-preview svg {
          font-size: 2rem;
          color: #dc2626;
        }

        .file-info span {
          display: block;
          font-size: 0.8rem;
          color: #1b4f6e;
        }

        .file-info small {
          font-size: 0.7rem;
          color: #6c757d;
        }

        .remove-file-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.4rem;
          background: #fee2e2;
          border: none;
          border-radius: 8px;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          font-size: 0.75rem;
        }

        .form-actions-premium {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .btn-submit,
        .btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-submit {
          background: #e8b339;
          color: #1b4f6e;
        }

        .btn-submit:hover {
          background: #d4a32a;
          transform: translateY(-2px);
        }

        .btn-cancel {
          background: #f8f9fa;
          color: #6c757d;
        }

        .btn-cancel:hover {
          background: #e9ecef;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Sessions Grid */
        .sessions-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        .session-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .session-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }

        .session-image {
          height: 160px;
          overflow: hidden;
        }

        .session-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 3rem;
        }

        .session-details {
          padding: 1rem;
        }

        .session-details h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .session-date {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: #e8b339;
          margin-bottom: 0.5rem;
        }

        .session-description {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .session-links-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .session-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          text-decoration: none;
          font-size: 0.7rem;
          color: white;
          transition: all 0.2s ease;
        }

        .session-link-btn:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }

        .session-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .youtube-badge,
        .pdf-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }

        .youtube-badge {
          background: #ff000020;
          color: #ff0000;
        }

        .pdf-badge {
          background: #dc262620;
          color: #dc2626;
        }

        .session-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .watch-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.7rem;
          background: #ff0000;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.7rem;
        }

        .edit-btn,
        .delete-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.7rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #e8b33920;
          color: #e8b339;
        }

        .edit-btn:hover {
          background: #e8b339;
          color: white;
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #dc2626;
          color: white;
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
          .form-grid-premium {
            grid-template-columns: 1fr;
          }
          
          .form-row-premium {
            grid-template-columns: 1fr;
          }
          
          .links-grid {
            grid-template-columns: 1fr;
          }
          
          .sessions-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageSessions;