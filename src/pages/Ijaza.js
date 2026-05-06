import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaCertificate, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaUser, FaYoutube, FaFilePdf } from 'react-icons/fa';

function Ijaza() {
  const [ijazat, setIjazat] = useState([]);
  const [filteredIjazat, setFilteredIjazat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIjaza, setSelectedIjaza] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchIjazat();
  }, []);

  async function fetchIjazat() {
    try {
      const { data, count } = await supabase
        .from('ijazat')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (data) {
        setIjazat(data);
        setFilteredIjazat(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching ijazat:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredIjazat(ijazat);
      setTotalItems(ijazat.length);
    } else {
      const filtered = ijazat.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sheikh_name && item.sheikh_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredIjazat(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, ijazat]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIjazat.slice(indexOfFirstItem, indexOfLastItem);
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

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="ijaza-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>الإجازات العلمية</h1>
          <p>الإجازات المتصلة إلى علماء الأمة</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في الإجازات... (العنوان أو اسم الشيخ)"
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
            تم العثور على {totalItems} إجازة
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaCertificate />
            <p>لا توجد إجازات مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="ijazat-grid">
              {currentItems.map(ijaza => (
                <div key={ijaza.id} className="ijaza-card">
                  <div className="ijaza-card-header">
                    {ijaza.image_url ? (
                      <img src={ijaza.image_url} alt={ijaza.title} className="ijaza-card-image" />
                    ) : (
                      <div className="ijaza-card-icon">
                        <FaCertificate />
                      </div>
                    )}
                    <div className="ijaza-card-badge">إجازة علمية</div>
                  </div>
                  <div className="ijaza-card-body">
                    <h3>{ijaza.title}</h3>
                    {ijaza.sheikh_name && (
                      <div className="ijaza-sheikh">
                        <FaUser /> {ijaza.sheikh_name}
                      </div>
                    )}
                    {ijaza.description && (
                      <p className="ijaza-description">
                        {ijaza.description.length > 100 
                          ? ijaza.description.substring(0, 100) + '...' 
                          : ijaza.description}
                      </p>
                    )}
                    <div className="ijaza-links">
                      {ijaza.youtube_url && (
                        <span className="youtube-indicator">
                          <FaYoutube /> فيديو
                        </span>
                      )}
                      {ijaza.file_url && (
                        <span className="pdf-indicator">
                          <FaFilePdf /> PDF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ijaza-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedIjaza(ijaza)}
                    >
                      <FaEye /> عرض التفاصيل
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

      {selectedIjaza && (
        <div className="modal-overlay" onClick={() => setSelectedIjaza(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedIjaza(null)}>×</button>
            <h2>{selectedIjaza.title}</h2>
            {selectedIjaza.sheikh_name && (
              <div className="modal-sheikh">
                <FaUser /> الشيخ: {selectedIjaza.sheikh_name}
              </div>
            )}
            <div className="modal-body">
              <p>{selectedIjaza.description}</p>
            </div>
            {selectedIjaza.youtube_url && (
              <div className="modal-video">
                <iframe
                  src={getYoutubeEmbedUrl(selectedIjaza.youtube_url)}
                  title={selectedIjaza.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {selectedIjaza.file_url && (
              <a href={selectedIjaza.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                <FaFilePdf /> تحميل الإجازة
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        .ijaza-page {
          min-height: 60vh;
        }

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
          box-shadow: 0 0 0 3px rgba(232,179,57,0.1);
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
        
        .ijazat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .ijaza-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .ijaza-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .ijaza-card-header {
          position: relative;
          height: 160px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .ijaza-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .ijaza-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.3);
        }
        
        .ijaza-card-badge {
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
        
        .ijaza-card-body {
          padding: 1.5rem;
        }
        
        .ijaza-card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }
        
        .ijaza-sheikh {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: #e8b339;
          margin-bottom: 0.75rem;
        }
        
        .ijaza-description {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .ijaza-links {
          display: flex;
          gap: 0.75rem;
        }
        
        .youtube-indicator,
        .pdf-indicator {
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }
        
        .youtube-indicator {
          background: #ff000020;
          color: #ff0000;
        }
        
        .pdf-indicator {
          background: #dc262620;
          color: #dc2626;
        }
        
        .ijaza-card-footer {
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
        
        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
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
        
        .modal-sheikh {
          color: #e8b339;
          margin: 0.5rem 0 1rem;
        }
        
        .modal-body p {
          color: #4a5568;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        
        .modal-video {
          margin: 1rem 0;
        }
        
        .modal-video iframe {
          width: 100%;
          height: 315px;
          border-radius: 12px;
        }
        
        .btn-primary-modal {
          display: inline-block;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .ijazat-grid {
            grid-template-columns: 1fr;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .modal-video iframe {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

export default Ijaza;