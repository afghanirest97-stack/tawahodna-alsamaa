import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  FaSearch, FaBook, FaCalendarAlt, FaUserShield, 
  FaFilePdf, FaEye, FaTimes, FaChevronLeft, FaChevronRight,
  FaInfoCircle, FaHeart, FaShare, FaGraduationCap
} from 'react-icons/fa';

function StudySanad() {
  const [studies, setStudies] = useState([]);
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [siteInfo, setSiteInfo] = useState({
    introduction: '',
    definition: '',
    generalReason: ''
  });

  useEffect(() => {
    fetchStudies();
    fetchSiteInfo();
  }, []);

  async function fetchStudies() {
    try {
      const { data, count } = await supabase
        .from('study_sanads')
        .select(`
          *,
          users:user_id (name)
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (data) {
        setStudies(data);
        setFilteredStudies(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching studies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSiteInfo() {
    // يمكن جلب هذه المعلومات من جدول الإعدادات
    setSiteInfo({
      introduction: 'مرحباً بكم في قسم دراسة أسانيد الحديث الشريف، حيث نقدم لكم دراسات متخصصة في علم الإسناد وأصوله.',
      definition: 'الأسانيد هي السلسلة المتصلة من الرواة التي تصلنا إلى المصدر الأصلي للحديث النبوي الشريف، وهي من أهم علوم الحديث التي تميز بها الأمة الإسلامية.',
      generalReason: 'تهدف هذه الدراسة إلى توثيق الأسانيد والحفاظ عليها، وفهم منهج المحدثين في قبول الروايات وردها، وتدريب طلاب العلم على أصول علم الإسناد.'
    });
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudies(studies);
      setTotalItems(studies.length);
    } else {
      const filtered = studies.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.reason && item.reason.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudies(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, studies]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="study-sanad-page">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1>📖 دراسة أسانيد الحديث الشريف</h1>
            <p>رحلة في علم الإسناد وأصول قبول الرواية</p>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="info-section">
          <div className="info-card">
            <FaInfoCircle className="info-icon" />
            <h3>تعريف الدراسة</h3>
            <p>{siteInfo.definition}</p>
          </div>
          <div className="info-card">
            <FaGraduationCap className="info-icon" />
            <h3>سبب الدراسة</h3>
            <p>{siteInfo.generalReason}</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في الدراسات... (عنوان، ملخص، وصف)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FaTimes />
              </button>
            )}
          </div>
          <div className="results-count">
            📚 تم العثور على {totalItems} دراسة
          </div>
        </div>

        {/* Studies Grid */}
        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaBook />
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على دراسات مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="studies-grid">
              {currentItems.map(study => (
                <div key={study.id} className="study-card">
                  {study.image_url && (
                    <div className="card-image">
                      <img src={study.image_url} alt={study.title} />
                    </div>
                  )}
                  <div className="card-body">
                    <h3>{study.title}</h3>
                    {study.summary && (
                      <p className="summary">{study.summary}</p>
                    )}
                    {study.reason && (
                      <div className="reason-box">
                        <strong>🎯 أهمية الدراسة:</strong>
                        <p>{study.reason}</p>
                      </div>
                    )}
                    <div className="card-meta">
                      <span><FaCalendarAlt /> {formatDate(study.created_at)}</span>
                      <span><FaUserShield /> أضيف بواسطة: {study.users?.name || 'أحمد'}</span>
                    </div>
                    {study.file_url && (
                      <a 
                        href={study.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="file-link"
                      >
                        <FaFilePdf /> تحميل الدراسة (PDF)
                      </a>
                    )}
                  </div>
                  <div className="card-footer">
                    <button 
                      className="btn-details"
                      onClick={() => setSelectedStudy(study)}
                    >
                      <FaEye /> قراءة المزيد
                    </button>
                    <div className="card-actions">
                      <button className="action-btn" title="مشاركة">
                        <FaShare />
                      </button>
                      <button className="action-btn" title="إعجاب">
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  <FaChevronRight /> السابق
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  التالي <FaChevronLeft />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for full details */}
      {selectedStudy && (
        <div className="modal-overlay" onClick={() => setSelectedStudy(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedStudy(null)}>×</button>
            
            {selectedStudy.image_url && (
              <div className="modal-image">
                <img src={selectedStudy.image_url} alt={selectedStudy.title} />
              </div>
            )}
            
            <h2>{selectedStudy.title}</h2>
            
            <div className="modal-meta">
              <span><FaCalendarAlt /> {formatDate(selectedStudy.created_at)}</span>
              <span><FaUserShield /> أضيف بواسطة: {selectedStudy.users?.name || 'أحمد'}</span>
            </div>
            
            {selectedStudy.reason && (
              <div className="modal-reason">
                <h4>🎯 أهمية الدراسة:</h4>
                <p>{selectedStudy.reason}</p>
              </div>
            )}
            
            {selectedStudy.summary && (
              <div className="modal-summary">
                <h4>📝 ملخص الدراسة:</h4>
                <p>{selectedStudy.summary}</p>
              </div>
            )}
            
            {selectedStudy.description && (
              <div className="modal-description">
                <h4>📖 تفاصيل الدراسة:</h4>
                <p>{selectedStudy.description}</p>
              </div>
            )}
            
            {selectedStudy.file_url && (
              <a 
                href={selectedStudy.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modal-download"
              >
                <FaFilePdf /> تحميل الدراسة (PDF)
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        .study-sanad-page {
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding-bottom: 3rem;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .hero-section {
          background: linear-gradient(135deg, #1b4f6e 0%, #0d2b3e 100%);
          border-radius: 30px;
          padding: 4rem 2rem;
          text-align: center;
          margin: 2rem 0;
          color: white;
        }

        .hero-content h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .hero-content p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .info-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }

        .info-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .info-icon {
          font-size: 2.5rem;
          color: #e8b339;
          margin-bottom: 1rem;
        }

        .info-card h3 {
          color: #1b4f6e;
          margin-bottom: 1rem;
        }

        .info-card p {
          color: #6c757d;
          line-height: 1.6;
        }

        .search-section {
          max-width: 600px;
          margin: 2rem auto;
        }

        .search-box {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
        }

        .search-box input {
          width: 100%;
          padding: 1rem 3rem 1rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          font-size: 1rem;
          background: white;
        }

        .search-box input:focus {
          outline: none;
          border-color: #e8b339;
        }

        .clear-search {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #adb5bd;
        }

        .results-count {
          text-align: center;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .studies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
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

        .card-image {
          height: 200px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .study-card:hover .card-image img {
          transform: scale(1.05);
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
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .reason-box {
          background: #fef3e2;
          padding: 0.75rem;
          border-radius: 12px;
          margin: 1rem 0;
          border-right: 3px solid #e8b339;
        }

        .reason-box strong {
          color: #e8b339;
          font-size: 0.8rem;
        }

        .reason-box p {
          color: #495057;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          color: #adb5bd;
          margin: 1rem 0;
          flex-wrap: wrap;
        }

        .card-meta span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .file-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #e8b339;
          text-decoration: none;
          font-size: 0.85rem;
          margin-top: 1rem;
        }

        .card-footer {
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e9ecef;
        }

        .btn-details {
          background: #f8f9fa;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          color: #1b4f6e;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-details:hover {
          background: #e8b339;
          color: white;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: #adb5bd;
          cursor: pointer;
          font-size: 1rem;
          transition: color 0.2s;
        }

        .action-btn:hover {
          color: #e8b339;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin: 3rem 0;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #e8b339;
          color: white;
          border-color: #e8b339;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .page-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-number:hover {
          border-color: #e8b339;
          color: #e8b339;
        }

        .page-number.active {
          background: #e8b339;
          border-color: #e8b339;
          color: white;
        }

        .no-results {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 20px;
          margin: 2rem 0;
        }

        .no-results svg {
          font-size: 4rem;
          color: #dee2e6;
          margin-bottom: 1rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: sticky;
          top: 1rem;
          left: 1rem;
          float: left;
          width: 35px;
          height: 35px;
          background: #f8f9fa;
          border: none;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem;
        }

        .modal-image {
          width: 100%;
          max-height: 300px;
          overflow: hidden;
        }

        .modal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-content h2 {
          padding: 0 1.5rem;
          color: #1b4f6e;
          clear: both;
        }

        .modal-meta {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          color: #6c757d;
          font-size: 0.8rem;
        }

        .modal-reason, .modal-summary, .modal-description {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f2f5;
        }

        .modal-reason h4, .modal-summary h4, .modal-description h4 {
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }

        .modal-download {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.75rem;
          margin: 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 1.5rem;
          }
          
          .hero-content p {
            font-size: 1rem;
          }
          
          .studies-grid {
            grid-template-columns: 1fr;
          }
          
          .info-section {
            grid-template-columns: 1fr;
          }
          
          .page-numbers {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default StudySanad;