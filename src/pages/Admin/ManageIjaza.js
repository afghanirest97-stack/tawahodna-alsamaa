import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../../services/supabase';

function ManageIjaza() {
  const [ijazat, setIjazat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    let fileUrl = null;

    if (formData.image) {
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
      alert(editingId ? 'تم تعديل الإجازة بنجاح' : 'تم إضافة الإجازة بنجاح');
      setFormData({ title: '', description: '', sheikh_name: '', youtube_url: '', image: null, file: null });
      setEditingId(null);
      fetchIjazat();
    } else {
      alert('حدث خطأ: ' + error.message);
    }
    setLoading(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذه الإجازة؟')) {
      const { error } = await supabase
        .from('ijazat')
        .delete()
        .eq('id', id);
      if (!error) fetchIjazat();
      else alert('خطأ في الحذف: ' + error.message);
    }
  }

  return (
    <div className="admin-form">
      <h2>{editingId ? 'تعديل إجازة' : 'إضافة إجازة جديدة'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>عنوان الإجازة</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="مثال: إجازة صحيح البخاري"
          />
        </div>
        <div className="form-group">
          <label>اسم الشيخ المجيز</label>
          <input
            type="text"
            value={formData.sheikh_name}
            onChange={(e) => setFormData({ ...formData, sheikh_name: e.target.value })}
            placeholder="اسم الشيخ الذي أجاز"
          />
        </div>
        <div className="form-group">
          <label>وصف الإجازة</label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="تفاصيل الإجازة وسندها..."
          />
        </div>
        <div className="form-group">
          <label>رابط يوتيوب (اختياري)</label>
          <input
            type="url"
            value={formData.youtube_url}
            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div className="form-group">
          <label>صورة (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          />
        </div>
        <div className="form-group">
          <label>ملف الإجازة (PDF - اختياري)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
          />
        </div>
        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', sheikh_name: '', youtube_url: '', image: null, file: null }); }}>
              إلغاء
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري المعالجة...' : (editingId ? 'تحديث الإجازة' : 'إضافة الإجازة')}
          </button>
        </div>
      </form>

      <h3>الإجازات المسجلة</h3>
      <div className="items-list">
        {ijazat.map(ijaza => (
          <div key={ijaza.id} className="list-item">
            <div className="list-item-info">
              <strong>{ijaza.title}</strong>
              {ijaza.sheikh_name && <span> - الشيخ: {ijaza.sheikh_name}</span>}
              <p>{ijaza.description?.substring(0, 100)}</p>
            </div>
            <div className="list-item-actions">
              <button onClick={() => handleEdit(ijaza)} className="btn-edit">تعديل</button>
              <button onClick={() => handleDelete(ijaza.id)} className="btn-delete">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageIjaza;