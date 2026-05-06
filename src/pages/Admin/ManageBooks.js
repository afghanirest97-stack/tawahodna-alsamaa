import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';
import { FaSave, FaTrash, FaEdit, FaTimes, FaUpload, FaImage, FaFilePdf, FaExternalLinkAlt, FaBook, FaUser } from 'react-icons/fa';

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    pdf: null,
    link_url: '',
    image: null
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });
    if (data) setBooks(data);
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

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, pdf: file });
      setPreviewPdf({ name: file.name, size: (file.size / 1024).toFixed(1) });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let pdfUrl = null;
    let imageUrl = null;

    if (formData.pdf && typeof formData.pdf !== 'string') {
      pdfUrl = await uploadFile('books', formData.pdf, 'pdfs/');
    }
    if (formData.image && typeof formData.image !== 'string') {
      imageUrl = await uploadFile('books', formData.image, 'images/');
    }

    const bookData = {
      title: formData.title,
      author: formData.author,
      description: formData.description,
      pdf_url: pdfUrl,
      link_url: formData.link_url,
      image_url: imageUrl
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('books')
        .insert([bookData]);
      error = insertError;
    }

    if (!error) {
      showToast(editingId ? 'تم تعديل الكتاب بنجاح' : 'تم إضافة الكتاب بنجاح', 'success');
      resetForm();
      fetchBooks();
    } else {
      showToast('حدث خطأ: ' + error.message, 'error');
    }
    setLoading(false);
  }

  function showToast(message, type) {
    alert(message);
  }

  function resetForm() {
    setFormData({ title: '', author: '', description: '', pdf: null, link_url: '', image: null });
    setEditingId(null);
    setPreviewImage(null);
    setPreviewPdf(null);
  }

  function handleEdit(book) {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author || '',
      description: book.description || '',
      pdf: null,
      link_url: book.link_url || '',
      image: null
    });
    setPreviewImage(book.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      if (!error) {
        showToast('تم حذف الكتاب بنجاح', 'success');
        fetchBooks();
      } else {
        showToast('خطأ في الحذف: ' + error.message, 'error');
      }
    }
  }

  return (
    <div className="manage-books-premium">
      {/* Form Section */}
      <div className="form-section-premium">
        <div className="section-header-premium">
          <h2>{editingId ? '✏️ تعديل كتاب' : '📖 إضافة كتاب جديد'}</h2>
          <p>{editingId ? 'قم بتعديل بيانات الكتاب' : 'أضف كتاباً جديداً إلى المكتبة'}</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form-premium">
          <div className="form-grid-premium">
            <div className="form-main">
              <div className="form-group-premium">
                <label>عنوان الكتاب</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: صحيح البخاري"
                />
              </div>

              <div className="form-group-premium">
                <label><FaUser /> اسم المؤلف</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="مثال: الإمام البخاري"
                />
              </div>

              <div className="form-group-premium">
                <label>وصف الكتاب</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر للكتاب ومحتواه..."
                />
              </div>

              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label><FaFilePdf /> ملف PDF (اختياري)</label>
                  <div 
                    className="upload-area-small"
                    onClick={() => document.getElementById('book-pdf').click()}
                  >
                    {previewPdf ? (
                      <div className="pdf-preview">
                        <FaFilePdf />
                        <span>{previewPdf.name}</span>
                        <small>{previewPdf.size} KB</small>
                      </div>
                    ) : (
                      <div className="upload-placeholder-small">
                        <FaUpload />
                        <span>رفع PDF</span>
                      </div>
                    )}
                    <input
                      id="book-pdf"
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {previewPdf && (
                    <button
                      type="button"
                      className="remove-small-btn"
                      onClick={() => {
                        setPreviewPdf(null);
                        setFormData({ ...formData, pdf: null });
                      }}
                    >
                      <FaTimes /> إزالة الملف
                    </button>
                  )}
                </div>

                <div className="form-group-premium">
                  <label><FaExternalLinkAlt /> رابط خارجي (اختياري)</label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com/book.pdf"
                  />
                </div>
              </div>
            </div>

            <div className="form-files">
              <div className="file-upload-box">
                <label>صورة غلاف الكتاب (اختياري)</label>
                <div 
                  className="upload-area"
                  onClick={() => document.getElementById('book-image').click()}
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
                    id="book-image"
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
                  <FaSave /> {editingId ? 'تحديث الكتاب' : 'إضافة الكتاب'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Items Section */}
      <div className="items-section-premium">
        <div className="section-header-premium">
          <h2>📚 الكتب الموجودة</h2>
          <p>{books.length} كتاب في المكتبة</p>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <FaBook />
            <h3>لا توجد كتب</h3>
            <p>قم بإضافة كتاب جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="books-grid-premium">
            {books.map(book => (
              <div key={book.id} className="book-card-premium">
                <div className="book-cover">
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} />
                  ) : (
                    <div className="cover-placeholder">
                      <FaBook />
                    </div>
                  )}
                </div>
                <div className="book-details">
                  <h4>{book.title}</h4>
                  {book.author && (
                    <p className="book-author">
                      <FaUser /> {book.author}
                    </p>
                  )}
                  {book.description && (
                    <p className="book-description">
                      {book.description.length > 80 
                        ? book.description.substring(0, 80) + '...' 
                        : book.description}
                    </p>
                  )}
                  <div className="book-meta">
                    {book.pdf_url && (
                      <span className="pdf-badge">
                        <FaFilePdf /> PDF
                      </span>
                    )}
                    {book.link_url && (
                      <span className="link-badge">
                        <FaExternalLinkAlt /> رابط
                      </span>
                    )}
                  </div>
                  <div className="book-actions">
                    <button
                      onClick={() => handleEdit(book)}
                      className="edit-btn"
                    >
                      <FaEdit /> تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="delete-btn"
                    >
                      <FaTrash /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .manage-books-premium {
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

        .book-form-premium {
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

        .upload-area-small {
          background: #f8f9fa;
          border: 2px dashed #e9ecef;
          border-radius: 12px;
          cursor: pointer;
          padding: 0.75rem;
          transition: all 0.3s ease;
        }

        .upload-area-small:hover {
          border-color: #e8b339;
          background: #fff8e7;
        }

        .pdf-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pdf-preview svg {
          font-size: 1.5rem;
          color: #dc2626;
        }

        .pdf-preview span {
          font-size: 0.8rem;
          color: #1b4f6e;
        }

        .pdf-preview small {
          font-size: 0.7rem;
          color: #6c757d;
        }

        .upload-placeholder-small {
          text-align: center;
          color: #adb5bd;
        }

        .upload-placeholder-small svg {
          font-size: 1.2rem;
        }

        .upload-placeholder-small span {
          font-size: 0.75rem;
        }

        .remove-small-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.3rem;
          background: #fee2e2;
          border: none;
          border-radius: 8px;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          font-size: 0.7rem;
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
          min-height: 200px;
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
          height: 200px;
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

        /* Books Grid */
        .books-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .book-card-premium {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .book-card-premium:hover {
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .book-cover {
          width: 80px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 10px;
          overflow: hidden;
          background: #e8b33920;
        }

        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8b339;
          font-size: 2rem;
        }

        .book-details {
          flex: 1;
        }

        .book-details h4 {
          font-size: 1rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .book-author {
          font-size: 0.7rem;
          color: #e8b339;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .book-description {
          font-size: 0.75rem;
          color: #6c757d;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .book-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .pdf-badge,
        .link-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }

        .pdf-badge {
          background: #dc262620;
          color: #dc2626;
        }

        .link-badge {
          background: #e8b33920;
          color: #e8b339;
        }

        .book-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
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
          
          .books-grid-premium {
            grid-template-columns: 1fr;
          }
          
          .book-card-premium {
            flex-direction: column;
          }
          
          .book-cover {
            width: 100%;
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageBooks;