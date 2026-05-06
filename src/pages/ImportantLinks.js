import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaLink, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaTag } from 'react-icons/fa';

function ImportantLinks() {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLink, setSelectedLink] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const { data, count } = await supabase
        .from('important_links')
        .select('*', { count: 'exact' })
        .order('category', { ascending: true });
      
      if (data) {
        setLinks(data);
        setFilteredLinks(data);
        setTotalItems(data.length);
        const uniqueCategories = [...new Set(data.map(l => l.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let filtered = links;
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredLinks(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, links]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLinks.slice(indexOfFirstItem, indexOfLastItem);
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

  // استخراج اسم النطاق من الرابط
  const getDomainName = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  // اختصار الرابط
  const shortenUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="links-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>روابط مهمة</h1>
          <p>روابط مفيدة لمواقع وقنوات ومكتبات إسلامية</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في الروابط... (العنوان أو الوصف)"
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
            تم العثور على {totalItems} رابط
          </div>
        </div>

        {categories.length > 0 && (
          <div className="categories-filter">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              جميع الروابط
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={selectedCategory === cat ? 'active' : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                <FaTag /> {cat}
              </button>
            ))}
          </div>
        )}

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaLink />
            <p>لا توجد روابط مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="links-grid-modern">
              {currentItems.map(link => (
                <div key={link.id} className="link-card-modern">
                  <div className="link-card-header">
                    {link.image_url ? (
                      <img src={link.image_url} alt={link.title} className="link-card-image" />
                    ) : (
                      <div className="link-card-icon">
                        <FaLink />
                      </div>
                    )}
                    <div className="link-card-badge">{link.category || 'رابط مفيد'}</div>
                  </div>
                  <div className="link-card-body">
                    <h3>{link.title}</h3>
                    {link.description && (
                      <p className="link-description">
                        {link.description.length > 100 
                          ? link.description.substring(0, 100) + '...' 
                          : link.description}
                      </p>
                    )}
                    <div className="link-url-preview">
                      <FaExternalLinkAlt />
                      <span>{getDomainName(link.url)}</span>
                    </div>
                  </div>
                  <div className="link-card-footer">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-visit-link"
                    >
                      <FaExternalLinkAlt /> زيارة الرابط
                    </a>
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedLink(link)}
                    >
                      <FaEye /> تفاصيل
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
      {selectedLink && (
        <div className="modal-overlay" onClick={() => setSelectedLink(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedLink(null)}>×</button>
            <h2>{selectedLink.title}</h2>
            {selectedLink.category && (
              <div className="modal-category">
                <FaTag /> {selectedLink.category}
              </div>
            )}
            {selectedLink.description && (
              <div className="modal-body">
                <p>{selectedLink.description}</p>
              </div>
            )}
            <div className="modal-url">
              <strong>الرابط:</strong>
              <a href={selectedLink.url} target="_blank" rel="noopener noreferrer">
                {shortenUrl(selectedLink.url, 60)}
              </a>
            </div>
            <div className="modal-actions">
              <a href={selectedLink.url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                <FaExternalLinkAlt /> فتح الرابط
              </a>
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
        
        .categories-filter {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        
        .categories-filter button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.2rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Cairo', sans-serif;
          font-size: 0.85rem;
        }
        
        .categories-filter button.active,
        .categories-filter button:hover {
          background: #e8b339;
          border-color: #e8b339;
          color: #1b4f6e;
        }
        
        .links-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .link-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .link-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .link-card-header {
          position: relative;
          height: 140px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .link-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .link-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: rgba(255,255,255,0.3);
        }
        
        .link-card-badge {
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
        
        .link-card-body {
          padding: 1.5rem;
        }
        
        .link-card-body h3 {
          font-size: 1.1rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .link-description {
          color: #6c757d;
          font-size: 0.85rem;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }
        
        .link-url-preview {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          background: #f8f9fa;
          padding: 0.2rem 0.8rem;
          border-radius: 50px;
          color: #e8b339;
        }
        
        .link-card-footer {
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 0.75rem;
        }
        
        .btn-visit-link {
          flex: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-visit-link:hover {
          background: #d4a32a;
        }
        
        .btn-view-details {
          flex: 1;
          background: #f8f9fa;
          border: none;
          padding: 0.5rem;
          border-radius: 50px;
          color: #1b4f6e;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.8rem;
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
          max-width: 500px;
          width: 90%;
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
        
        .modal-category {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          background: #f8f9fa;
          padding: 0.3rem 1rem;
          border-radius: 50px;
          color: #e8b339;
          margin: 0.5rem 0 1rem;
        }
        
        .modal-body p {
          color: #4a5568;
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        
        .modal-url {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 12px;
          margin: 1rem 0;
          word-break: break-all;
        }
        
        .modal-url strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #1b4f6e;
        }
        
        .modal-url a {
          color: #e8b339;
          text-decoration: none;
          font-size: 0.85rem;
        }
        
        .modal-url a:hover {
          text-decoration: underline;
        }
        
        .modal-actions {
          margin-top: 1rem;
        }
        
        .btn-primary-modal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.75rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-primary-modal:hover {
          background: #d4a32a;
        }
        
        @media (max-width: 768px) {
          .links-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .categories-filter {
            gap: 0.5rem;
          }
          
          .categories-filter button {
            padding: 0.35rem 1rem;
            font-size: 0.75rem;
          }
          
          .link-card-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default ImportantLinks;