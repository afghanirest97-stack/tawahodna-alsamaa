import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaEdit, FaTimes, FaUpload, FaImage, FaExternalLinkAlt, FaTag, FaLink, FaGlobe } from 'react-icons/fa';

function ManageLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    image: null
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    const { data } = await supabase
      .from('important_links')
      .select('*')
      .order('category', { ascending: true });
    if (data) {
      setLinks(data);
      const uniqueCategories = [...new Set(data.map(l => l.category).filter(Boolean))];
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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    if (formData.image && typeof formData.image !== 'string') {
      imageUrl = await uploadFile('links', formData.image, 'images/');
    }

    const linkData = {
      title: formData.title,
      description: formData.description,
      url: formData.url,
      category: formData.category || null,
      image_url: imageUrl
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('important_links')
        .update(linkData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('important_links')
        .insert([linkData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل الرابط بنجاح' : 'تم إضافة الرابط بنجاح', 'success');
      resetForm();
      fetchLinks();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ title: '', description: '', url: '', category: '', image: null });
    setEditingId(null);
    setPreviewImage(null);
  }

  function handleEdit(link) {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      description: link.description || '',
      url: link.url,
      category: link.category || '',
      image: null
    });
    setPreviewImage(link.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
      const { error } = await supabase
        .from('important_links')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف الرابط بنجاح', 'success');
        fetchLinks();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  // استخراج اسم النطاق من الرابط
  const getDomainName = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  // اختصار الرابط
  const shortenUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="manage-links-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل رابط' : '🔗 إضافة رابط جديد'}</h2>
          <p>{editingId ? 'قم بتعديل بيانات الرابط' : 'أضف رابطاً مهماً إلى المكتبة'}</p>
        </div>

        <form onSubmit={handleSubmit} className="link-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان الرابط</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: الموسوعة الحديثية"
                />
              </div>

              <div className="form-group-premium">
                <label>وصف الرابط</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر للموقع أو الرابط..."
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
                    placeholder="مثال: مكتبات، قنوات، مواقع..."
                  />
                  <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div className="form-group-premium">
                  <label><FaGlobe /> الرابط (URL)</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة الرابط (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('link-image').click()}
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
                    id="link-image"
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

              {previewImage && previewImage.startsWith('http') && (
                <div className="existing-image-note">
                  <FaImage /> صورة موجودة حالياً
                </div>
              )}
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
                  <FaSave /> {editingId ? 'تحديث الرابط' : 'إضافة الرابط'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>🔖 الروابط المهمة</h2>
          <p>{links.length} رابط في المكتبة</p>
        </div>

        {links.length === 0 ? (
          <div className="empty-state">
            <FaLink />
            <h3>لا توجد روابط</h3>
            <p>قم بإضافة رابط جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="links-grid-premium">
            {links.map(link => (
              <div key={link.id} className="link-card-premium">
                <div className="link-icon">
                  {link.image_url ? (
                    <img src={link.image_url} alt={link.title} className="link-icon-img" />
                  ) : (
                    <div className="link-icon-placeholder">
                      <FaLink />
                    </div>
                  )}
                </div>
                <div className="link-info">
                  <h4>{link.title}</h4>
                  {link.category && (
                    <span className="category-tag">
                      <FaTag /> {link.category}
                    </span>
                  )}
                  {link.description && (
                    <p className="link-description">
                      {link.description.length > 80 
                        ? link.description.substring(0, 80) + '...' 
                        : link.description}
                    </p>
                  )}
                  <div className="link-url">
                    <FaExternalLinkAlt />
                    <span>{getDomainName(link.url)}</span>
                  </div>
                </div>
                <div className="link-actions">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="visit-link-btn"
                    title="زيارة الرابط"
                  >
                    <FaExternalLinkAlt />
                  </a>
                  <button
                    onClick={() => handleEdit(link)}
                    className="edit-link-btn"
                    title="تعديل"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="delete-link-btn"
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .manage-links-premium {
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

        .link-form-premium {
          max-width: 100%;
        }

        .form-grid-premium {
          display: grid;
          grid-template-columns: 1fr 250px;
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
          min-height: 180px;
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
          height: 180px;
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

        .existing-image-note {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #e8b33920;
          border-radius: 10px;
          color: #e8b339;
          font-size: 0.75rem;
          text-align: center;
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

        /* Links Grid */
        .links-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1rem;
        }

        .link-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          transition: all 0.3s ease;
        }

        .link-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .link-icon {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
        }

        .link-icon-img {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          object-fit: cover;
        }

        .link-icon-placeholder {
          width: 100%;
          height: 100%;
          background: #e8b33920;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 1.5rem;
        }

        .link-info {
          flex: 1;
        }

        .link-info h4 {
          font-size: 0.95rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .category-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
          background: #e8b33920;
          color: #e8b339;
          padding: 0.1rem 0.5rem;
          border-radius: 20px;
          margin-bottom: 0.5rem;
        }

        .link-description {
          font-size: 0.75rem;
          color: #6c757d;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .link-url {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: #adb5bd;
        }

        .link-actions {
          display: flex;
          gap: 0.5rem;
        }

        .visit-link-btn,
        .edit-link-btn,
        .delete-link-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .visit-link-btn {
          background: #e8b33920;
          color: #e8b339;
          text-decoration: none;
        }

        .visit-link-btn:hover {
          background: #e8b339;
          color: white;
        }

        .edit-link-btn {
          background: #e8b33920;
          color: #e8b339;
        }

        .edit-link-btn:hover {
          background: #e8b339;
          color: white;
        }

        .delete-link-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-link-btn:hover {
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
          
          .links-grid-premium {
            grid-template-columns: 1fr;
          }
          
          .link-card-premium {
            flex-wrap: wrap;
          }
          
          .link-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageLinks;