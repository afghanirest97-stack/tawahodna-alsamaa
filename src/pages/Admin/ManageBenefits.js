import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaEdit, FaTimes, FaUpload, FaImage, FaFilePdf, FaYoutube, FaTag, FaLightbulb } from 'react-icons/fa';

function ManageBenefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    youtube_url: '',
    image: null,
    file: null
  });

  useEffect(() => {
    fetchBenefits();
  }, []);

  async function fetchBenefits() {
    const { data } = await supabase
      .from('benefits')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setBenefits(data);
      const uniqueCategories = [...new Set(data.map(b => b.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
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
      imageUrl = await uploadFile('benefits', formData.image, 'images/');
    }
    if (formData.file) {
      fileUrl = await uploadFile('benefits', formData.file, 'files/');
    }

    const benefitData = {
      title: formData.title,
      content: formData.content,
      category: formData.category || null,
      youtube_url: formData.youtube_url,
      image_url: imageUrl,
      file_url: fileUrl
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('benefits')
        .update(benefitData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('benefits')
        .insert([benefitData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل الفائدة بنجاح' : 'تم إضافة الفائدة بنجاح', 'success');
      resetForm();
      fetchBenefits();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ title: '', content: '', category: '', youtube_url: '', image: null, file: null });
    setEditingId(null);
    setPreviewImage(null);
    setPreviewFile(null);
  }

  function handleEdit(benefit) {
    setEditingId(benefit.id);
    setFormData({
      title: benefit.title,
      content: benefit.content,
      category: benefit.category || '',
      youtube_url: benefit.youtube_url || '',
      image: null,
      file: null
    });
    setPreviewImage(benefit.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفائدة؟')) {
      const { error } = await supabase
        .from('benefits')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف الفائدة بنجاح', 'success');
        fetchBenefits();
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
    <div className="manage-benefits-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل فائدة علمية' : '💡 إضافة فائدة علمية جديدة'}</h2>
          <p>{editingId ? 'قم بتعديل بيانات الفائدة' : 'أضف فائدة علمية جديدة إلى المكتبة'}</p>
        </div>

        <form onSubmit={handleSubmit} className="benefit-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان الفائدة</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="عنوان الفائدة العلمية"
                />
              </div>

              <div className="form-group-premium">
                <label>نص الفائدة</label>
                <textarea
                  rows="6"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="اكتب نص الفائدة العلمية هنا..."
                />
              </div>

              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label><FaTag /> التصنيف</label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="مثال: حديث، فقه، عقيدة..."
                  />
                  <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
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
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة الفائدة (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('benefit-image').click()}
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
                    id="benefit-image"
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
                  onClick={() => document.getElementById('benefit-file').click()}
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
                    id="benefit-file"
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
                  <FaSave /> {editingId ? 'تحديث الفائدة' : 'إضافة الفائدة'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📚 الفوائد العلمية</h2>
          <p>{benefits.length} فائدة في المكتبة</p>
        </div>

        {benefits.length === 0 ? (
          <div className="empty-state">
            <FaLightbulb />
            <h3>لا توجد فوائد</h3>
            <p>قم بإضافة فائدة جديدة باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="benefits-grid-premium">
            {benefits.map(benefit => (
              <div key={benefit.id} className="benefit-card-premium">
                <div className="benefit-header">
                  <div className="benefit-icon">
                    <FaLightbulb />
                  </div>
                  <div className="benefit-title">
                    <h4>{benefit.title}</h4>
                    {benefit.category && (
                      <span className="category-badge">
                        <FaTag /> {benefit.category}
                      </span>
                    )}
                  </div>
                </div>
                <p className="benefit-content-preview">
                  {benefit.content?.substring(0, 120)}...
                </p>
                <div className="benefit-meta">
                  {benefit.youtube_url && (
                    <a 
                      href={getYoutubeEmbedUrl(benefit.youtube_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="youtube-link"
                    >
                      <FaYoutube /> مشاهدة
                    </a>
                  )}
                  {benefit.file_url && (
                    <span className="file-indicator">
                      <FaFilePdf /> PDF
                    </span>
                  )}
                </div>
                <div className="benefit-footer">
                  <button
                    onClick={() => handleEdit(benefit)}
                    className="edit-btn"
                  >
                    <FaEdit /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(benefit.id)}
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
        .manage-benefits-premium {
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

        .benefit-form-premium {
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

        /* Benefits Grid */
        .benefits-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .benefit-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .benefit-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .benefit-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .benefit-icon {
          width: 50px;
          height: 50px;
          background: #e8b33920;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 1.5rem;
        }

        .benefit-title {
          flex: 1;
        }

        .benefit-title h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          background: #e8b33920;
          color: #e8b339;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }

        .benefit-content-preview {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .benefit-meta {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .youtube-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          background: #ff000020;
          color: #ff0000;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          text-decoration: none;
        }

        .file-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          background: #dc262620;
          color: #dc2626;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }

        .benefit-footer {
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
          
          .form-row-premium {
            grid-template-columns: 1fr;
          }
          
          .benefits-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageBenefits;