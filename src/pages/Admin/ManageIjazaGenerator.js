import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const ManageIjazaGenerator = () => {
  const previewRef = useRef(null);

  const [formData, setFormData] = useState({
    prefixText: 'الحمدُ لله وكفى، وسلامٌ على عباده الذين اصطفى، وبعدُ:\nفإنّ من أعظم ما يتقرّب به العبد إلى ربه بعد الفرائض، نشرُ العلم الشرعي، وروايةُ الحديث النبوي. وحيثُ أنّ الأخ/الأخت:',
    studentName: '',
    suffixText: 'قد تلقى هذا العلم، وسمعهُ عليَّ، أو قرأهُ عليَّ قراءةً صحيحةً مقبولةً شرعاً، فأجزتُ له/لها روايةَ هذا الكتاب عني، مشافهةً بسماعٍ متصل، ليكونَ من أهلِ هذا الشأنِ وأربابِ هذا الإسناد.',
    titleText: 'إجازة في رواية الحديث',
    sheikhName: 'أحمد نهار صالح الحسامية',
    schoolName: '',
    dateText: '',
    template: 'template-islamic-pattern',
    font: 'font-amiri',
    basmalaStyle: 'simple',
    isnadText: '',
    otherShuyukh: '',
  });

  const [images, setImages] = useState({
    logo: null,
    signature: null,
    seal: null,
    watermark: null,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages(prev => ({ ...prev, [key]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const updateDateFromPicker = (e) => {
    const date = new Date(e.target.value);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = date.toLocaleDateString('ar-EG', options);
    setFormData(prev => ({ ...prev, dateText: formatted }));
  };

  const downloadCurrentPDF = async () => {
    if (!previewRef.current) return;

    const loading = document.createElement('div');
    loading.innerHTML = 'جاري إنشاء PDF...';
    loading.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:white;padding:20px;border-radius:8px;';
    document.body.appendChild(loading);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`إجازة_${formData.studentName || 'بدون_اسم'}.pdf`);
    } catch (err) {
      alert('حدث خطأ أثناء إنشاء الملف');
    } finally {
      document.body.removeChild(loading);
    }
  };

  const processBatchExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      generateBatchPDF(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const generateBatchPDF = async (rows) => {
    if (rows.length === 0) return alert('الملف فارغ!');

    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row['الاسم'] || row['Name'] || row['اسم المجاز'] || 'غير محدد';
      const date = row['التاريخ'] || row['Date'] || row['تاريخ'] || '';

      setFormData(prev => ({ ...prev, studentName: name, dateText: date }));

      await new Promise(resolve => setTimeout(resolve, 700));

      const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    }

    pdf.save('إجازات_جماعية.pdf');
    alert(`تم إنشاء ${rows.length} إجازة بنجاح!`);
  };

  // تحديث المحتوى
  const fullContent = `${formData.prefixText} <span class="student-name-highlight">${formData.studentName || '[اسم الطالب]'}</span> ${formData.suffixText}`;

  return (
    <div className="ijazah-generator-container">
      <div className="controls-panel">
        <h2>📜 مولد الإجازات الشرعية الاحترافي</h2>

        <button onClick={downloadCurrentPDF} className="btn btn-primary">
          ⬇️ تحميل الإجازة الحالية (PDF)
        </button>

        {/* النصوص الثلاثية */}
        <div className="section">
          <h3>1. النصوص الأساسية</h3>
          <textarea id="prefixText" value={formData.prefixText} onChange={handleChange} placeholder="النص قبل الاسم" />
          <input type="text" id="studentName" value={formData.studentName} onChange={handleChange} placeholder="اسم الطالب" />
          <textarea id="suffixText" value={formData.suffixText} onChange={handleChange} placeholder="النص بعد الاسم" />
        </div>

        {/* البيانات الأساسية */}
        <div className="section">
          <h3>2. البيانات</h3>
          <input type="text" id="titleText" value={formData.titleText} onChange={handleChange} placeholder="عنوان الإجازة" />
          <input type="text" id="sheikhName" value={formData.sheikhName} onChange={handleChange} placeholder="اسم الشيخ" />
          <input type="text" id="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="اسم المدرسة / الجهة" />
        </div>

        {/* التاريخ */}
        <div className="section">
          <h3>3. التاريخ</h3>
          <input type="date" onChange={updateDateFromPicker} />
          <input type="text" id="dateText" value={formData.dateText} onChange={handleChange} placeholder="مثال: 15 رمضان 1446هـ" />
        </div>

        {/* الثيم والخط */}
        <div className="section">
          <h3>4. التصميم</h3>
          <select id="template" value={formData.template} onChange={(e) => setFormData(prev => ({...prev, template: e.target.value}))}>
            <option value="template-islamic-pattern">نقش إسلامي</option>
            <option value="template-andalusian">أندلسي</option>
            <option value="template-white-pearl">الدرة البيضاء</option>
            <option value="template-samarqandi">سمرقندي</option>
            <option value="template-gilded">مذهّب</option>
            <option value="template-noorani">نوراني</option>
          </select>

          <select id="font" value={formData.font} onChange={(e) => setFormData(prev => ({...prev, font: e.target.value}))}>
            <option value="font-amiri">أميري</option>
            <option value="font-aref">عرفة</option>
            <option value="font-scheherazade">شهرزاد</option>
          </select>

          <select id="basmalaStyle" value={formData.basmalaStyle} onChange={(e) => setFormData(prev => ({...prev, basmalaStyle: e.target.value}))}>
            <option value="simple">بسملة بسيطة</option>
            <option value="decorative">بسملة زخرفية</option>
          </select>
        </div>

        {/* إضافات */}
        <div className="section">
          <h3>5. إضافات</h3>
          <textarea id="isnadText" value={formData.isnadText} onChange={handleChange} placeholder="السند" />
          <textarea id="otherShuyukh" value={formData.otherShuyukh} onChange={handleChange} placeholder="شيوخ آخرون" />
        </div>

        {/* الصور */}
        <div className="section">
          <h3>6. الصور</h3>
          <label>شعار الجهة: <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} /></label><br />
          <label>التوقيع: <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} /></label><br />
          <label>الختم: <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'seal')} /></label><br />
          <label>علامة مائية: <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'watermark')} /></label>
        </div>

        {/* الإنتاج الجماعي */}
        <div className="section">
          <h3>7. الإنتاج بالجملة</h3>
          <input type="file" accept=".xlsx,.xls" onChange={processBatchExcel} />
          <p style={{ fontSize: '0.85rem', color: '#666' }}>يجب أن يحتوي الملف على عمود "الاسم" و"التاريخ"</p>
        </div>
      </div>

      {/* منطقة المعاينة */}
      <div className="preview-area">
        <div ref={previewRef} className={`ijazah-paper ${formData.template} ${formData.font}`} style={{
          width: '210mm',
          minHeight: '297mm',
          background: 'white',
          padding: '20mm',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          position: 'relative',
          direction: 'rtl',
          fontSize: '1.05rem',
          lineHeight: '2.1',
        }}>
          {images.watermark && <img src={images.watermark} className="watermark" alt="watermark" style={{ opacity: 0.08, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '70%' }} />}

          <div className="header">
            {images.logo && <img src={images.logo} alt="logo" style={{ maxHeight: '80px', marginBottom: '10px' }} />}
            {formData.schoolName && <div className="school-name">{formData.schoolName}</div>}
            
            <div className="basmala" style={formData.basmalaStyle === 'decorative' ? { fontSize: '2.5rem', fontFamily: "'Aref Ruqaa', serif" } : {}}>
              {formData.basmalaStyle === 'decorative' ? 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' : 'بسم الله الرحمن الرحيم'}
            </div>
            <div className="title">{formData.titleText}</div>
          </div>

          <div className="content" dangerouslySetInnerHTML={{ __html: fullContent }} />

          {formData.isnadText && <div className="isnad-box"><strong>الإسناد:</strong><br />{formData.isnadText}</div>}
          {formData.otherShuyukh && <div className="other-shuyukh"><strong>شيوخ آخرون:</strong><br />{formData.otherShuyukh}</div>}

          <div className="footer">
            <div className="footer-right">
              <div>توقيع المجيز</div>
              {images.signature && <img src={images.signature} className="signature-img" alt="signature" style={{ maxHeight: '70px' }} />}
              <div style={{ fontWeight: 'bold' }}>الشيخ: {formData.sheikhName}</div>
            </div>
            <div className="footer-left">
              {images.seal && <img src={images.seal} className="seal-img" alt="seal" style={{ maxHeight: '90px' }} />}
              <div className="date-box">التاريخ: {formData.dateText || '.............'}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ijazah-generator-container {
          display: flex;
          gap: 25px;
          flex-wrap: wrap;
          padding: 20px;
        }
        .controls-panel {
          width: 380px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          height: fit-content;
        }
        .preview-area {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background: #e0e0e0;
          padding: 40px;
          border-radius: 12px;
          min-height: 100vh;
        }
        .ijazah-paper {
          box-shadow: 0 0 25px rgba(0,0,0,0.12);
        }
        .btn-primary {
          background: #2c3e50;
          color: white;
          padding: 12px;
          width: 100%;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-bottom: 15px;
        }
        .section { margin: 20px 0; }
        .section h3 { color: #8e44ad; margin-bottom: 10px; }
        input, textarea, select {
          width: 100%;
          padding: 10px;
          margin: 8px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        textarea { min-height: 100px; }
        /* يمكنك إضافة باقي الـ CSS من الكود الأصلي هنا */
      `}</style>
    </div>
  );
};

export default ManageIjazaGenerator;