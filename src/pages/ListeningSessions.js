import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaMicrophoneAlt, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaYoutube, FaDownload } from 'react-icons/fa';
import dayjs from 'dayjs';

function ListeningSessions() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const { data, count } = await supabase
        .from('listening_sessions')
        .select('*', { count: 'exact' })
        .order('session_date', { ascending: false });
      
      if (data) {
        setSessions(data);
        setFilteredSessions(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSessions(sessions);
      setTotalItems(sessions.length);
    } else {
      const filtered = sessions.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSessions(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, sessions]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
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

  const formatDate = (date) => {
    if (!date) return null;
    return dayjs(date).format('DD MMMM YYYY');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sessions-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>مجالس السماع</h1>
          <p>مجالس سماع مسجلة للكتب والمتون الإسلامية</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في مجالس السماع... (العنوان أو التفاصيل)"
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
            تم العثور على {totalItems} مجلس سماع
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaMicrophoneAlt />
            <p>لا توجد مجالس سماع مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="sessions-grid-modern">
              {currentItems.map(session => (
                <div key={session.id} className="session-card-modern">
                  <div className="session-card-header">
                    {session.image_url ? (
                      <img src={session.image_url} alt={session.title} className="session-card-image" />
                    ) : (
                      <div className="session-card-icon">
                        <FaMicrophoneAlt />
                      </div>
                    )}
                    <div className="session-card-badge">مجلس سماع</div>
                  </div>
                  <div className="session-card-body">
                    <h3>{session.title}</h3>
                    {session.session_date && (
                      <div className="session-date">
                        <FaCalendarAlt /> {formatDate(session.session_date)}
                      </div>
                    )}
                    {session.details && (
                      <p className="session-details">
                        {session.details.length > 100 
                          ? session.details.substring(0, 100) + '...' 
                          : session.details}
                      </p>
                    )}
                    <div className="session-links">
                      {session.youtube_url && (
                        <a 
                          href={session.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="session-youtube-link"
                        >
                          <FaYoutube /> مشاهدة التسجيل
                        </a>
                      )}
                      {session.file_url && (
                        <a 
                          href={session.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="session-file-link"
                        >
                          <FaDownload /> تحميل المرفقات
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="session-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedSession(session)}
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

      {/* Modal لعرض التفاصيل */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSession(null)}>×</button>
            <h2>{selectedSession.title}</h2>
            {selectedSession.session_date && (
              <div className="modal-date">
                <FaCalendarAlt /> {formatDate(selectedSession.session_date)}
              </div>
            )}
            <div className="modal-body">
              <p>{selectedSession.details}</p>
            </div>
            {selectedSession.youtube_url && (
              <div className="modal-video">
                <iframe
                  src={getYoutubeEmbedUrl(selectedSession.youtube_url)}
                  title={selectedSession.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="modal-actions">
              {selectedSession.youtube_url && (
                <a href={selectedSession.youtube_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                  <FaYoutube /> فتح على يوتيوب
                </a>
              )}
              {selectedSession.file_url && (
                <a href={selectedSession.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                  <FaDownload /> تحميل المرفقات
                </a>
              )}
            </div>
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
        
        .sessions-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .session-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .session-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .session-card-header {
          position: relative;
          height: 160px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .session-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .session-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.3);
        }
        
        .session-card-badge {
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
        
        .session-card-body {
          padding: 1.5rem;
        }
        
        .session-card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .session-date {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          background: #f8f9fa;
          padding: 0.2rem 0.8rem;
          border-radius: 50px;
          color: #e8b339;
          margin-bottom: 0.75rem;
        }
        
        .session-details {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .session-links {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .session-youtube-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ff0000;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          text-decoration: none;
          font-size: 0.75rem;
        }
        
        .session-file-link {
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
        
        .session-card-footer {
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
        
        .modal-date {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          background: #f8f9fa;
          padding: 0.3rem 1rem;
          border-radius: 50px;
          color: #e8b339;
          margin: 0.5rem 0 1rem;
        }
        
        .modal-video {
          margin: 1rem 0;
        }
        
        .modal-video iframe {
          width: 100%;
          height: 400px;
          border-radius: 16px;
        }
        
        .modal-body p {
          color: #4a5568;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        
        .modal-actions {
          margin-top: 1.5rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
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
        }
        
        .btn-primary-modal:hover {
          background: #d4a32a;
        }
        
        @media (max-width: 768px) {
          .sessions-grid-modern {
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

export default ListeningSessions;