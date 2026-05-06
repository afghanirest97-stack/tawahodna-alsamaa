import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaImage, FaTrash, FaEdit, FaEye, FaEyeSlash, FaSave, FaTimes, FaUpload, FaArrowUp, FaArrowDown } from 'react-icons/fa';

function ManageHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    image: null,
    is_active: true,
    order_index: 0
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index', { ascending: true });
    if (data) setSlides(data);
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
      imageUrl = await uploadFile('hero', formData.image, 'slides/');
    }

    const slideData = {
      title: formData.title,
      description: formData.description,
      link_url: formData.link_url,
      is_active: formData.is_active,
      order_index: parseInt(formData.order_index)
    };
    if (imageUrl) slideData.image_url = imageUrl;
    if (editingId && !imageUrl && previewImage?.startsWith('http')) {
      // Keep existing image if not changed
      delete slideData.image_url;
    }

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('hero_slides')
        .update(slideData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('hero_slides')
        .insert([slideData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل الشريحة بنجاح' : 'تم إضافة الشريحة بنجاح', 'success');
      resetForm();
      fetchSlides();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    // Simple alert for now, can be replaced with a toast component
    alert(message);
  }

  function resetForm() {
    setFormData({ title: '', description: '', link_url: '', image: null, is_active: true, order_index: 0 });
    setEditingId(null);
    setPreviewImage(null);
  }

  function handleEdit(slide) {
    setEditingId(slide.id);
    setFormData({
      title: slide.title || '',
      description: slide.description || '',
      link_url: slide.link_url || '',
      image: null,
      is_active: slide.is_active,
      order_index: slide.order_index || 0
    });
    setPreviewImage(slide.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذه الشريحة؟')) {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف الشريحة بنجاح', 'success');
        fetchSlides();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  async function toggleActive(id, currentStatus) {
    const { error } = await supabase
      .from('hero_slides')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) fetchSlides();
  }

  async function moveOrder(id, currentOrder, direction) {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    const otherSlide = slides.find(s => s.order_index === newOrder);
    if (otherSlide) {
      await supabase.from('hero_slides').update({ order_index: newOrder }).eq('id', id);
      await supabase.from('hero_slides').update({ order_index: currentOrder }).eq('id', otherSlide.id);
      fetchSlides();
    }
  }

  return (
    <div className="manage-hero-premium">
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل شريحة' : '➕ إضافة شريحة جديدة'}</h2>
          <p>أضف شرائح جديدة لعرضها في الصفحة الرئيسية</p>
        </div>

        <form onSubmit={handleSubmit} className="hero-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان الشريحة</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان الشريحة"
                />
              </div>

              <div className="form-group-premium">
                <label>وصف الشريحة</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصفاً مختصراً للشريحة..."
                />
              </div>

              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>رابط (اختياري)</label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-group-premium">
                  <label>ترتيب الظهور</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    placeholder="0, 1, 2..."
                  />
                </div>
              </div>

              <div className="form-group-premium">
                <label>حالة النشر</label>
                <div className="toggle-switch">
                  <button
                    type="button"
                    className={`toggle-option ${formData.is_active === true ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, is_active: true })}
                  >
                    <FaEye /> منشور
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${formData.is_active === false ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, is_active: false })}
                  >
                    <FaEyeSlash /> غير منشور
                  </button>
                </div>
              </div>
            </div>

            <div className="form-image">
              <label>صورة الشريحة</label>
              <div className="image-upload-area" onClick={() => document.getElementById('image-input').click()}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <FaUpload />
                    <span>انقر لرفع صورة</span>
                    <small>jpg, png, gif</small>
                  </div>
                )}
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
              {previewImage && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData({ ...formData, image: null });
                  }}
                >
                  <FaTrash /> إزالة الصورة
                </button>
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
                  <FaSave /> {editingId ? 'تحديث الشريحة' : 'إضافة الشريحة'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="slides-list-premium">
        <div className="section-header-premium">
          <h2>📸 الشرائح الحالية</h2>
          <p>{slides.length} شريحة في السلايدر</p>
        </div>

        {slides.length === 0 ? (
          <div className="empty-state">
            <FaImage />
            <h3>لا توجد شرائح</h3>
            <p>قم بإضافة شريحة جديدة لعرضها في الصفحة الرئيسية</p>
          </div>
        ) : (
          <div className="slides-grid">
            {slides.map((slide, index) => (
              <div key={slide.id} className="slide-card">
                <div className="slide-preview">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt={slide.title} />
                  ) : (
                    <div className="slide-placeholder">
                      <FaImage />
                    </div>
                  )}
                  <div className="slide-status" data-active={slide.is_active}>
                    {slide.is_active ? 'منشور' : 'غير منشور'}
                  </div>
                </div>
                <div className="slide-info">
                  <h4>{slide.title}</h4>
                  {slide.description && <p>{slide.description.substring(0, 60)}...</p>}
                  <div className="slide-meta">
                    <span className="order-badge">ترتيب: {slide.order_index}</span>
                    {slide.link_url && <span className="link-badge">رابط</span>}
                  </div>
                </div>
                <div className="slide-actions">
                  <div className="order-actions">
                    <button
                      onClick={() => moveOrder(slide.id, slide.order_index, 'up')}
                      disabled={index === 0}
                      className="order-btn"
                      title="رفع للأعلى"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => moveOrder(slide.id, slide.order_index, 'down')}
                      disabled={index === slides.length - 1}
                      className="order-btn"
                      title="خفض للأسفل"
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleActive(slide.id, slide.is_active)}
                    className={`action-btn ${slide.is_active ? 'deactivate' : 'activate'}`}
                    title={slide.is_active ? 'إلغاء النشر' : 'نشر'}
                  >
                    {slide.is_active ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="action-btn edit"
                    title="تعديل"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="action-btn delete"
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
        .manage-hero-premium {
          max-width: 1200px;
          margin: 0 auto;
        }

        .form-section-premium,
        .slides-list-premium {
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

        .hero-form-premium {
          max-width: 800px;
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

        .form-group-premium input,
        .form-group-premium textarea,
        .form-group-premium select {
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

        .toggle-switch {
          display: flex;
          gap: 1rem;
        }

        .toggle-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-option.active {
          background: #e8b339;
          border-color: #e8b339;
          color: white;
        }

        .image-upload-area {
          width: 100%;
          height: 200px;
          background: #f8f9fa;
          border: 2px dashed #e9ecef;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .image-upload-area:hover {
          border-color: #e8b339;
          background: #fff8e7;
        }

        .upload-placeholder {
          text-align: center;
          color: #adb5bd;
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

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
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

        /* Slides Grid */
        .slides-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .slide-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 16px;
          transition: all 0.2s ease;
        }

        .slide-card:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .slide-preview {
          position: relative;
          width: 80px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          background: #e9ecef;
          flex-shrink: 0;
        }

        .slide-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .slide-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #adb5bd;
        }

        .slide-status {
          position: absolute;
          top: 3px;
          right: 3px;
          font-size: 0.6rem;
          padding: 0.1rem 0.4rem;
          border-radius: 20px;
          background: rgba(0,0,0,0.6);
          color: white;
        }

        .slide-info {
          flex: 1;
        }

        .slide-info h4 {
          font-size: 0.95rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .slide-info p {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .slide-meta {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .order-badge,
        .link-badge {
          font-size: 0.65rem;
          padding: 0.1rem 0.5rem;
          border-radius: 20px;
          background: #e9ecef;
        }

        .slide-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .order-actions {
          display: flex;
          gap: 0.25rem;
        }

        .order-btn {
          width: 30px;
          height: 30px;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .order-btn:hover:not(:disabled) {
          background: #e8b339;
          border-color: #e8b339;
          color: white;
        }

        .order-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn.activate {
          background: #d4edda;
          color: #27ae60;
        }

        .action-btn.deactivate {
          background: #fff3cd;
          color: #f39c12;
        }

        .action-btn.edit {
          background: #e8b33920;
          color: #e8b339;
        }

        .action-btn.delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn:hover {
          transform: scale(1.05);
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
          
          .slide-card {
            flex-wrap: wrap;
          }
          
          .slide-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageHero;