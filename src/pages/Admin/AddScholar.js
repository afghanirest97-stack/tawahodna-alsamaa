import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaUpload, FaImage, FaFilePdf, FaTimes, FaEye, FaUserTie, FaCalendarAlt } from 'react-icons/fa';

function AddScholar() {
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    birth_year: '',
    death_year: '',
    image: null,
    file: null
  });

  useEffect(() => {
    fetchScholars();
  }, []);

  async function fetchScholars() {
    const { data } = await supabase
      .from('scholars')
      .select('*')
      .order('name', { ascending: true });
    if (data) setScholars(data);
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
      imageUrl = await uploadFile('scholars', formData.image, 'images/');
    }
    if (formData.file) {
      fileUrl = await uploadFile('scholars', formData.file, 'files/');
    }

    const { error } = await supabase
      .from('scholars')
      .insert([{
        name: formData.name,
        biography: formData.biography,
        birth_year: formData.birth_year,
        death_year: formData.death_year,
        image_url: imageUrl,
        file_url: fileUrl
      }]);

    if (!error) {
      showToast('تم إضافة العالم بنجاح', 'success');
      resetForm();
      fetchScholars();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ name: '', biography: '', birth_year: '', death_year: '', image: null, file: null });
    setPreviewImage(null);
    setPreviewFile(null);
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا العالم؟')) {
      const { error } = await supabase
        .from('scholars')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف العالم بنجاح', 'success');
        fetchScholars();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  return (
    <div className="add-scholar-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>👨‍🏫 إضافة عالم جديد</h2>
          <p>أضف ترجمة عالم جديد مع إمكانية رفع صورة وملف PDF</p>
        </div>

        <form onSubmit={handleSubmit} className="scholar-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>اسم العالم</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الإمام البخاري"
                />
              </div>

              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>سنة الميلاد</label>
                  <div className="input-with-icon">
                    <FaCalendarAlt />
                    <input
                      type="text"
                      value={formData.birth_year}
                      onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                      placeholder="مثال: 194 هـ"
                    />
                  </div>
                </div>
                <div className="form-group-premium">
                  <label>سنة الوفاة</label>
                  <div className="input-with-icon">
                    <FaCalendarAlt />
                    <input
                      type="text"
                      value={formData.death_year}
                      onChange={(e) => setFormData({ ...formData, death_year: e.target.value })}
                      placeholder="مثال: 256 هـ"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-premium">
                <label>ترجمة العالم</label>
                <textarea
                  rows="6"
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="اكتب ترجمة العالم هنا، تشمل نشأته، شيوخه، تلاميذه، مؤلفاته، ووفاته..."
                />
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة العالم (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('scholar-image').click()}
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
                    id="scholar-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {previewImage && (
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
                <label>ملف الترجمة (PDF - اختياري)</label>
                <div 
                  className="upload-area file-area"
                  onClick={() => document.getElementById('scholar-file').click()}
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
                    id="scholar-file"
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
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'جاري الإضافة...' : (
                <>
                  <FaSave /> إضافة العالم
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📚 العلماء الموجودون</h2>
          <p>{scholars.length} عالم في المكتبة</p>
        </div>

        {scholars.length === 0 ? (
          <div className="empty-state">
            <FaUserTie />
            <h3>لا توجد تراجم</h3>
            <p>قم بإضافة عالم جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="scholars-grid-premium">
            {scholars.map(scholar => (
              <div key={scholar.id} className="scholar-card-premium">
                <div className="scholar-header">
                  {scholar.image_url ? (
                    <img src={scholar.image_url} alt={scholar.name} className="scholar-avatar" />
                  ) : (
                    <div className="scholar-avatar-placeholder">
                      <FaUserTie />
                    </div>
                  )}
                  <div className="scholar-info">
                    <h4>{scholar.name}</h4>
                    {(scholar.birth_year || scholar.death_year) && (
                      <div className="scholar-years">
                        <span>{scholar.birth_year && `ولد: ${scholar.birth_year}`}</span>
                        {scholar.birth_year && scholar.death_year && ' | '}
                        <span>{scholar.death_year && `توفي: ${scholar.death_year}`}</span>
                      </div>
                    )}
                  </div>
                </div>
                {scholar.biography && (
                  <p className="scholar-bio">
                    {scholar.biography.length > 120 
                      ? scholar.biography.substring(0, 120) + '...' 
                      : scholar.biography}
                  </p>
                )}
                <div className="scholar-footer">
                  {scholar.file_url && (
                    <a 
                      href={scholar.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="view-file-btn"
                    >
                      <FaEye /> تحميل الترجمة
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(scholar.id)}
                    className="delete-item-btn"
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
        .add-scholar-premium {
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

        .scholar-form-premium {
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

        .form-row-premium {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon svg {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
          font-size: 0.9rem;
        }

        .input-with-icon input {
          padding-right: 2.5rem;
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

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Scholars Grid */
        .scholars-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .scholar-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .scholar-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .scholar-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .scholar-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .scholar-avatar-placeholder {
          width: 60px;
          height: 60px;
          background: #e8b33920;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 1.8rem;
        }

        .scholar-info {
          flex: 1;
        }

        .scholar-info h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .scholar-years {
          font-size: 0.7rem;
          color: #e8b339;
        }

        .scholar-bio {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .scholar-footer {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          border-top: 1px solid #e9ecef;
          padding-top: 0.75rem;
        }

        .view-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: #e8b33920;
          color: #e8b339;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.75rem;
        }

        .delete-item-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: #fee2e2;
          border: none;
          border-radius: 8px;
          color: #dc2626;
          cursor: pointer;
          font-size: 0.75rem;
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
          
          .scholars-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AddScholar;