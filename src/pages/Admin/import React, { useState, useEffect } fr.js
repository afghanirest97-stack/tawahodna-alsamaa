import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { 
  FaSave, FaTrash, FaUpload, FaImage, FaFilePdf, 
  FaTimes, FaEye, FaEdit, FaPlus, FaEyeSlash, 
  FaGlobe, FaLock, FaChartLine, FaCalendarAlt, FaUserShield 
} from 'react-icons/fa';

function ManageStudySanad() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    reason: '',
    status: 'published',
    file: null,
    image: null
  });

  const ADMIN_USER_ID = '33abf9b2-e53e-4cda-8499-0bc55d6e5c07';

  useEffect(() => {
    fetchStudies();
  }, []);

  async function fetchStudies() {
    const { data } = await supabase
      .from('study_sanads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setStudies(data);
      const published = data.filter(s => s.status === 'published').length;
      const draft = data.filter(s => s.status === 'draft').length;
      setStats({ total: data.length, published, draft });
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file: file });
      setPreviewFile({ type: file.type, name: file.name });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let fileUrl = null;
    let imageUrl = null;

    if (formData.file) {
      fileUrl = await uploadFile('study_sanads', formData.file, 'files/');
    }
    if (formData.image) {
      imageUrl = await uploadFile('study_sanads', formData.image, 'images/');
    }

    const newStudy = {
      title: formData.title,
      summary: formData.summary,
      description: formData.description,
      reason: formData.reason,
      status: formData.status,
      file_url: fileUrl,
      image_url: imageUrl,
      file_type: formData.file?.type || null,
      user_id: ADMIN_USER_ID
    };

    let error;
    if (editingItem) {
      const updateData = { ...newStudy, updated_at: new Date() };
      const { error: updateError } = await supabase
        .from('study_sanads')
        .update(updateData)
        .eq('id', editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('study_sanads')
        .insert([newStudy]);
      error = insertError;
    }

    if (!error) {
      alert(editingItem ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح');
      resetForm();
      fetchStudies();
      setShowModal(false);
    } else {
      alert('حدث خطأ: ' + error.message);
    }
    setLoading(false);
  }

  function openModal(item = null) {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        summary: item.summary || '',
        description: item.description || '',
        reason: item.reason || '',
        status: item.status || 'published',
        file: null,
        image: null
      });
      setPreviewImage(item.image_url);
      setPreviewFile(item.file_url ? { type: item.file_type, name: item.file_url.split('/').pop() } : null);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        summary: '',
        description: '',
        reason: '',
        status: 'published',
        file: null,
        image: null
      });
      setPreviewImage(null);
      setPreviewFile(null);
    }
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      summary: '',
      description: '',
      reason: '',
      status: 'published',
      file: null,
      image: null
    });
    setPreviewImage(null);
    setPreviewFile(null);
    setEditingItem(null);
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذه الدراسة؟')) {
      const { error } = await supabase
        .from('study_sanads')
        .delete()
        .eq('id', id);
      
      if (!error) {
        alert('تم الحذف بنجاح');
        fetchStudies();
      } else {
        alert('خطأ في الحذف: ' + error.message);
      }
    }
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('study_sanads')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', id);
    
    if (!error) {
      fetchStudies();
      alert(`تم تغيير الحالة إلى ${newStatus === 'published' ? 'منشور' : 'مسودة'}`);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="manage-study-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📚 إدارة دراسة الأسانيد</h1>
            <p>إدارة محتوى دراسة أسانيد الحديث الشريف</p>
          </div>
          <button className="btn-add" onClick={() => openModal()}>
            <FaPlus /> إضافة دراسة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaChartLine /></div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>إجمالي الدراسات</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaGlobe /></div>
            <div className="stat-info">
              <h3>{stats.published}</h3>
              <p>منشورة</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaLock /></div>
            <div className="stat-info">
              <h3>{stats.draft}</h3>
              <p>مسودة</p>
            </div>
          </div>
        </div>

        {/* Studies Grid */}
        <div className="studies-grid">
          {studies.map(study => (
            <div key={study.id} className={`study-card ${study.status === 'draft' ? 'draft' : ''}`}>
              {study.image_url && (
                <div className="card-image">
                  <img src={study.image_url} alt={study.title} />
                  <div className={`status-badge ${study.status}`}>
                    {study.status === 'published' ? <FaGlobe /> : <FaLock />}
                    {study.status === 'published' ? 'منشور' : 'مسودة'}
                  </div>
                </div>
              )}
              <div className="card-body">
                <h3>{study.title}</h3>
                {study.summary && <p className="summary">{study.summary}</p>}
                <div className="card-meta">
                  <span><FaCalendarAlt /> {formatDate(study.created_at)}</span>
                  <span><FaUserShield /> بواسطة: أحمد</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => openModal(study)}>
                  <FaEdit /> تعديل
                </button>
                <button className="btn-delete" onClick={() => handleDelete(study.id)}>
                  <FaTrash /> حذف
                </button>
                {study.status === 'published' ? (
                  <button className="btn-unpublish" onClick={() => updateStatus(study.id, 'draft')}>
                    <FaEyeSlash /> إخفاء
                  </button>
                ) : (
                  <button className="btn-publish" onClick={() => updateStatus(study.id, 'published')}>
                    <FaEye /> نشر
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {studies.length === 0 && (
          <div className="empty-state">
            <FaPlus />
            <h3>لا توجد دراسات</h3>
            <p>قم بإضافة أول دراسة باستخدام الزر أعلاه</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? '✏️ تعديل الدراسة' : '➕ إضافة دراسة جديدة'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>عنوان الدراسة *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: دراسة سند صحيح البخاري"
                  />
                </div>

                <div className="form-group">
                  <label>ملخص قصير</label>
                  <textarea
                    rows="2"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="ملخص مختصر عن الدراسة..."
                  />
                </div>

                <div className="form-group">
                  <label>سبب الدراسة / الأهمية</label>
                  <textarea
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="لماذا هذه الدراسة مهمة؟ ما هو الدافع لها؟"
                  />
                </div>

                <div className="form-group">
                  <label>وصف تفصيلي</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف مفصل للدراسة ومحتواها..."
                  />
                </div>

                <div className="form-group">
                  <label>حالة النشر</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>صورة الدراسة (اختياري)</label>
                    <div className="upload-area" onClick={() => document.getElementById('study-image').click()}>
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <FaImage />
                          <span>انقر لرفع صورة</span>
                        </div>
                      )}
                      <input id="study-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </div>
                    {previewImage && (
                      <button type="button" className="remove-btn" onClick={() => {
                        setPreviewImage(null);
                        setFormData({ ...formData, image: null });
                      }}>
                        <FaTimes /> إزالة
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>ملف مرفق (PDF - اختياري)</label>
                    <div className="upload-area" onClick={() => document.getElementById('study-file').click()}>
                      {previewFile ? (
                        <div className="file-preview">
                          <FaFilePdf />
                          <span>{previewFile.name}</span>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <FaUpload />
                          <span>انقر لرفع ملف</span>
                        </div>
                      )}
                      <input id="study-file" type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>
                    {previewFile && (
                      <button type="button" className="remove-btn" onClick={() => {
                        setPreviewFile(null);
                        setFormData({ ...formData, file: null });
                      }}>
                        <FaTimes /> إزالة
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'جاري الحفظ...' : <><FaSave /> {editingItem ? 'تحديث' : 'حفظ'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .manage-study-page {
          background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
          min-height: 100vh;
          padding: 2rem 0;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 1.8rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .page-header p {
          color: #6c757d;
        }

        .btn-add {
          background: #e8b339;
          color: #1b4f6e;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-add:hover {
          background: #d4a32a;
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          background: #e8b33920;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #e8b339;
        }

        .stat-info h3 {
          font-size: 1.5rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .stat-info p {
          color: #6c757d;
          font-size: 0.85rem;
        }

        .studies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .study-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .study-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .study-card.draft {
          opacity: 0.8;
          border: 2px dashed #e9ecef;
        }

        .card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: white;
          font-weight: 600;
        }

        .status-badge.published {
          background: #10b981;
          color: white;
        }

        .status-badge.draft {
          background: #f59e0b;
          color: white;
        }

        .card-body {
          padding: 1.5rem;
        }

        .card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.75rem;
        }

        .summary {
          color: #6c757d;
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          color: #adb5bd;
          flex-wrap: wrap;
        }

        .card-meta span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .card-actions {
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          border-top: 1px solid #e9ecef;
        }

        .btn-edit, .btn-delete, .btn-publish, .btn-unpublish {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #3b82f620;
          color: #3b82f6;
        }

        .btn-edit:hover {
          background: #3b82f6;
          color: white;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #dc2626;
          color: white;
        }

        .btn-publish {
          background: #10b98120;
          color: #10b981;
        }

        .btn-publish:hover {
          background: #10b981;
          color: white;
        }

        .btn-unpublish {
          background: #f59e0b20;
          color: #f59e0b;
        }

        .btn-unpublish:hover {
          background: #f59e0b;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 20px;
          margin-top: 2rem;
        }

        .empty-state svg {
          font-size: 4rem;
          color: #dee2e6;
          margin-bottom: 1rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #f0f2f5;
        }

        .modal-header h2 {
          color: #1b4f6e;
          font-size: 1.3rem;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #6c757d;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #1b4f6e;
          font-size: 0.85rem;
        }

        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: inherit;
        }

        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          outline: none;
          border-color: #e8b339;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .upload-area {
          background: #f8f9fa;
          border: 2px dashed #e9ecef;
          border-radius: 12px;
          cursor: pointer;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .upload-area:hover {
          border-color: #e8b339;
          background: #fff8e7;
        }

        .upload-area img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
        }

        .upload-placeholder {
          text-align: center;
          color: #adb5bd;
        }

        .upload-placeholder svg {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
        }

        .file-preview svg {
          font-size: 2rem;
          color: #e8b339;
        }

        .remove-btn {
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
          gap: 0.4rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 2px solid #f0f2f5;
        }

        .btn-cancel {
          padding: 0.7rem 1.5rem;
          background: #f0f2f5;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .btn-submit {
          padding: 0.7rem 1.5rem;
          background: #e8b339;
          border: none;
          border-radius: 10px;
          color: #1b4f6e;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            text-align: center;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .studies-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageStudySanad;