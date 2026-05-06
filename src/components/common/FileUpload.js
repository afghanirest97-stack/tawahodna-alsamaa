import React, { useState } from 'react';
import { uploadFile } from '../../services/supabase';

function FileUpload({ bucket, onUpload, label, accept = "image/*,application/pdf,.xlsx" }) {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(bucket, file);
      setFileUrl(url);
      if (onUpload) onUpload(url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ في رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload" style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e3a5f' }}>{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        style={{ width: '100%', padding: '0.5rem', border: '2px solid #e0e0e0', borderRadius: '10px' }}
      />
      {uploading && <span style={{ display: 'inline-block', marginTop: '0.5rem', color: '#c9a03d' }}>جاري الرفع...</span>}
      {fileUrl && (
        <div className="upload-preview" style={{ marginTop: '0.5rem' }}>
          {fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img src={fileUrl} alt="Preview" style={{ maxWidth: '100px', borderRadius: '10px' }} />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a03d' }}>معاينة الملف</a>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;