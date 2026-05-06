import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaEdit, FaTimes, FaUpload, FaImage, FaFilePdf, FaYoutube, FaUser, FaCertificate } from 'react-icons/fa';

function ManageIjaza() {
  const [ijazat, setIjazat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sheikh_name: '',
    youtube_url: '',
    image: null,
    file: null
  });

  useEffect(() => {
    fetchIjazat();
  }, []);

  async function fetchIjazat() {
    const { data } = await supabase
      .from('ijazat')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setIjazat(data);
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
      imageUrl = await uploadFile('ijaza', formData.image, 'images/');
    }
    if (formData.file) {
      fileUrl = await uploadFile('ijaza', formData.file, 'files/');
    }

    const ijazaData = {
      title: formData.title,
      description: formData.description,
      sheikh_name: formData.sheikh_name,
      youtube_url: formData.youtube_url,
      image_url: imageUrl,
      file_url: fileUrl
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('ijazat')
        .update(ijazaData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('ijazat')
        .insert([ijazaData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل الإجازة بنجاح' : 'تم إضافة الإجازة بنجاح', 'success');
      resetForm();
      fetchIjazat();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ title: '', description: '', sheikh_name: '', youtube_url: '', image: null, file: null });
    setEditingId(null);
    setPreviewImage(null);
    setPreviewFile(null);
  }

  function handleEdit(ijaza) {
    setEditingId(ijaza.id);
    setFormData({
      title: ijaza.title,
      description: ijaza.description || '',
      sheikh_name: ijaza.sheikh_name || '',
      youtube_url: ijaza.youtube_url || '',
      image: null,
      file: null
    });
    setPreviewImage(ijaza.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذه الإجازة؟')) {
      const { error } = await supabase
        .from('ijazat')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف الإجازة بنجاح', 'success');
        fetchIjazat();
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

  return (
    <div className="manage-ijaza-premium">
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل إجازة' : '📜 إضافة إجازة جديدة'}</h2>
          <p>{editingId ? 'قم بتعديل بيانات الإجازة' : 'أضف إجازة جديدة إلى المكتبة'}</p>
        </div>

        <form onSubmit={handleSubmit} className="ijaza-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان الإجازة</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: إجازة صحيح البخاري"
                />
              </div>

              <div className="form-group-premium">
                <label><FaUser /> اسم الشيخ المجيز</label>
                <input
                  type="text"
                  value={formData.sheikh_name}
                  onChange={(e) => setFormData({ ...formData, sheikh_name: e.target.value })}
                  placeholder="اسم الشيخ الذي أجاز"
                />
              </div>

              <div className="form-group-premium">
                <label>وصف الإجازة</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل الإجازة وسندها..."
                />
              </div>

              <div className="form-group-premium">
                <label><FaYoutube /> رابط يوتيوب (اختياري)</label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة الإجازة (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('ijaza-image').click()}
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
                    id="ijaza-image"
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
                <label>ملف الإجازة (PDF - اختياري)</label>
                <div 
                  className="upload-area file-area"
                  onClick={() => document.getElementById('ijaza-file').click()}
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
                    id="ijaza-file"
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
                  <FaSave /> {editingId ? 'تحديث الإجازة' : 'إضافة الإجازة'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📜 الإجازات المسجلة</h2>
          <p>{ijazat.length} إجازة في المكتبة</p>
        </div>

        {ijazat.length === 0 ? (
          <div className="empty-state">
            <FaCertificate />
            <h3>لا توجد إجازات</h3>
            <p>قم بإضافة إجازة جديدة باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="ijazat-grid-premium">
            {ijazat.map(ijaza => (
              <div key={ijaza.id} className="ijaza-card-premium">
                <div className="ijaza-header">
                  {ijaza.image_url ? (
                    <img src={ijaza.image_url} alt={ijaza.title} className="ijaza-image" />
                  ) : (
                    <div className="ijaza-icon">
                      <FaCertificate />
                    </div>
                  )}
                  <div className="ijaza-title">
                    <h4>{ijaza.title}</h4>
                    {ijaza.sheikh_name && (
                      <span className="sheikh-name">
                        <FaUser /> {ijaza.sheikh_name}
                      </span>
                    )}
                  </div>
                </div>
                {ijaza.description && (
                  <p className="ijaza-description">
                    {ijaza.description.length > 100 
                      ? ijaza.description.substring(0, 100) + '...' 
                      : ijaza.description}
                  </p>
                )}
                <div className="ijaza-meta">
                  {ijaza.youtube_url && (
                    <span className="youtube-badge">
                      <FaYoutube /> فيديو
                    </span>
                  )}
                  {ijaza.file_url && (
                    <span className="pdf-badge">
                      <FaFilePdf /> PDF
                    </span>
                  )}
                </div>
                <div className="ijaza-actions">
                  <button onClick={() => handleEdit(ijaza)} className="edit-btn">
                    <FaEdit /> تعديل
                  </button>
                  <button onClick={() => handleDelete(ijaza.id)} className="delete-btn">
                    <FaTrash /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .manage-ijaza-premium {
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

        .file-upload-box {
          margin-bottom: 1rem;
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
          min-height: 160px;
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
          height: 160px;
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

        .ijazat-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .ijaza-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .ijaza-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .ijaza-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .ijaza-image {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
        }

        .ijaza-icon {
          width: 60px;
          height: 60px;
          background: #e8b33920;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 1.8rem;
        }

        .ijaza-title {
          flex: 1;
        }

        .ijaza-title h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .sheikh-name {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: #e8b339;
        }

        .ijaza-description {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        .ijaza-meta {
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

        .ijaza-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          border-top: 1px solid #e9ecef;
          padding-top: 0.75rem;
        }

        .edit-btn,
        .delete-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.8rem;
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
          
          .ijazat-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageIjaza;