import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FaUserPlus, FaEdit, FaTrash, FaKey, FaUserTie } from 'react-icons/fa';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password_hash: formData.password,
      role: formData.role
    };

    let error;
    if (editingUser) {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      if (formData.password) {
        updateData.password_hash = formData.password;
      }
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('users')
        .insert([userData]);
      error = insertError;
    }

    if (!error) {
      alert(editingUser ? 'تم تحديث المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      setEditingUser(null);
      fetchUsers();
    } else {
      alert('حدث خطأ: ' + error.message);
    }
    setLoading(false);
  }

  function handleEdit(user) {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (!error) fetchUsers();
      else alert('خطأ في الحذف: ' + error.message);
    }
  }

  async function resetPassword(id) {
    const newPassword = prompt('أدخل كلمة المرور الجديدة:');
    if (newPassword && newPassword.length >= 6) {
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPassword })
        .eq('id', id);
      if (!error) {
        alert('تم تغيير كلمة المرور بنجاح');
        fetchUsers();
      } else {
        alert('حدث خطأ: ' + error.message);
      }
    } else if (newPassword) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }
  }

  return (
    <div className="admin-form">
      <div className="users-header">
        <h2>
          <FaUserTie /> إدارة المستخدمين
        </h2>
        <button className="btn btn-primary" onClick={() => {
          setShowAddForm(!showAddForm);
          setEditingUser(null);
          setFormData({ name: '', email: '', password: '', role: 'user' });
        }}>
          <FaUserPlus /> {showAddForm ? 'إغلاق' : '+ إضافة مستخدم جديد'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-user-form">
          <h3>{editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>الاسم الكامل</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="form-group">
              <label>كلمة المرور {editingUser && '(اتركها فارغة للحفاظ على نفس الكلمة)'}</label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
              />
            </div>
            <div className="form-group">
              <label>الدور</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">مشرف</option>
                <option value="super_admin">مدير عام</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'جاري المعالجة...' : (editingUser ? 'تحديث المستخدم' : 'إضافة المستخدم')}
            </button>
            <button type="button" className="btn" onClick={() => {
              setShowAddForm(false);
              setEditingUser(null);
              setFormData({ name: '', email: '', password: '', role: 'user' });
            }}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>الدور</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-name">
                    <span className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => {
                      const { error } = supabase
                        .from('users')
                        .update({ role: e.target.value })
                        .eq('id', user.id);
                      if (!error) fetchUsers();
                    }}
                    className="role-select"
                  >
                    <option value="user">مشرف</option>
                    <option value="super_admin">مدير عام</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString('ar')}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(user)} className="btn-edit" title="تعديل">
                    <FaEdit />
                  </button>
                  <button onClick={() => resetPassword(user.id)} className="btn-edit" title="تغيير كلمة المرور">
                    <FaKey />
                  </button>
                  {user.email !== 'admin@tawahudna.com' && (
                    <button onClick={() => handleDelete(user.id)} className="btn-delete" title="حذف">
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .users-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
        }
        
        .add-user-form {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          border: 1px solid #e9ecef;
        }
        
        .add-user-form h3 {
          margin-bottom: 1.25rem;
          color: #1b4f6e;
          font-size: 1.2rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          justify-content: flex-end;
        }
        
        .users-table {
          overflow-x: auto;
        }
        
        .users-table table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: right;
          border-bottom: 1px solid #e9ecef;
        }
        
        .users-table th {
          background: #1b4f6e;
          color: white;
          font-weight: 600;
        }
        
        .users-table tr:hover {
          background: #f8f9fa;
        }
        
        .user-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .user-avatar {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #e8b339, #c99a1a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #1b4f6e;
        }
        
        .role-select {
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: white;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .actions button {
          padding: 0.35rem 0.7rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-edit {
          background: #e8b33920;
          color: #e8b339;
        }
        
        .btn-edit:hover {
          background: #e8b339;
          color: white;
        }
        
        .btn-delete {
          background: #dc262620;
          color: #dc2626;
        }
        
        .btn-delete:hover {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default ManageUsers;