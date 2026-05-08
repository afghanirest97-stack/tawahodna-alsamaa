import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaUpload, FaImage, FaFilePdf, FaFileExcel, FaTimes, FaEye, FaEdit } from 'react-icons/fa';

function AddSanad() {
  const [asaneed, setAsaneed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSanad, setEditingSanad] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sheikh_name: '',
    ijazah_for: '',
    description: '',
    file: null,
    image: null
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    sheikh_name: '',
    ijazah_for: '',
    description: '',
    file: null,
    image: null,
    existing_file_url: null,
    existing_image_url: null
  });
  
  const [editPreviewImage, setEditPreviewImage] = useState(null);
  const [editPreviewFile, setEditPreviewFile] = useState(null);

  // ID المشرف الثابت من جدول users
  const ADMIN_USER_ID = '33abf9b2-e53e-4cda-8499-0bc55d6e5c07';

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
      const fileName = file.name;
      setPreviewFile({ type: file.type, name: fileName });
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData({ ...editFormData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData({ ...editFormData, file: file });
      setEditPreviewFile({ type: file.type, name: file.name });
    }
  };

  const getFileIcon = (fileInfo) => {
    if (fileInfo?.type?.includes('pdf')) return <FaFilePdf />;
    if (fileInfo?.type?.includes('excel') || fileInfo?.name?.includes('.xlsx')) return <FaFileExcel />;
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

    // استخدام ID المشرف الثابت
    const newSanad = {
      name: formData.name,
      sheikh_name: formData.sheikh_name || null,
      ijazah_for: formData.ijazah_for || null,
      description: formData.description,
      file_url: fileUrl,
      image_url: imageUrl,
      file_type: formData.file?.type || null,
      user_id: ADMIN_USER_ID
    };

    const { error } = await supabase
      .from('asaneed')
      .insert([newSanad]);

    if (!error) {
      showToast('تم إضافة السند بنجاح', 'success');
      resetForm();
      fetchAsaneed();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setEditLoading(true);

    let fileUrl = editFormData.existing_file_url;
    let imageUrl = editFormData.existing_image_url;

    if (editFormData.file) {
      fileUrl = await uploadFile('asaneed', editFormData.file, 'files/');
    }
    if (editFormData.image) {
      imageUrl = await uploadFile('asaneed', editFormData.image, 'images/');
    }

    const { error } = await supabase
      .from('asaneed')
      .update({
        name: editFormData.name,
        sheikh_name: editFormData.sheikh_name || null,
        ijazah_for: editFormData.ijazah_for || null,
        description: editFormData.description,
        file_url: fileUrl,
        image_url: imageUrl,
        file_type: editFormData.file?.type || null
      })
      .eq('id', editFormData.id);

    if (!error) {
      showToast('تم تعديل السند بنجاح', 'success');
      setShowEditModal(false);
      resetEditForm();
      fetchAsaneed();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setEditLoading(false);
  }

  function openEditModal(sanad) {
    setEditingSanad(sanad);
    setEditFormData({
      id: sanad.id,
      name: sanad.name || '',
      sheikh_name: sanad.sheikh_name || '',
      ijazah_for: sanad.ijazah_for || '',
      description: sanad.description || '',
      file: null,
      image: null,
      existing_file_url: sanad.file_url,
      existing_image_url: sanad.image_url
    });
    setEditPreviewImage(sanad.image_url);
    setEditPreviewFile(sanad.file_url ? { type: sanad.file_type, name: sanad.file_url.split('/').pop() } : null);
    setShowEditModal(true);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ 
      name: '', 
      sheikh_name: '',
      ijazah_for: '',
      description: '', 
      file: null, 
      image: null 
    });
    setPreviewImage(null);
    setPreviewFile(null);
  }

  function resetEditForm() {
    setEditFormData({
      id: null,
      name: '',
      sheikh_name: '',
      ijazah_for: '',
      description: '',
      file: null,
      image: null,
      existing_file_url: null,
      existing_image_url: null
    });
    setEditPreviewImage(null);
    setEditPreviewFile(null);
    setEditingSanad(null);
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
                <label>اسم السند <span className="required-star">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: سند صحيح البخاري"
                />
              </div>

              <div className="form-group-premium">
                <label>الشيخ المجيز (اختياري)</label>
                <input
                  type="text"
                  value={formData.sheikh_name}
                  onChange={(e) => setFormData({ ...formData, sheikh_name: e.target.value })}
                  placeholder="مثال: الشيخ أحمد"
                />
              </div>

              <div className="form-group-premium">
                <label>لمن الإجازة (اختياري)</label>
                <input
                  type="text"
                  value={formData.ijazah_for}
                  onChange={(e) => setFormData({ ...formData, ijazah_for: e.target.value })}
                  placeholder="مثال: طلاب العلم"
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
                      {getFileIcon(previewFile)}
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
                    {sanad.sheikh_name && (
                      <span className="sheikh-badge">شيخ: {sanad.sheikh_name}</span>
                    )}
                    {sanad.ijazah_for && (
                      <span className="ijazah-badge">لـ: {sanad.ijazah_for}</span>
                    )}
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
                    onClick={() => openEditModal(sanad)}
                    className="edit-item-btn"
                  >
                    <FaEdit /> تعديل
                  </button>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ تعديل السند</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group-premium">
                  <label>اسم السند <span className="required-star">*</span></label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="مثال: سند صحيح البخاري"
                  />
                </div>

                <div className="form-group-premium">
                  <label>الشيخ المجيز (اختياري)</label>
                  <input
                    type="text"
                    value={editFormData.sheikh_name}
                    onChange={(e) => setEditFormData({ ...editFormData, sheikh_name: e.target.value })}
                    placeholder="مثال: الشيخ أحمد"
                  />
                </div>

                <div className="form-group-premium">
                  <label>لمن الإجازة (اختياري)</label>
                  <input
                    type="text"
                    value={editFormData.ijazah_for}
                    onChange={(e) => setEditFormData({ ...editFormData, ijazah_for: e.target.value })}
                    placeholder="مثال: طلاب العلم"
                  />
                </div>

                <div className="form-group-premium">
                  <label>وصف السند</label>
                  <textarea
                    rows="4"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="وصف تفصيلي للسند..."
                  />
                </div>

                <div className="edit-files-section">
                  <div className="file-upload-box">
                    <label>صورة السند</label>
                    <div 
                      className="upload-area"
                      onClick={() => document.getElementById('edit-sanad-image').click()}
                    >
                      {editPreviewImage ? (
                        <img src={editPreviewImage} alt="Preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <FaImage />
                          <span>انقر لرفع صورة جديدة</span>
                          <small>اتركه فارغاً للإبقاء على الصورة الحالية</small>
                        </div>
                      )}
                      <input
                        id="edit-sanad-image"
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {editPreviewImage && editFormData.existing_image_url && (
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => {
                          setEditPreviewImage(null);
                          setEditFormData({ ...editFormData, image: null, existing_image_url: null });
                        }}
                      >
                        <FaTimes /> إزالة الصورة
                      </button>
                    )}
                  </div>

                  <div className="file-upload-box">
                    <label>ملف مرفق (PDF/Excel)</label>
                    <div 
                      className="upload-area file-area"
                      onClick={() => document.getElementById('edit-sanad-file').click()}
                    >
                      {editPreviewFile ? (
                        <div className="file-preview">
                          {getFileIcon(editPreviewFile)}
                          <span>{editPreviewFile.name}</span>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <FaUpload />
                          <span>انقر لرفع ملف جديد</span>
                          <small>اتركه فارغاً للإبقاء على الملف الحالي</small>
                        </div>
                      )}
                      <input
                        id="edit-sanad-file"
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        onChange={handleEditFileChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    {editPreviewFile && editFormData.existing_file_url && (
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => {
                          setEditPreviewFile(null);
                          setEditFormData({ ...editFormData, file: null, existing_file_url: null });
                        }}
                      >
                        <FaTimes /> إزالة الملف
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-submit" disabled={editLoading}>
                  {editLoading ? 'جاري التحديث...' : (
                    <>
                      <FaSave /> تحديث السند
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .add-sanad-premium {
          max-width: 1200px;
          margin: 0 auto;
        }

        .required-star {
          color: #dc2626;
          margin-right: 4px;
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

        .items-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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

        .sheikh-badge,
        .ijazah-badge {
          display: inline-block;
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          background: #e8b33920;
          color: #e8b339;
          border-radius: 20px;
          margin-right: 0.5rem;
          margin-top: 0.25rem;
        }

        .ijazah-badge {
          background: #4f46e520;
          color: #4f46e5;
        }

        .file-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          background: #10b98120;
          color: #10b981;
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

        .edit-item-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: #3b82f620;
          border: none;
          border-radius: 8px;
          color: #3b82f6;
          cursor: pointer;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
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
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #dc2626;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .edit-files-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 2px solid #f0f2f5;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f0f2f5;
          border: none;
          border-radius: 12px;
          color: #6c757d;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #e9ecef;
        }

        @media (max-width: 768px) {
          .form-grid-premium {
            grid-template-columns: 1fr;
          }
          
          .items-grid-premium {
            grid-template-columns: 1fr;
          }

          .edit-files-section {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default AddSanad;