import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaUserTie, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaDownload } from 'react-icons/fa';

function Scholars() {
  const [scholars, setScholars] = useState([]);
  const [filteredScholars, setFilteredScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholar, setSelectedScholar] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchScholars();
  }, []);

  async function fetchScholars() {
    try {
      const { data, count } = await supabase
        .from('scholars')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true });
      
      if (data) {
        setScholars(data);
        setFilteredScholars(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching scholars:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredScholars(scholars);
      setTotalItems(scholars.length);
    } else {
      const filtered = scholars.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.biography && item.biography.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredScholars(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, scholars]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredScholars.slice(indexOfFirstItem, indexOfLastItem);
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

  // دالة لتنسيق التاريخ (إظهار الوفاة فقط إذا كانت موجودة)
  const formatDates = (scholar) => {
    const parts = [];
    if (scholar.birth_year && scholar.birth_year !== '0000' && scholar.birth_year !== '0') {
      parts.push(`ولد: ${scholar.birth_year}`);
    }
    if (scholar.death_year && scholar.death_year !== '0000' && scholar.death_year !== '0') {
      parts.push(`توفي: ${scholar.death_year}`);
    }
    return parts.join(' | ');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="scholars-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>تراجم العلماء</h1>
          <p>سير وتراجم علماء الأمة عبر التاريخ</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث عن عالم... (الاسم أو السيرة)"
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
            تم العثور على {totalItems} عالم
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaUserTie />
            <p>لا توجد تراجم مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="scholars-grid-modern">
              {currentItems.map(scholar => (
                <div key={scholar.id} className="scholar-card-modern">
                  <div className="scholar-card-header">
                    {scholar.image_url ? (
                      <div className="scholar-image-wrapper">
                        <img 
                          src={scholar.image_url} 
                          alt={scholar.name} 
                          className="scholar-card-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.scholar-card-icon').style.display = 'flex';
                          }}
                        />
                        <div className="scholar-card-icon" style={{ display: 'none' }}>
                          <FaUserTie />
                        </div>
                      </div>
                    ) : (
                      <div className="scholar-card-icon">
                        <FaUserTie />
                      </div>
                    )}
                    <div className="scholar-card-badge">عالم جليل</div>
                  </div>
                  <div className="scholar-card-body">
                    <h3>{scholar.name}</h3>
                    {(scholar.birth_year || scholar.death_year) && formatDates(scholar) && (
                      <div className="scholar-dates">
                        <FaCalendarAlt />
                        <span>{formatDates(scholar)}</span>
                      </div>
                    )}
                    {scholar.biography && (
                      <p className="scholar-biography">
                        {scholar.biography.length > 120 
                          ? scholar.biography.substring(0, 120) + '...' 
                          : scholar.biography}
                      </p>
                    )}
                    {scholar.file_url && (
                      <a 
                        href={scholar.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="scholar-file-link"
                      >
                        <FaDownload /> تحميل الترجمة
                      </a>
                    )}
                  </div>
                  <div className="scholar-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedScholar(scholar)}
                    >
                      <FaEye /> قراءة الترجمة
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
      {selectedScholar && (
        <div className="modal-overlay" onClick={() => setSelectedScholar(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedScholar(null)}>×</button>
            
            <div className="modal-header">
              {selectedScholar.image_url && (
                <div className="modal-image-wrapper">
                  <img 
                    src={selectedScholar.image_url} 
                    alt={selectedScholar.name} 
                    className="modal-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="modal-title">
                <h2>{selectedScholar.name}</h2>
                {(selectedScholar.birth_year || selectedScholar.death_year) && (
                  <p className="modal-dates">
                    {selectedScholar.birth_year && selectedScholar.birth_year !== '0000' && selectedScholar.birth_year !== '0' && `المولد: ${selectedScholar.birth_year}`}
                    {selectedScholar.birth_year && selectedScholar.death_year && ' • '}
                    {selectedScholar.death_year && selectedScholar.death_year !== '0000' && selectedScholar.death_year !== '0' && `الوفاة: ${selectedScholar.death_year}`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="modal-body">
              <p>{selectedScholar.biography}</p>
            </div>
            
            {selectedScholar.file_url && (
              <a href={selectedScholar.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                <FaDownload /> تحميل الترجمة كاملة
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
        
        .scholars-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 2rem;
        }
        
        .scholar-card-modern {
          background: white;
          border-radius: 28px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .scholar-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .scholar-card-header {
          position: relative;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .scholar-image-wrapper {
          width: 260px;
          height: 260px;
          border-radius: 50%;
          overflow: hidden;
          border: 5px solid #e8b339;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background: #f8f9fa;
        }
        
        .scholar-card-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #f8f9fa;
        }
        
        .scholar-card-icon {
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7rem;
          color: rgba(255,255,255,0.4);
          background: #1b4f6e;
          border-radius: 50%;
        }
        
        .scholar-card-badge {
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
        
        .scholar-card-body {
          padding: 1.5rem;
        }
        
        .scholar-card-body h3 {
          font-size: 1.4rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          text-align: center;
        }
        
        .scholar-dates {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          background: #f8f9fa;
          padding: 0.3rem 1rem;
          border-radius: 50px;
          color: #e8b339;
          margin-bottom: 0.75rem;
          justify-content: center;
          width: 100%;
        }
        
        .scholar-biography {
          color: #6c757d;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .scholar-file-link {
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
          width: 100%;
          justify-content: center;
        }
        
        .scholar-card-footer {
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
          max-width: 700px;
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
        
        .modal-header {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .modal-image-wrapper {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 3px solid #e8b339;
          background: #f8f9fa;
        }
        
        .modal-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .modal-title h2 {
          font-size: 1.5rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }
        
        .modal-dates {
          color: #e8b339;
          font-size: 0.85rem;
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
          .scholars-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .modal-header {
            flex-direction: column;
            text-align: center;
          }
          
          .modal-image-wrapper {
            margin: 0 auto;
          }
          
          .scholar-image-wrapper {
            width: 200px;
            height: 200px;
          }
          
          .scholar-card-icon {
            width: 200px;
            height: 200px;
            font-size: 6rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Scholars;