import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaNewspaper, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const { data, count } = await supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (data) {
        setArticles(data);
        setFilteredArticles(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArticles(articles);
      setTotalItems(articles.length);
    } else {
      const filtered = articles.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredArticles(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, articles]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="articles-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>المقالات</h1>
          <p>مقالات ودراسات علمية في الحديث والتراث</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في المقالات... (العنوان أو المحتوى)"
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
            تم العثور على {totalItems} مقال
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaNewspaper />
            <p>لا توجد مقالات مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="articles-grid-modern">
              {currentItems.map(article => (
                <div key={article.id} className="article-card-modern">
                  <div className="article-card-header">
                    {article.image_url ? (
                      <img src={article.image_url} alt={article.title} className="article-card-image" />
                    ) : (
                      <div className="article-card-icon">
                        <FaNewspaper />
                      </div>
                    )}
                    <div className="article-card-badge">مقال</div>
                  </div>
                  <div className="article-card-body">
                    <div className="article-date">
                      <FaCalendarAlt /> {formatDate(article.created_at)}
                    </div>
                    <h3>{article.title}</h3>
                    {article.summary && (
                      <p className="article-summary">
                        {article.summary.length > 100 
                          ? article.summary.substring(0, 100) + '...' 
                          : article.summary}
                      </p>
                    )}
                    {!article.summary && article.content && (
                      <p className="article-summary">
                        {article.content.length > 100 
                          ? article.content.substring(0, 100) + '...' 
                          : article.content}
                      </p>
                    )}
                  </div>
                  <div className="article-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <FaEye /> قراءة المقال
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

      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArticle(null)}>×</button>
            <h2>{selectedArticle.title}</h2>
            <div className="article-meta-modal">
              <FaCalendarAlt /> {formatDate(selectedArticle.created_at)}
            </div>
            <div className="modal-body">
              <p>{selectedArticle.content}</p>
            </div>
            {selectedArticle.file_url && (
              <a href={selectedArticle.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                تحميل المقال PDF
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
        
        .articles-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .article-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .article-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .article-card-header {
          position: relative;
          height: 180px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .article-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .article-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.3);
        }
        
        .article-card-badge {
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
        
        .article-card-body {
          padding: 1.5rem;
        }
        
        .article-date {
          font-size: 0.75rem;
          color: #adb5bd;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .article-card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        
        .article-summary {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .article-card-footer {
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
        
        .article-meta-modal {
          color: #adb5bd;
          font-size: 0.85rem;
          margin: 0.5rem 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        
        .modal-body p {
          color: #4a5568;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        
        .btn-primary-modal {
          display: inline-block;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
          .articles-grid-modern {
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

export default Articles;