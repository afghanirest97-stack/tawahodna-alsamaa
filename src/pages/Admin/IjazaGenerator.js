// IjazaGenerator.js - أداة مساعدة لإنشاء الإجازات
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

function IjazaGenerator() {
  const [formData, setFormData] = useState({
    prefixText: `الحمدُ لله وكفى، وسلامٌ على عباده الذين اصطفى، وبعدُ:
فإنّ من أعظم ما يتقرّب به العبد إلى ربه بعد الفرائض، نشرُ العلم الشرعي، وروايةُ الحديث النبوي. وحيثُ أنّ الأخ/الأخت:`,
    studentName: '',
    suffixText: `قد تلقى هذا العلم، وسمعهُ عليَّ، أو قرأهُ عليَّ قراءةً صحيحةً مقبولةً شرعاً، فأجزتُ له/لها روايةَ هذا الكتاب عني، مشافهةً بسماعٍ متصل، ليكونَ من أهلِ هذا الشأنِ وأربابِ هذا الإسناد.`,
    titleText: 'إجازة في رواية الحديث',
    sheikhName: 'أحمد نهار صالح الحسامية',
    schoolName: '',
    dateText: '',
    datePicker: '',
    template: 'template-classic',
    font: 'font-amiri',
    basmalaStyle: 'simple',
    isnadText: '',
    otherShuyukh: '',
  });

  const [fontSizes, setFontSizes] = useState({
    basmala: 1.9,
    title: 1.45,
    content: 1.0,
    extras: 0.88,
    footer: 0.85,
  });

  const [imageSizes, setImageSizes] = useState({
    logo: 55,
    signature: 40,
    seal: 55,
  });

  const [images, setImages] = useState({
    logo: null,
    signature: null,
    seal: null,
    watermark: null
  });

  const [uiState, setUiState] = useState({
    loading: false,
    loadingText: '',
    progress: 0,
    total: 0,
    toast: { show: false, message: '', type: 'success' }
  });

  const [batchProgress, setBatchProgress] = useState({
    isProcessing: false,
    current: 0,
    total: 0,
    status: '',
    canCancel: false
  });

  const ijazahRef = useRef(null);
  const printContainerRef = useRef(null);
  const cancelBatchRef = useRef(false);

  // تنظيف عند فك التثبيت
  useEffect(() => {
    return () => {
      cancelBatchRef.current = true;
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDatePickerChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, datePicker: value }));
    if (value) {
      const dateObj = new Date(value);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString('ar-EG', options);
      setFormData(prev => ({ ...prev, dateText: formattedDate }));
    }
  };

  const updateFontSize = (key, delta) => {
    setFontSizes(prev => ({
      ...prev,
      [key]: Math.max(0.5, Math.min(3.5, parseFloat((prev[key] + delta).toFixed(2))))
    }));
  };

  const updateImageSize = (key, delta) => {
    setImageSizes(prev => ({
      ...prev,
      [key]: Math.max(15, Math.min(150, prev[key] + delta))
    }));
  };

  const handleImageUpload = (e, imageKey) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => ({ ...prev, [imageKey]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageKey) => {
    setImages(prev => ({ ...prev, [imageKey]: null }));
  };

  const showToast = (message, type = 'success') => {
    setUiState(prev => ({ ...prev, toast: { show: true, message, type } }));
    setTimeout(() => {
      setUiState(prev => ({ ...prev, toast: { show: false, message: '', type: 'success' } }));
    }, 3500);
  };

  const setLoading = (loading, text = '', progress = 0, total = 0) => {
    setUiState(prev => ({ ...prev, loading, loadingText: text, progress, total }));
  };

  const captureToPDF = async (element, pdf, shouldAddPage = false) => {
    const canvas = await html2canvas(element, {
      scale: 2, useCORS: true, logging: false,
      backgroundColor: '#ffffff', letterRendering: true,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    if (shouldAddPage) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  };

  const createIjazahPage = (name, date) => {
    const {
      prefixText, suffixText, titleText, sheikhName,
      schoolName, isnadText, otherShuyukh,
      basmalaStyle, template, font,
    } = formData;

    const cFS = fontSizes.content;
    const tFS = fontSizes.title;
    const bFS = fontSizes.basmala;
    const eFS = fontSizes.extras;
    const fFS = fontSizes.footer;
    const nFS = (cFS * 1.18).toFixed(2);
    const sFS = (tFS * 0.72).toFixed(2);

    const container = document.createElement('div');
    container.className = `ijazah-paper ${template} ${font}`;

    const basmalaContent = basmalaStyle === 'decorative'
      ? 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
      : 'بسم الله الرحمن الرحيم';
    const basmalaExtra = basmalaStyle === 'decorative' ? "font-family:'Aref Ruqaa',serif;" : '';
    const displayDate = date || formData.dateText || '';

    container.innerHTML = `
      ${images.watermark ? `<img class="ijazah-watermark" src="${images.watermark}" alt="watermark" />` : ''}

      <div class="ijazah-header">
        <div class="ijazah-logo-container">
          ${images.logo ? `<img src="${images.logo}" alt="Logo" style="max-height:${imageSizes.logo}px;" />` : ''}
        </div>
        ${schoolName ? `<div class="ijazah-school-name" style="font-size:${sFS}rem;">${schoolName}</div>` : ''}
        <div class="ijazah-basmala" style="font-size:${bFS}rem;${basmalaExtra}">${basmalaContent}</div>
        <div class="ijazah-title" style="font-size:${tFS}rem;">${titleText}</div>
      </div>

      <div class="ijazah-body-content">
        <div class="ijazah-content" style="font-size:${cFS}rem;">
          ${prefixText} <span class="ijazah-student-name" style="font-size:${nFS}rem;">${name || ' [اسم المجاز] '}</span> ${suffixText}
        </div>
        ${isnadText ? `<div class="ijazah-isnad" style="font-size:${eFS}rem;"><strong>الإسناد:</strong><br/>${isnadText}</div>` : ''}
        ${otherShuyukh ? `<div class="ijazah-other-shuyukh" style="font-size:${eFS}rem;"><strong>شهد وتجاوز بذلك شيوخ آخرون منهم:</strong><br/>${otherShuyukh}</div>` : ''}
      </div>

      <div class="ijazah-footer" style="font-size:${fFS}rem;">
        <div class="ijazah-footer-right">
          <div class="ijazah-footer-label">توقيع المجيز</div>
          ${images.signature ? `<img class="ijazah-signature" src="${images.signature}" alt="Signature" style="max-height:${imageSizes.signature}px;" />` : ''}
          <div class="ijazah-footer-name">${sheikhName ? `الشيخ/المجيز: ${sheikhName}` : 'الشيخ: ...'}</div>
        </div>
        <div class="ijazah-footer-left">
          ${images.seal ? `<img class="ijazah-seal" src="${images.seal}" alt="Seal" style="max-height:${imageSizes.seal}px;" />` : ''}
          <div class="ijazah-date">${displayDate ? `التاريخ: ${displayDate}` : 'التاريخ: ...'}</div>
        </div>
      </div>
    `;

    return container;
  };

  const downloadCurrentPDF = async () => {
    if (!formData.studentName.trim()) {
      showToast('الرجاء إدخال اسم الطالب المجاز', 'error');
      return;
    }
    setLoading(true, 'جاري إنشاء ملف PDF...');
    try {
      const element = ijazahRef.current;
      if (!element) throw new Error('Element not found');
      const pdf = new jsPDF('p', 'mm', 'a4');
      await captureToPDF(element, pdf, false);
      pdf.save(`ijazah_${formData.studentName}.pdf`);
      setLoading(false);
      showToast(`✅ تم تحميل إجازة ${formData.studentName} بنجاح`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showToast('❌ حدث خطأ أثناء التحميل', 'error');
    }
  };

  const processBatchExcel = async () => {
    const fileInput = document.getElementById('excelFile');
    if (!fileInput || !fileInput.files.length) {
      showToast('الرجاء اختيار ملف إكسل أولاً', 'error');
      return;
    }
    
    // إعادة تعيين حالة الإلغاء
    cancelBatchRef.current = false;
    
    setBatchProgress({
      isProcessing: true,
      current: 0,
      total: 0,
      status: 'جاري قراءة ملف الإكسل...',
      canCancel: true
    });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setBatchProgress({ isProcessing: false, current: 0, total: 0, status: '', canCancel: false });
          showToast('الملف فارغ!', 'error');
          return;
        }
        
        // التحقق من عدد الإجازات
        if (jsonData.length > 500) {
          const confirm = window.confirm(
            `⚠️ أنت على وشك إنشاء ${jsonData.length} إجازة.\n\n` +
            `قد تستغرق العملية ${Math.round(jsonData.length / 10)} دقيقة.\n\n` +
            `هل تريد المتابعة؟`
          );
          if (!confirm) {
            setBatchProgress({ isProcessing: false, current: 0, total: 0, status: '', canCancel: false });
            return;
          }
        }
        
        await generateBatchPDF(jsonData);
      } catch (err) {
        console.error(err);
        setBatchProgress({ isProcessing: false, current: 0, total: 0, status: '', canCancel: false });
        showToast('حدث خطأ في قراءة الملف', 'error');
      }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
  };

  const cancelBatch = () => {
    if (window.confirm('هل أنت متأكد من إلغاء عملية إنشاء الإجازات؟')) {
      cancelBatchRef.current = true;
      setBatchProgress(prev => ({
        ...prev,
        status: 'جاري الإلغاء...',
        canCancel: false
      }));
      showToast('⏹️ جاري إلغاء العملية...', 'error');
    }
  };

  const generateBatchPDF = async (dataRows) => {
    const totalRows = dataRows.length;
    let processedCount = 0;
    let errorCount = 0;
    let batchSize = 10; // معالجة 10 إجازات في كل دفعة
    
    setBatchProgress({
      isProcessing: true,
      current: 0,
      total: totalRows,
      status: `بدء إنشاء ${totalRows} إجازة...`,
      canCancel: true
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // معالجة الإجازات في دفعات
      for (let i = 0; i < totalRows; i += batchSize) {
        // التحقق من الإلغاء
        if (cancelBatchRef.current) {
          setBatchProgress({
            isProcessing: false,
            current: processedCount,
            total: totalRows,
            status: '❌ تم إلغاء العملية',
            canCancel: false
          });
          showToast(`⏹️ تم إلغاء العملية بعد إنشاء ${processedCount} إجازة`, 'error');
          return;
        }

        const batchEnd = Math.min(i + batchSize, totalRows);
        const batch = dataRows.slice(i, batchEnd);
        
        // معالجة دفعة واحدة
        for (let j = 0; j < batch.length; j++) {
          const row = batch[j];
          const name = row['الاسم'] || row['Name'] || row['اسم المجاز'] || row['student'] || 'غير محدد';
          const date = row['التاريخ'] || row['Date'] || row['تاريخ الإجازة'] || '';
          
          try {
            const pageElement = createIjazahPage(name, date);
            if (printContainerRef.current) {
              printContainerRef.current.innerHTML = '';
              printContainerRef.current.appendChild(pageElement);
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            await captureToPDF(pageElement, pdf, processedCount > 0);
            
            if (printContainerRef.current) {
              printContainerRef.current.innerHTML = '';
            }
            
            processedCount++;
            errorCount = 0; // إعادة تعيين عداد الأخطاء بعد نجاح
            
            // تحديث التقدم كل 5 إجازات أو عند اكتمال الدفعة
            if (processedCount % 5 === 0 || processedCount === totalRows) {
              setBatchProgress({
                isProcessing: true,
                current: processedCount,
                total: totalRows,
                status: `جاري إنشاء الإجازات (${processedCount}/${totalRows}) - يرجى عدم مغادرة الصفحة حتى يكتمل إنشاء الإجازات`,                canCancel: true
              });
            }
          } catch (err) {
            console.error(`خطأ في إنشاء إجازة للاسم: ${name}`, err);
            errorCount++;
            processedCount++;
            
            // إذا كان عدد الأخطاء كبيراً، أوقف العملية
            if (errorCount > 5) {
              throw new Error(`حدث ${errorCount} أخطاء متتالية. تم إيقاف العملية.`);
            }
          }
        }
        
        // تنظيف الذاكرة بين الدفعات
        if (i + batchSize < totalRows) {
          await new Promise(resolve => setTimeout(resolve, 100));
          // إفراغ الذاكرة المؤقتة
          if (window.gc) window.gc();
        }
      }

      // حفظ الملف النهائي
      if (processedCount > 0) {
        pdf.save('batch_ijazat.pdf');
        setBatchProgress({
          isProcessing: false,
          current: processedCount,
          total: totalRows,
          status: `✅ تم إنشاء ${processedCount} إجازة بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ''}`,
          canCancel: false
        });
        showToast(`✅ تم إنشاء ${processedCount} إجازة بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ''}`);
      } else {
        throw new Error('لم يتم إنشاء أي إجازة');
      }
      
    } catch (err) {
      console.error(err);
      setBatchProgress({
        isProcessing: false,
        current: processedCount,
        total: totalRows,
        status: `❌ حدث خطأ: ${err.message}`,
        canCancel: false
      });
      showToast(`❌ حدث خطأ: ${err.message}`, 'error');
    } finally {
      if (printContainerRef.current) {
        printContainerRef.current.innerHTML = '';
      }
    }
  };

  const resetForm = () => {
    setFormData({
      prefixText: `الحمدُ لله وكفى، وسلامٌ على عباده الذين اصطفى، وبعدُ:
فإنّ من أعظم ما يتقرّب به العبد إلى ربه بعد الفرائض، نشرُ العلم الشرعي، وروايةُ الحديث النبوي. وحيثُ أنّ الأخ/الأخت:`,
      studentName: '',
      suffixText: `قد تلقى هذا العلم، وسمعهُ عليَّ، أو قرأهُ عليَّ قراءةً صحيحةً مقبولةً شرعاً، فأجزتُ له/لها روايةَ هذا الكتاب عني، مشافهةً بسماعٍ متصل، ليكونَ من أهلِ هذا الشأنِ وأربابِ هذا الإسناد.`,
      titleText: 'إجازة في رواية الحديث',
      sheikhName: 'أحمد نهار صالح الحسامية',
      schoolName: '', dateText: '', datePicker: '',
      template: 'template-classic', font: 'font-amiri',
      basmalaStyle: 'simple', isnadText: '', otherShuyukh: '',
    });
    setFontSizes({ basmala: 1.9, title: 1.45, content: 1.0, extras: 0.88, footer: 0.85 });
    setImageSizes({ logo: 55, signature: 40, seal: 55 });
    setImages({ logo: null, signature: null, seal: null, watermark: null });
    showToast('تم إعادة تعيين النموذج');
  };

  const SizeRow = ({ label, value, onChange, icon, unit = 'rem' }) => (
    <div className="ijaza-fs-row">
      <span className="ijaza-fs-label">{icon} {label}</span>
      <div className="ijaza-fs-controls">
        <button className="ijaza-fs-btn" onClick={() => onChange(unit === 'rem' ? -0.05 : -5)} title="تصغير">−</button>
        <span className="ijaza-fs-val">{unit === 'rem' ? value.toFixed(2) : value}{unit === 'px' ? 'px' : ''}</span>
        <button className="ijaza-fs-btn" onClick={() => onChange(unit === 'rem' ? 0.05 : 5)} title="تكبير">+</button>
      </div>
    </div>
  );

  const ImgSizeRow = ({ label, value, onChange, icon, hasImage }) => (
    <div className={`ijaza-fs-row${!hasImage ? ' ijaza-fs-disabled' : ''}`}>
      <span className="ijaza-fs-label">{icon} {label}</span>
      <div className="ijaza-fs-controls">
        <button className="ijaza-fs-btn" onClick={() => onChange(-5)} disabled={!hasImage} title="تصغير">−</button>
        <span className="ijaza-fs-val">{value}px</span>
        <button className="ijaza-fs-btn" onClick={() => onChange(5)} disabled={!hasImage} title="تكبير">+</button>
      </div>
    </div>
  );

  return (
    <div className="ijaza-generator-wrapper">
      {uiState.loading && (
        <div className="ijaza-loading-overlay">
          <div className="ijaza-spinner"></div>
          <h3>{uiState.loadingText}</h3>
          {uiState.total > 0 && (
            <div className="ijaza-progress-container">
              <div className="ijaza-progress-bar">
                <div 
                  className="ijaza-progress-fill" 
                  style={{ width: `${(uiState.progress / uiState.total) * 100}%` }}
                />
              </div>
              <p className="ijaza-progress-text">
                {uiState.progress} / {uiState.total}
              </p>
            </div>
          )}
        </div>
      )}

      {/* شريط تقدم الدفعات */}
      {batchProgress.isProcessing && (
        <div className="ijaza-batch-progress">
          <div className="ijaza-batch-progress-content">
            <div className="ijaza-batch-progress-header">
              <h4>📊 إنشاء الإجازات</h4>
              <button 
                className="ijaza-btn ijaza-btn-danger"
                onClick={cancelBatch}
                disabled={!batchProgress.canCancel}
              >
                ⏹️ إلغاء
              </button>
            </div>
            <div className="ijaza-progress-container">
              <div className="ijaza-progress-bar">
                <div 
                  className="ijaza-progress-fill" 
                  style={{ 
                    width: batchProgress.total > 0 
                      ? `${(batchProgress.current / batchProgress.total) * 100}%` 
                      : '0%',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
              <p className="ijaza-progress-text">
                {batchProgress.current} / {batchProgress.total}
                <span className="ijaza-progress-percent">
                  ({batchProgress.total > 0 
                    ? Math.round((batchProgress.current / batchProgress.total) * 100) 
                    : 0}%)
                </span>
              </p>
              <p className="ijaza-progress-status">{batchProgress.status}</p>
            </div>
          </div>
        </div>
      )}

      {uiState.toast.show && (
        <div className={`ijaza-toast ${uiState.toast.type}`}>{uiState.toast.message}</div>
      )}

      <div id="printContainer" ref={printContainerRef} style={{
        position: 'fixed', top: 0, left: '-9999px', width: '210mm',
        background: 'white', zIndex: -1, overflow: 'visible', pointerEvents: 'none'
      }} />

      <div className="ijaza-container">
        <div className="ijaza-header-bar">
          <div className="ijaza-title">
            <h2>📜 مولد الإجازات الشرعية</h2>
            <p>أداة مساعدة لإنشاء الإجازات الشرعية وتحميلها بصيغة PDF</p>
          </div>
          <div className="ijaza-actions">
            <button className="ijaza-btn ijaza-btn-primary" onClick={downloadCurrentPDF}>⬇️ تحميل PDF</button>
            <button className="ijaza-btn ijaza-btn-outline" onClick={resetForm}>🔄 إعادة تعيين</button>
          </div>
        </div>

        <div className="ijaza-body">
          <aside className="ijaza-controls">
            {/* النصوص */}
            <div className="ijaza-section">
              <h3>📝 النصوص</h3>
              <div className="ijaza-form-group">
                <label>النص قبل الاسم</label>
                <textarea id="prefixText" value={formData.prefixText} onChange={handleInputChange} rows="3" />
              </div>
              <div className="ijaza-form-group">
                <label>👤 اسم الطالب المجاز</label>
                <input type="text" id="studentName" placeholder="اكتب الاسم هنا..." value={formData.studentName} onChange={handleInputChange} />
              </div>
              <div className="ijaza-form-group">
                <label>النص بعد الاسم</label>
                <textarea id="suffixText" value={formData.suffixText} onChange={handleInputChange} rows="3" />
              </div>
            </div>

            {/* البيانات */}
            <div className="ijaza-section">
              <h3>📋 البيانات الأساسية</h3>
              <div className="ijaza-form-group">
                <label>عنوان الإجازة</label>
                <input type="text" id="titleText" value={formData.titleText} onChange={handleInputChange} />
              </div>
              <div className="ijaza-form-group">
                <label>👳 اسم الشيخ المجيز</label>
                <input type="text" id="sheikhName" value={formData.sheikhName} onChange={handleInputChange} />
              </div>
              <div className="ijaza-form-group">
                <label>🏫 المدرسة / القناة</label>
                <input type="text" id="schoolName" placeholder="اسم الجهة" value={formData.schoolName} onChange={handleInputChange} />
              </div>
            </div>

            {/* التاريخ */}
            <div className="ijaza-section">
              <h3>📅 التاريخ</h3>
              <div className="ijaza-form-group">
                <div className="ijaza-date-group">
                  <input type="date" id="datePicker" value={formData.datePicker} onChange={handleDatePickerChange} />
                  <input type="text" id="dateText" placeholder="مثال: 15 رمضان 1445هـ" value={formData.dateText} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* أحجام الخطوط */}
            <div className="ijaza-section">
              <h3>📏 أحجام الخطوط</h3>
              <div className="ijaza-fs-list">
                <SizeRow label="البسملة" value={fontSizes.basmala} onChange={(d) => updateFontSize('basmala', d)} icon="📿" />
                <SizeRow label="العنوان" value={fontSizes.title} onChange={(d) => updateFontSize('title', d)} icon="🏷️" />
                <SizeRow label="النص الرئيسي" value={fontSizes.content} onChange={(d) => updateFontSize('content', d)} icon="📄" />
                <SizeRow label="الإسناد والإضافات" value={fontSizes.extras} onChange={(d) => updateFontSize('extras', d)} icon="🔗" />
                <SizeRow label="التوقيع والتاريخ" value={fontSizes.footer} onChange={(d) => updateFontSize('footer', d)} icon="✍️" />
              </div>
            </div>

            {/* الثيم */}
            <div className="ijaza-section">
              <h3>🎨 الثيم والمظهر</h3>
              <div className="ijaza-form-group">
                <label>قالب التصميم</label>
                <select id="template" value={formData.template} onChange={handleInputChange}>
                  <optgroup label="──── كلاسيكي ────">
                    <option value="template-classic">كلاسيكي</option>
                    <option value="template-white-pearl">الدرة البيضاء</option>
                  </optgroup>
                  <optgroup label="──── إسلامي ────">
                    <option value="template-islamic-pattern">نقش إسلامي</option>
                    <option value="template-ottoman">عثماني</option>
                    <option value="template-safavid">صفوي</option>
                    <option value="template-mamluk">مملوكي</option>
                    <option value="template-moroccan">مغربي (زليجي)</option>
                  </optgroup>
                  <optgroup label="──── تراثي ────">
                    <option value="template-andalusian">أندلسي</option>
                    <option value="template-samarqandi">سمرقندي</option>
                    <option value="template-gilded">مذهّب</option>
                    <option value="template-nabati">نبطي</option>
                    <option value="template-noorani">نوراني</option>
                  </optgroup>
                </select>
              </div>
              <div className="ijaza-form-group">
                <label>نوع الخط</label>
                <select id="font" value={formData.font} onChange={handleInputChange}>
                  <option value="font-amiri">أميري</option>
                  <option value="font-scheherazade">شهرزاد</option>
                  <option value="font-aref">عرفة</option>
                  <option value="font-reem">ريم كوفي</option>
                  <option value="font-tajawal">تاجوال</option>
                  <option value="font-almarai">المراعي</option>
                </select>
              </div>
              <div className="ijaza-form-group">
                <label>شكل البسملة</label>
                <select id="basmalaStyle" value={formData.basmalaStyle} onChange={handleInputChange}>
                  <option value="simple">بسملة بسيطة</option>
                  <option value="decorative">بسملة زخرفية</option>
                </select>
              </div>
            </div>

            {/* إضافات */}
            <div className="ijaza-section">
              <h3>✨ إضافات</h3>
              <div className="ijaza-form-group">
                <label>السند</label>
                <textarea id="isnadText" placeholder="اكتب السند هنا..." value={formData.isnadText} onChange={handleInputChange} rows="2" />
              </div>
              <div className="ijaza-form-group">
                <label>شيوخ آخرون يجيزون</label>
                <textarea id="otherShuyukh" placeholder="الشيخ فلان، الشيخ علان..." value={formData.otherShuyukh} onChange={handleInputChange} rows="2" />
              </div>
            </div>

            {/* الصور */}
            <div className="ijaza-section">
              <h3>🖼️ الصور</h3>
              <div className="ijaza-image-grid">
                {['logo', 'signature', 'seal', 'watermark'].map((key) => (
                  <div key={key} className="ijaza-image-item">
                    <label>
                      {key === 'logo' && '🏷️ شعار'}
                      {key === 'signature' && '✍️ توقيع'}
                      {key === 'seal' && '🔵 ختم'}
                      {key === 'watermark' && '💧 علامة مائية'}
                    </label>
                    <div className="ijaza-image-preview-wrapper">
                      {images[key] ? (
                        <div className="ijaza-image-preview">
                          <img src={images[key]} alt={key} />
                          <button className="ijaza-remove-image" onClick={() => removeImage(key)}>✕</button>
                        </div>
                      ) : (
                        <label className="ijaza-image-upload-btn">
                          <span>📤</span><span>رفع</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, key)} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* أحجام الصور */}
              <div className="ijaza-img-sizes-box">
                <div className="ijaza-img-sizes-title">📏 أحجام الصور</div>
                <div className="ijaza-fs-list">
                  <ImgSizeRow label="الشعار" value={imageSizes.logo} onChange={(d) => updateImageSize('logo', d)} icon="🏷️" hasImage={!!images.logo} />
                  <ImgSizeRow label="التوقيع" value={imageSizes.signature} onChange={(d) => updateImageSize('signature', d)} icon="✍️" hasImage={!!images.signature} />
                  <ImgSizeRow label="الختم" value={imageSizes.seal} onChange={(d) => updateImageSize('seal', d)} icon="🔵" hasImage={!!images.seal} />
                </div>
              </div>
            </div>

            {/* جملة */}
            <div className="ijaza-section">
              <h3>📦 الإنتاج بالجملة</h3>
              <div className="ijaza-form-group">
                <div className="ijaza-excel-upload">
                  <input type="file" id="excelFile" accept=".xlsx, .xls" />
                  <button 
                    className="ijaza-btn ijaza-btn-success" 
                    onClick={processBatchExcel}
                    disabled={batchProgress.isProcessing}
                  >
                    {batchProgress.isProcessing ? '⏳ جاري المعالجة...' : '📊 إنشاء PDF'}
                  </button>
                </div>
                <p className="ijaza-hint">
                  📌 يجب أن يحتوي الملف على عمود "الاسم" وعمود "التاريخ"<br/>
                  ⚠️ يوصى بعدم تجاوز 500 إجازة لكل ملف
                </p>
              </div>
            </div>
          </aside>

          {/* المعاينة */}
          <main className="ijaza-preview">
            <div className="ijaza-preview-toolbar">
              <span className="ijaza-preview-label">📄 المعاينة</span>
              <button className="ijaza-btn ijaza-btn-sm" onClick={downloadCurrentPDF}>⬇️ تحميل</button>
            </div>
            <div className="ijaza-preview-wrapper">
              <div ref={ijazahRef} className={`ijazah-paper ${formData.template} ${formData.font}`}>
                {images.watermark && <img className="ijazah-watermark" src={images.watermark} alt="watermark" />}

                <div className="ijazah-header">
                  <div className="ijazah-logo-container">
                    {images.logo && <img src={images.logo} alt="Logo" style={{ maxHeight: imageSizes.logo + 'px' }} />}
                  </div>
                  {formData.schoolName && (
                    <div className="ijazah-school-name" style={{ fontSize: (fontSizes.title * 0.72) + 'rem' }}>
                      {formData.schoolName}
                    </div>
                  )}
                  <div
                    className={`ijazah-basmala${formData.basmalaStyle === 'decorative' ? ' ijazah-basmala-deco' : ''}`}
                    style={{
                      fontSize: fontSizes.basmala + 'rem',
                      ...(formData.basmalaStyle === 'decorative' ? { fontFamily: "'Aref Ruqaa', serif" } : {})
                    }}
                  >
                    {formData.basmalaStyle === 'decorative'
                      ? 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
                      : 'بسم الله الرحمن الرحيم'}
                  </div>
                  <div className="ijazah-title" style={{ fontSize: fontSizes.title + 'rem' }}>
                    {formData.titleText}
                  </div>
                </div>

                <div className="ijazah-body-content">
                  <div className="ijazah-content" style={{ fontSize: fontSizes.content + 'rem' }}>
                    {formData.prefixText}
                    <span className="ijazah-student-name" style={{ fontSize: (fontSizes.content * 1.18) + 'rem' }}>
                      {formData.studentName || ' [اسم المجاز] '}
                    </span>
                    {formData.suffixText}
                  </div>

                  {formData.isnadText && (
                    <div className="ijazah-isnad" style={{ fontSize: fontSizes.extras + 'rem' }}>
                      <strong>الإسناد:</strong><br />{formData.isnadText}
                    </div>
                  )}

                  {formData.otherShuyukh && (
                    <div className="ijazah-other-shuyukh" style={{ fontSize: fontSizes.extras + 'rem' }}>
                      <strong>شهد وتجاوز بذلك شيوخ آخرون منهم:</strong><br />{formData.otherShuyukh}
                    </div>
                  )}
                </div>

                <div className="ijazah-footer" style={{ fontSize: fontSizes.footer + 'rem' }}>
                  <div className="ijazah-footer-right">
                    <div className="ijazah-footer-label">توقيع المجيز</div>
                    {images.signature && <img className="ijazah-signature" src={images.signature} alt="Signature" style={{ maxHeight: imageSizes.signature + 'px' }} />}
                    <div className="ijazah-footer-name">
                      {formData.sheikhName ? `الشيخ/المجيز: ${formData.sheikhName}` : 'الشيخ: ...'}
                    </div>
                  </div>
                  <div className="ijazah-footer-left">
                    {images.seal && <img className="ijazah-seal" src={images.seal} alt="Seal" style={{ maxHeight: imageSizes.seal + 'px' }} />}
                    <div className="ijazah-date">
                      {formData.dateText ? `التاريخ: ${formData.dateText}` : 'التاريخ: ...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        /* ============================================
           Ijaza Generator - أنماط معزولة
        ============================================ */
        .ijaza-generator-wrapper * { all: revert; box-sizing: border-box; }
        .ijaza-generator-wrapper {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5; min-height: 100vh; padding: 20px; direction: rtl;
        }

        .ijazah-paper, .ijazah-paper *, .ijazah-paper *::before, .ijazah-paper *::after {
          word-break: normal !important;
          overflow-wrap: break-word !important;
          -webkit-hyphens: none !important;
          hyphens: none !important;
        }
        .ijazah-paper .ijazah-title {
          letter-spacing: normal !important;
          word-spacing: normal !important;
        }

        .ijaza-toast {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          padding: 16px 32px; border-radius: 12px; color: white; font-weight: 500;
          z-index: 1000; animation: ijazaSlideUp 0.5s ease;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .ijaza-toast.success { background: #10b981; }
        .ijaza-toast.error { background: #ef4444; }
        @keyframes ijazaSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .ijaza-loading-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.9); z-index: 999;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .ijaza-spinner {
          width: 50px; height: 50px; border: 4px solid #e2e8f0;
          border-top-color: #8e44ad; border-radius: 50%;
          animation: ijazaSpin 0.8s linear infinite; margin-bottom: 16px;
        }
        @keyframes ijazaSpin { to { transform: rotate(360deg); } }

        /* شريط التقدم المحسن */
        .ijaza-progress-container {
          width: 300px; margin-top: 16px;
        }
        .ijaza-progress-bar {
          width: 100%; height: 12px; background: #e2e8f0;
          border-radius: 20px; overflow: hidden;
        }
        .ijaza-progress-fill {
          height: 100%; background: linear-gradient(90deg, #8e44ad, #c39bd3);
          transition: width 0.3s ease; border-radius: 20px;
        }
        .ijaza-progress-text {
          text-align: center; font-size: 0.85rem; color: #4b5563;
          margin-top: 8px; font-weight: 600;
        }
        .ijaza-progress-status {
          text-align: center; font-size: 0.8rem; color: #6b7280;
          margin-top: 4px;
        }
        .ijaza-progress-percent {
          color: #8e44ad; margin-right: 6px;
        }

        /* شريط تقدم الدفعات */
        .ijaza-batch-progress {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: white; padding: 16px 24px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
          z-index: 998; border-top: 3px solid #8e44ad;
        }
        .ijaza-batch-progress-content {
          max-width: 800px; margin: 0 auto;
        }
        .ijaza-batch-progress-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 10px;
        }
        .ijaza-batch-progress-header h4 {
          font-size: 1rem; color: #1a1a2e;
        }
        .ijaza-btn-danger {
          background: #ef4444; color: white;
        }
        .ijaza-btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        .ijaza-btn-danger:disabled {
          opacity: 0.5; cursor: not-allowed;
        }

        .ijaza-container {
          max-width: 1600px; margin: 0 auto; background: white;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }

        .ijaza-header-bar {
          background: #fff; padding: 24px 32px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px; border-bottom: 2px solid #f0f0f0;
        }
        .ijaza-title h2 { color: #1a1a2e; font-size: 1.5rem; margin-bottom: 4px; font-weight: 700; }
        .ijaza-title p { color: #6b7280; font-size: 0.9rem; }
        .ijaza-actions { display: flex; gap: 10px; }

        .ijaza-btn {
          padding: 10px 20px; border: none; border-radius: 12px;
          font-weight: 600; cursor: pointer; transition: all 0.3s ease;
          display: inline-flex; align-items: center; gap: 8px; font-size: 0.9rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .ijaza-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .ijaza-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        .ijaza-btn-primary { background: #8e44ad; color: white; }
        .ijaza-btn-primary:hover:not(:disabled) { background: #7d3c98; }
        .ijaza-btn-success { background: #10b981; color: white; }
        .ijaza-btn-success:hover:not(:disabled) { background: #059669; }
        .ijaza-btn-outline { background: #f3f4f6; color: #1a1a2e; }
        .ijaza-btn-outline:hover:not(:disabled) { background: #e5e7eb; }
        .ijaza-btn-sm { padding: 6px 14px; font-size: 0.8rem; }

        .ijaza-body { display: flex; min-height: 600px; }

        .ijaza-controls {
          width: 400px; background: #fafbfc; padding: 24px;
          overflow-y: auto; max-height: 85vh; border-left: 1px solid #e5e7eb;
        }
        .ijaza-controls::-webkit-scrollbar { width: 5px; }
        .ijaza-controls::-webkit-scrollbar-track { background: #f1f1f1; }
        .ijaza-controls::-webkit-scrollbar-thumb { background: #8e44ad; border-radius: 5px; }

        .ijaza-section { margin-bottom: 20px; }
        .ijaza-section h3 {
          font-size: 0.92rem; color: #1a1a2e; margin-bottom: 10px;
          padding-bottom: 7px; border-bottom: 2px solid #8e44ad;
          display: flex; align-items: center; gap: 8px; font-weight: 700;
        }
        .ijaza-form-group { margin-bottom: 10px; }
        .ijaza-form-group label {
          display: block; font-size: 0.78rem; font-weight: 600;
          color: #4b5563; margin-bottom: 3px;
        }
        .ijaza-form-group input,
        .ijaza-form-group select,
        .ijaza-form-group textarea {
          width: 100%; padding: 7px 10px; border: 1px solid #d1d5db;
          border-radius: 8px; font-size: 0.85rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: border-color 0.2s ease; background: white; color: #1a1a2e;
        }
        .ijaza-form-group input:focus,
        .ijaza-form-group select:focus,
        .ijaza-form-group textarea:focus {
          outline: none; border-color: #8e44ad;
          box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
        }
        .ijaza-form-group textarea { resize: vertical; min-height: 50px; }
        .ijaza-date-group { display: flex; gap: 8px; }
        .ijaza-date-group input { flex: 1; }

        /* --- Font Size Controls --- */
        .ijaza-fs-list { display: flex; flex-direction: column; gap: 5px; }
        .ijaza-fs-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 8px; background: #f4f5f7; border-radius: 8px;
          transition: background 0.2s ease;
        }
        .ijaza-fs-row:hover { background: #eeeef3; }
        .ijaza-fs-row.ijaza-fs-disabled {
          opacity: 0.4; pointer-events: none;
        }
        .ijaza-fs-label {
          font-size: 0.78rem; font-weight: 600; color: #374151; flex: 1;
        }
        .ijaza-fs-controls {
          display: flex; align-items: center; gap: 3px;
        }
        .ijaza-fs-btn {
          width: 28px; height: 28px; border: 1px solid #d1d5db;
          border-radius: 6px; background: white; cursor: pointer;
          font-size: 1.1rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s ease; color: #1a1a2e; padding: 0; line-height: 1;
        }
        .ijaza-fs-btn:hover:not(:disabled) { background: #8e44ad; color: white; border-color: #8e44ad; }
        .ijaza-fs-btn:active:not(:disabled) { transform: scale(0.92); }
        .ijaza-fs-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ijaza-fs-val {
          font-size: 0.68rem; color: #6b7280; min-width: 36px;
          text-align: center; font-family: 'Courier New', monospace; font-weight: 600;
        }

        /* --- Image Sizes Box --- */
        .ijaza-img-sizes-box {
          margin-top: 10px; padding: 10px;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 10px;
        }
        .ijaza-img-sizes-title {
          font-size: 0.72rem; font-weight: 700; color: #6b7280;
          margin-bottom: 7px; padding-bottom: 5px;
          border-bottom: 1px dashed #d1d5db;
        }

        /* Image Upload */
        .ijaza-image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ijaza-image-item label { font-size: 0.72rem; font-weight: 600; color: #4b5563; display: block; margin-bottom: 3px; }
        .ijaza-image-preview-wrapper { position: relative; }
        .ijaza-image-preview { position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #e5e7eb; background: #f8fafc; }
        .ijaza-image-preview img { width: 100%; height: 70px; object-fit: contain; display: block; }
        .ijaza-remove-image {
          position: absolute; top: -6px; right: -6px;
          background: #ef4444; border: none; border-radius: 50%;
          width: 22px; height: 22px; color: white; cursor: pointer;
          font-size: 0.65rem; display: flex; align-items: center; justify-content: center;
        }
        .ijaza-image-upload-btn {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; height: 70px; border: 2px dashed #d1d5db; border-radius: 8px;
          cursor: pointer; transition: all 0.2s ease; background: #f8fafc; color: #6b7280;
        }
        .ijaza-image-upload-btn:hover { border-color: #8e44ad; background: #faf5ff; color: #8e44ad; }
        .ijaza-image-upload-btn span { font-size: 0.65rem; }

        .ijaza-excel-upload { display: flex; gap: 8px; align-items: center; }
        .ijaza-excel-upload input[type="file"] { flex: 1; padding: 7px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.78rem; }
        .ijaza-hint { font-size: 0.68rem; color: #6b7280; margin-top: 3px; line-height: 1.6; }

        .ijaza-preview { flex: 1; padding: 20px; background: #e8ecf1; display: flex; flex-direction: column; }
        .ijaza-preview-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ijaza-preview-label { font-weight: 600; color: #1a1a2e; }
        .ijaza-preview-wrapper { flex: 1; display: flex; justify-content: center; overflow: auto; background: #dce1e8; border-radius: 12px; padding: 16px; }

        /* ============================================
           IJAZAH PAPER
        ============================================ */
        .ijazah-paper {
          width: 210mm; height: 297mm;
          background: white; padding: 14mm 16mm;
          padding-bottom: 16mm;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          position: relative; direction: rtl; color: #000;
          font-size: 1rem; line-height: 2;
          flex-shrink: 0; overflow: hidden;
        }

        .ijazah-header { text-align: center; margin-bottom: 5mm; }
        .ijazah-logo-container img { margin-bottom: 3px; }
        .ijazah-school-name { font-weight: bold; margin-bottom: 2px; color: #2c3e50; }
        .ijazah-basmala { font-weight: bold; margin-bottom: 2mm; line-height: 1.5; }
        .ijazah-basmala-deco { font-family: 'Aref Ruqaa', serif; }
        .ijazah-title { font-weight: bold; margin-bottom: 2mm; line-height: 1.6; }

        .ijazah-body-content { margin-bottom: 24mm; }
        .ijazah-content { line-height: 2.1; text-align: justify; }
        .ijazah-student-name {
          font-weight: bold; color: #c0392b;
          background: rgba(192,57,43,0.07);
          padding: 0 5px; border-radius: 3px;
        }
        .ijazah-isnad {
          margin-top: 3mm; padding: 3mm 4mm;
          background: rgba(0,0,0,0.03);
          border-right: 3px solid #8e44ad; line-height: 1.8;
        }
        .ijazah-other-shuyukh { margin-top: 2mm; color: #555; line-height: 1.8; }

        .ijazah-footer {
          position: absolute; bottom: 14mm; left: 16mm; right: 16mm;
          display: flex; justify-content: space-between; align-items: flex-end;
          padding-top: 3mm; border-top: 1px solid #ccc;
        }
        .ijazah-footer-right { text-align: center; }
        .ijazah-footer-left { text-align: center; }
        .ijazah-footer-label { font-size: 0.75rem; color: #666; margin-bottom: 1px; }
        .ijazah-footer-name { font-weight: bold; }
        .ijazah-signature { display: block; margin: 1px auto; }
        .ijazah-seal { opacity: 0.9; }
        .ijazah-date { margin-top: 2mm; font-weight: bold; }
        .ijazah-watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.05; width: 80%; pointer-events: none; z-index: 0;
        }

        /* ============================================
           12 THEMES
        ============================================ */
        .ijazah-paper.template-classic { border: 1px solid #ddd; }

        .ijazah-paper.template-white-pearl {
          border: 1px solid #d4d4d4;
          background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
          border-radius: 4px;
        }
        .ijazah-paper.template-white-pearl .ijazah-title { color: #2c3e50; font-weight: 700; }

        .ijazah-paper.template-islamic-pattern {
          border: 3px solid #1a5276;
          background: #fef9f0;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(26,82,118,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(26,82,118,0.03) 0%, transparent 50%);
        }
        .ijazah-paper.template-islamic-pattern::before {
          content: "\\06FD"; position: absolute; top: 5mm; left: 50%;
          transform: translateX(-50%); font-size: 2.2rem; opacity: 0.08;
          color: #1a5276; font-family: 'Aref Ruqaa', serif; pointer-events: none;
        }
        .ijazah-paper.template-islamic-pattern .ijazah-title {
          color: #1a5276; font-family: 'Aref Ruqaa', serif;
          border-bottom: 2px solid #1a5276; padding-bottom: 2mm;
        }

        .ijazah-paper.template-ottoman {
          border: 4px solid #c9a84c;
          background: linear-gradient(160deg, #faf0d7 0%, #f5e6c8 40%, #f0dcc0 100%);
          box-shadow: inset 0 0 40px rgba(201,168,76,0.08), 0 0 20px rgba(0,0,0,0.1);
        }
        .ijazah-paper.template-ottoman::before {
          content: ""; position: absolute;
          top: 4mm; left: 4mm; right: 4mm; bottom: 4mm;
          border: 1px solid rgba(201,168,76,0.4); pointer-events: none;
        }
        .ijazah-paper.template-ottoman::after {
          content: ""; position: absolute;
          top: 7mm; left: 7mm; right: 7mm; bottom: 7mm;
          border: 1px solid rgba(201,168,76,0.25); pointer-events: none;
        }
        .ijazah-paper.template-ottoman .ijazah-basmala { color: #8b6914; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-ottoman .ijazah-title { color: #5c3d1a; font-family: 'Aref Ruqaa', serif; border-bottom: 2px solid #c9a84c; padding-bottom: 2mm; }
        .ijazah-paper.template-ottoman .ijazah-student-name { color: #8b1a1a; background: rgba(139,26,26,0.06); }
        .ijazah-paper.template-ottoman .ijazah-footer { border-top-color: #c9a84c; }

        .ijazah-paper.template-safavid {
          border: 3px solid #1a8a8a; background: #f0f8fa;
          background-image:
            radial-gradient(circle at 15% 15%, rgba(26,138,138,0.04) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(26,138,138,0.04) 0%, transparent 40%);
        }
        .ijazah-paper.template-safavid::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 7mm;
          background: linear-gradient(to bottom, rgba(26,138,138,0.12), transparent); pointer-events: none;
        }
        .ijazah-paper.template-safavid::after {
          content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 7mm;
          background: linear-gradient(to top, rgba(26,138,138,0.12), transparent); pointer-events: none;
        }
        .ijazah-paper.template-safavid .ijazah-basmala { color: #0d6e6e; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-safavid .ijazah-title { color: #0d5c5c; font-family: 'Aref Ruqaa', serif; background: rgba(26,138,138,0.08); padding: 1mm 6mm; border-radius: 3px; display: inline-block; }
        .ijazah-paper.template-safavid .ijazah-isnad { border-right-color: #1a8a8a; }

        .ijazah-paper.template-mamluk {
          border: 4px solid #3d3d3d; background: #f5f2ed;
          background-image:
            linear-gradient(45deg, rgba(60,60,60,0.02) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(60,60,60,0.02) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(60,60,60,0.02) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(60,60,60,0.02) 75%);
          background-size: 20mm 20mm;
          background-position: 0 0, 0 10mm, 10mm -10mm, -10mm 0px;
        }
        .ijazah-paper.template-mamluk::before {
          content: ""; position: absolute;
          top: 3mm; left: 3mm; right: 3mm; bottom: 3mm;
          border: 1px solid rgba(60,60,60,0.15); pointer-events: none;
        }
        .ijazah-paper.template-mamluk .ijazah-basmala { color: #4a3728; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-mamluk .ijazah-title { color: #2c2c2c; font-family: 'Aref Ruqaa', serif; border-bottom: 3px double #3d3d3d; padding-bottom: 2mm; }
        .ijazah-paper.template-mamluk .ijazah-footer { border-top: 2px solid #3d3d3d; }

        .ijazah-paper.template-moroccan {
          border: 4px solid #b5533a; background: #fdf8f5;
          background-image:
            radial-gradient(circle at 0% 0%, rgba(181,83,58,0.05) 0%, transparent 30%),
            radial-gradient(circle at 100% 100%, rgba(45,106,79,0.05) 0%, transparent 30%);
        }
        .ijazah-paper.template-moroccan::before {
          content: ""; position: absolute;
          top: 5mm; left: 5mm; right: 5mm; bottom: 5mm;
          border: 2px solid rgba(181,83,58,0.2); pointer-events: none;
        }
        .ijazah-paper.template-moroccan::after {
          content: ""; position: absolute;
          top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
          border: 1px solid rgba(45,106,79,0.2); pointer-events: none;
        }
        .ijazah-paper.template-moroccan .ijazah-basmala { color: #2d6a4f; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-moroccan .ijazah-title { color: #8b2e1a; font-family: 'Aref Ruqaa', serif; border-bottom: 3px solid #b5533a; padding-bottom: 2mm; }
        .ijazah-paper.template-moroccan .ijazah-student-name { color: #8b2e1a; background: rgba(181,83,58,0.06); }
        .ijazah-paper.template-moroccan .ijazah-isnad { border-right-color: #b5533a; }
        .ijazah-paper.template-moroccan .ijazah-footer { border-top-color: #b5533a; }

        .ijazah-paper.template-andalusian {
          border: 2px solid #a67c52; background: #fdf8f0; border-radius: 8px;
          box-shadow: inset 0 0 30px rgba(166,124,82,0.05);
        }
        .ijazah-paper.template-andalusian .ijazah-basmala { color: #8B6914; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-andalusian .ijazah-title { color: #6B4C2A; font-family: 'Aref Ruqaa', serif; background: linear-gradient(to right, transparent, #f0e4d0, transparent); padding: 1mm 8mm; border-radius: 3px; }

        .ijazah-paper.template-samarqandi { border: 3px double #2c3e50; background: #fffcf5; }
        .ijazah-paper.template-samarqandi::after {
          content: ""; position: absolute;
          top: 5mm; left: 5mm; right: 5mm; bottom: 5mm;
          border: 1px dashed #2c3e50; pointer-events: none; opacity: 0.3;
        }
        .ijazah-paper.template-samarqandi .ijazah-title { color: #2c3e50; font-family: 'Aref Ruqaa', serif; }

        .ijazah-paper.template-gilded {
          border: 4px solid #b8860b;
          background: linear-gradient(145deg, #fffcf0, #f5ede0);
          box-shadow: 0 0 40px rgba(184,134,11,0.1);
        }
        .ijazah-paper.template-gilded .ijazah-basmala { color: #b8860b; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-gilded .ijazah-title { color: #7a6400; font-family: 'Aref Ruqaa', serif; border-bottom: 3px solid #b8860b; padding-bottom: 2mm; }

        .ijazah-paper.template-nabati {
          border: 3px solid #8b6914;
          background: linear-gradient(180deg, #faf6ee 0%, #f5eed8 100%);
        }
        .ijazah-paper.template-nabati::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 5mm;
          background: linear-gradient(to bottom, rgba(139,105,20,0.15), transparent); pointer-events: none;
        }
        .ijazah-paper.template-nabati::after {
          content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 5mm;
          background: linear-gradient(to top, rgba(139,105,20,0.15), transparent); pointer-events: none;
        }
        .ijazah-paper.template-nabati .ijazah-basmala { color: #6b4e0a; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-nabati .ijazah-title { color: #4a3510; font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.template-nabati .ijazah-student-name { color: #8b1a1a; }
        .ijazah-paper.template-nabati .ijazah-footer { border-top: 2px solid rgba(139,105,20,0.3); }

        .ijazah-paper.template-noorani {
          border: 2px solid #2e86c1; background: #f0f8ff; border-radius: 10px;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(46,134,193,0.03) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(46,134,193,0.03) 0%, transparent 50%);
        }
        .ijazah-paper.template-noorani .ijazah-title { color: #1a5276; font-family: 'Amiri', serif; }
        .ijazah-paper.template-noorani .ijazah-basmala { color: #2e86c1; }

        .ijazah-paper.font-amiri { font-family: 'Amiri', serif; }
        .ijazah-paper.font-scheherazade { font-family: 'Scheherazade New', serif; }
        .ijazah-paper.font-aref { font-family: 'Aref Ruqaa', serif; }
        .ijazah-paper.font-reem { font-family: 'Reem Kufi', sans-serif; }
        .ijazah-paper.font-tajawal { font-family: 'Tajawal', sans-serif; }
        .ijazah-paper.font-almarai { font-family: 'Almarai', sans-serif; }

        @media (max-width: 1200px) { .ijaza-controls { width: 350px; } }
        @media (max-width: 1024px) {
          .ijaza-body { flex-direction: column; }
          .ijaza-controls { width: 100%; max-height: 500px; border-left: none; border-bottom: 1px solid #e5e7eb; }
          .ijaza-preview { min-height: 600px; }
        }
        @media (max-width: 768px) {
          .ijaza-generator-wrapper { padding: 10px; }
          .ijaza-header-bar { padding: 16px 20px; flex-direction: column; align-items: stretch; }
          .ijaza-title h2 { font-size: 1.2rem; }
          .ijaza-actions { flex-wrap: wrap; }
          .ijaza-btn { flex: 1; justify-content: center; }
          .ijaza-controls { padding: 16px; max-height: 400px; }
          .ijaza-date-group { flex-direction: column; }
          .ijaza-excel-upload { flex-direction: column; }
          .ijaza-excel-upload input[type="file"] { width: 100%; }
          .ijaza-batch-progress { padding: 12px 16px; }
          .ijaza-batch-progress-header { flex-direction: column; gap: 8px; align-items: stretch; }
        }
        @media (max-width: 480px) {
          .ijaza-image-grid { grid-template-columns: 1fr; }
          .ijaza-actions { flex-direction: column; }
          .ijaza-btn { width: 100%; }
          .ijaza-progress-container { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default IjazaGenerator;