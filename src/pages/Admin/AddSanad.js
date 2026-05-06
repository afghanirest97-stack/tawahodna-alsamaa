import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaUpload, FaImage, FaFilePdf, FaFileExcel, FaTimes, FaEye } from 'react-icons/fa';

function AddSanad() {
  const [asaneed, setAsaneed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null,
    image: null
  });

  useEffect(() => {
    fetchAsaneed();
  }, []);

  async function fetchAsaneed() {
    const { data } = await supabase
      .from('asaneed')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAsaneed(data);
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
      const fileType = file.type;
      const fileName = file.name;
      setPreviewFile({ type: fileType, name: fileName });
    }
  };

  const getFileIcon = () => {
    if (previewFile?.type?.includes('pdf')) return <FaFilePdf />;
    if (previewFile?.type?.includes('excel') || previewFile?.name?.includes('.xlsx')) return <FaFileExcel />;
    return <FaUpload />;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let fileUrl = null;
    let imageUrl = null;

    if (formData.file) {
      fileUrl = await uploadFile('asaneed', formData.file, 'files/');
    }
    if (formData.image) {
      imageUrl = await uploadFile('asaneed', formData.image, 'images/');
    }

    const { error } = await supabase
      .from('asaneed')
      .insert([{
        name: formData.name,
        description: formData.description,
        file_url: fileUrl,
        image_url: imageUrl,
        file_type: formData.file?.type || null
      }]);

    if (!error) {
      showToast('تم إضافة السند بنجاح', 'success');
      resetForm();
      fetchAsaneed();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ name: '', description: '', file: null, image: null });
    setPreviewImage(null);
    setPreviewFile(null);
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
      const { error } = await supabase
        .from('asaneed')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف السند بنجاح', 'success');
        fetchAsaneed();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  return (
    <div className="add-sanad-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>➕ إضافة سند جديد</h2>
          <p>أضف سنداً جديداً مع إمكانية رفع صورة وملف مرفق</p>
        </div>

        <form onSubmit={handleSubmit} className="sanad-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>اسم السند</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: سند صحيح البخاري"
                />
              </div>

              <div className="form-group-premium">
                <label>وصف السند</label>
                <textarea
                  rows="5"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف تفصيلي للسند وطريقته ورواته..."
                />
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة السند (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('sanad-image').click()}
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
                    id="sanad-image"
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
                <label>ملف مرفق (PDF/Excel - اختياري)</label>
                <div 
                  className="upload-area file-area"
                  onClick={() => document.getElementById('sanad-file').click()}
                >
                  {previewFile ? (
                    <div className="file-preview">
                      {getFileIcon()}
                      <span>{previewFile.name}</span>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FaUpload />
                      <span>انقر لرفع ملف</span>
                      <small>PDF, Excel</small>
                    </div>
                  )}
                  <input
                    id="sanad-file"
                    type="file"
                    accept=".pdf,.xlsx,.xls"
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
                  <FaSave /> إضافة السند
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📜 الأسانيد الموجودة</h2>
          <p>{asaneed.length} سند في المكتبة</p>
        </div>

        {asaneed.length === 0 ? (
          <div className="empty-state">
            <FaUpload />
            <h3>لا توجد أسانيد</h3>
            <p>قم بإضافة سند جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="items-grid-premium">
            {asaneed.map(sanad => (
              <div key={sanad.id} className="item-card-premium">
                <div className="item-header">
                  {sanad.image_url ? (
                    <img src={sanad.image_url} alt={sanad.name} className="item-image" />
                  ) : (
                    <div className="item-icon">
                      <FaUpload />
                    </div>
                  )}
                  <div className="item-title">
                    <h4>{sanad.name}</h4>
                    {sanad.file_url && (
                      <span className="file-badge">
                        {sanad.file_type?.includes('pdf') ? 'PDF' : 'ملف'}
                      </span>
                    )}
                  </div>
                </div>
                {sanad.description && (
                  <p className="item-description">
                    {sanad.description.length > 100 
                      ? sanad.description.substring(0, 100) + '...' 
                      : sanad.description}
                  </p>
                )}
                <div className="item-footer">
                  {sanad.file_url && (
                    <a 
                      href={sanad.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="view-file-btn"
                    >
                      <FaEye /> عرض الملف
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(sanad.id)}
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
        .add-sanad-premium {
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

        .sanad-form-premium {
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
          gap: 0.75rem;
          padding: 1rem;
        }

        .file-preview svg {
          font-size: 2rem;
          color: #e8b339;
        }

        .file-preview span {
          font-size: 0.85rem;
          color: #1b4f6e;
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

        /* Items Grid */
        .items-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .item-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .item-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .item-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
        }

        .item-icon {
          width: 60px;
          height: 60px;
          background: #e8b33920;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 1.5rem;
        }

        .item-title {
          flex: 1;
        }

        .item-title h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .file-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          background: #e8b33920;
          color: #e8b339;
          border-radius: 20px;
        }

        .item-description {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .item-footer {
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
          
          .items-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AddSanad;