import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaGraduationCap, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaLink, FaDownload } from 'react-icons/fa';

function StudySanad() {
  const [studies, setStudies] = useState([]);
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchStudies();
  }, []);

  async function fetchStudies() {
    try {
      const { data, count } = await supabase
        .from('study_sanad')
        .select('*', { count: 'exact' })
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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudies(studies);
      setTotalItems(studies.length);
    } else {
      const filtered = studies.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.sanad_chain && item.sanad_chain.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="studysanad-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>دراسة الأسانيد</h1>
          <p>دراسات وبحوث في علم الإسناد وطرق التحمل والأداء</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في دراسات الأسانيد... (العنوان أو المحتوى أو سند الدراسة)"
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
            تم العثور على {totalItems} دراسة
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaGraduationCap />
            <p>لا توجد دراسات مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="studies-grid-modern">
              {currentItems.map(study => (
                <div key={study.id} className="study-card-modern">
                  <div className="study-card-header">
                    {study.image_url ? (
                      <img src={study.image_url} alt={study.title} className="study-card-image" />
                    ) : (
                      <div className="study-card-icon">
                        <FaGraduationCap />
                      </div>
                    )}
                    <div className="study-card-badge">دراسة إسناد</div>
                  </div>
                  <div className="study-card-body">
                    <h3>{study.title}</h3>
                    {study.sanad_chain && (
                      <div className="study-sanad-chain">
                        <FaLink /> سند الدراسة
                        <p className="sanad-chain-text">
                          {study.sanad_chain.length > 80 
                            ? study.sanad_chain.substring(0, 80) + '...' 
                            : study.sanad_chain}
                        </p>
                      </div>
                    )}
                    {study.content && (
                      <p className="study-content">
                        {study.content.length > 100 
                          ? study.content.substring(0, 100) + '...' 
                          : study.content}
                      </p>
                    )}
                    {study.file_url && (
                      <a 
                        href={study.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="study-file-link"
                      >
                        <FaDownload /> تحميل الدراسة
                      </a>
                    )}
                  </div>
                  <div className="study-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedStudy(study)}
                    >
                      <FaEye /> قراءة الدراسة
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-modern">
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <FaChevronRight /> السابق
                </button>
                
                <div className="pagination-numbers">
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  التالي <FaChevronLeft />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal لعرض التفاصيل الكاملة */}
      {selectedStudy && (
        <div className="modal-overlay" onClick={() => setSelectedStudy(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedStudy(null)}>×</button>
            <h2>{selectedStudy.title}</h2>
            {selectedStudy.sanad_chain && (
              <div className="modal-sanad-chain">
                <div className="sanad-label">
                  <FaLink /> سند الدراسة:
                </div>
                <div className="sanad-chain-full">
                  {selectedStudy.sanad_chain}
                </div>
              </div>
            )}
            <div className="modal-body">
              <p>{selectedStudy.content}</p>
            </div>
            {selectedStudy.file_url && (
              <a href={selectedStudy.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                <FaDownload /> تحميل الدراسة بصيغة PDF
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        .page-header-modern {
          text-align: center;
          margin: 2rem 0 3rem;
        }
        
        .page-header-modern h1 {
          font-size: 2.5rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }
        
        .page-header-modern p {
          color: #6c757d;
          font-size: 1rem;
        }
        
        .search-section-modern {
          max-width: 600px;
          margin: 0 auto 3rem;
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
          transition: all 0.3s ease;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #e8b339;
          box-shadow: 0 0 0 3px rgba(232, 179, 57, 0.1);
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
          font-size: 0.85rem;
          color: #6c757d;
        }
        
        .studies-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .study-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .study-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .study-card-header {
          position: relative;
          height: 160px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .study-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .study-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.3);
        }
        
        .study-card-badge {
          position: absolute;
          bottom: -12px;
          right: 20px;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.25rem 1rem;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .study-card-body {
          padding: 1.5rem;
        }
        
        .study-card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .study-sanad-chain {
          background: #f8f9fa;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          font-size: 0.75rem;
          color: #e8b339;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .study-sanad-chain p {
          color: #6c757d;
          font-size: 0.8rem;
          margin: 0;
          line-height: 1.5;
        }
        
        .study-content {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .study-file-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8f9fa;
          color: #1b4f6e;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          text-decoration: none;
          font-size: 0.75rem;
          border: 1px solid #e9ecef;
        }
        
        .study-card-footer {
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid #e9ecef;
        }
        
        .btn-view-details {
          width: 100%;
          background: #f8f9fa;
          border: none;
          padding: 0.6rem;
          border-radius: 50px;
          color: #1b4f6e;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .btn-view-details:hover {
          background: #e8b339;
          color: white;
        }
        
        .pagination-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
          padding: 2rem 0;
        }
        
        .pagination-btn {
          background: white;
          border: 1px solid #e9ecef;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #1b4f6e;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #e8b339;
          border-color: #e8b339;
          color: white;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-numbers {
          display: flex;
          gap: 0.5rem;
        }
        
        .pagination-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1b4f6e;
        }
        
        .pagination-number:hover {
          border-color: #e8b339;
          color: #e8b339;
        }
        
        .pagination-number.active {
          background: #e8b339;
          border-color: #e8b339;
          color: white;
        }
        
        .no-results {
          text-align: center;
          padding: 4rem;
          color: #adb5bd;
        }
        
        .no-results svg {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        
        .modal-content-large {
          background: white;
          border-radius: 24px;
          max-width: 800px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #adb5bd;
        }
        
        .modal-sanad-chain {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 16px;
          margin: 1rem 0;
        }
        
        .sanad-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e8b339;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .sanad-chain-full {
          color: #4a5568;
          font-size: 0.9rem;
          line-height: 1.8;
          font-family: 'Amiri', serif;
          padding-right: 1rem;
          border-right: 3px solid #e8b339;
        }
        
        .modal-body p {
          color: #4a5568;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        
        .btn-primary-modal {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-top: 1rem;
        }
        
        .btn-primary-modal:hover {
          background: #d4a32a;
        }
        
        @media (max-width: 768px) {
          .studies-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .pagination-numbers {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default StudySanad;