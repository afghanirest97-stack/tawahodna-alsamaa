import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaEdit, FaTimes, FaUpload, FaImage, FaFilePdf, FaEye, FaCalendarAlt, FaNewspaper } from 'react-icons/fa';

function ManageArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    image: null,
    file: null
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setArticles(data);
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

    if (formData.image) {
      imageUrl = await uploadFile('articles', formData.image, 'images/');
    }
    if (formData.file) {
      fileUrl = await uploadFile('articles', formData.file, 'files/');
    }

    const articleData = {
      title: formData.title,
      content: formData.content,
      summary: formData.summary || formData.content.substring(0, 200),
      image_url: imageUrl,
      file_url: fileUrl
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('articles')
        .insert([articleData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل المقال بنجاح' : 'تم إضافة المقال بنجاح', 'success');
      resetForm();
      fetchArticles();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ title: '', content: '', summary: '', image: null, file: null });
    setEditingId(null);
    setPreviewImage(null);
    setPreviewFile(null);
  }

  function handleEdit(article) {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      image: null,
      file: null
    });
    setPreviewImage(article.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف المقال بنجاح', 'success');
        fetchArticles();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="manage-articles-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل مقال' : '📝 إضافة مقال جديد'}</h2>
          <p>{editingId ? 'قم بتعديل بيانات المقال' : 'أضف مقالاً جديداً إلى المكتبة'}</p>
        </div>

        <form onSubmit={handleSubmit} className="article-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان المقال</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان المقال"
                />
              </div>

              <div className="form-group-premium">
                <label>ملخص المقال (اختياري)</label>
                <textarea
                  rows="2"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="ملخص قصير للمقال (سيظهر في بطاقة المقال)"
                />
              </div>

              <div className="form-group-premium">
                <label>نص المقال</label>
                <textarea
                  rows="10"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="اكتب محتوى المقال هنا..."
                />
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة المقال (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('article-image').click()}
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
                    id="article-image"
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
                  onClick={() => document.getElementById('article-file').click()}
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
                    id="article-file"
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
                  <FaSave /> {editingId ? 'تحديث المقال' : 'إضافة المقال'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📰 المقالات المنشورة</h2>
          <p>{articles.length} مقال في المكتبة</p>
        </div>

        {articles.length === 0 ? (
          <div className="empty-state">
            <FaNewspaper />
            <h3>لا توجد مقالات</h3>
            <p>قم بإضافة مقال جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="articles-grid-premium">
            {articles.map(article => (
              <div key={article.id} className="article-card-premium">
                <div className="article-header">
                  {article.image_url ? (
                    <img src={article.image_url} alt={article.title} className="article-image" />
                  ) : (
                    <div className="article-image-placeholder">
                      <FaNewspaper />
                    </div>
                  )}
                  <div className="article-info">
                    <h4>{article.title}</h4>
                    <div className="article-meta">
                      <span><FaCalendarAlt /> {formatDate(article.created_at)}</span>
                      {article.file_url && <span className="pdf-badge">PDF</span>}
                    </div>
                  </div>
                </div>
                <p className="article-summary">
                  {article.summary || article.content?.substring(0, 100)}...
                </p>
                <div className="article-footer">
                  <button
                    onClick={() => handleEdit(article)}
                    className="edit-btn"
                  >
                    <FaEdit /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="delete-btn"
                  >
                    <FaTrash /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .manage-articles-premium {
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

        .article-form-premium {
          max-width: 100%;
        }

        .form-grid-premium {
          display: grid;
          grid-template-columns: 1fr 300px;
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
          font-size: 2.5rem;
          color: #dc2626;
        }

        .file-info span {
          display: block;
          font-size: 0.85rem;
          color: #1b4f6e;
        }

        .file-info small {
          font-size: 0.7rem;
          color: #6c757d;
        }

        .remove-file-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.5rem;
          background: #fee2e2;
          border: none;
          border-radius: 10px;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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
          padding: 0.75rem 1.5rem;
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

        /* Articles Grid */
        .articles-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .article-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .article-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .article-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .article-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
        }

        .article-image-placeholder {
          width: 80px;
          height: 80px;
          background: #e8b33920;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 2rem;
        }

        .article-info {
          flex: 1;
        }

        .article-info h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .article-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.7rem;
          color: #6c757d;
        }

        .article-meta svg {
          margin-left: 0.25rem;
        }

        .pdf-badge {
          background: #dc262620;
          color: #dc2626;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }

        .article-summary {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .article-footer {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          border-top: 1px solid #e9ecef;
          padding-top: 0.75rem;
        }

        .edit-btn,
        .delete-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75rem;
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
          
          .articles-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageArticles;