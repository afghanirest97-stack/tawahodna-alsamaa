import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaLightbulb, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaTag } from 'react-icons/fa';

function Benefits() {
  const [benefits, setBenefits] = useState([]);
  const [filteredBenefits, setFilteredBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchBenefits();
  }, []);

  async function fetchBenefits() {
    try {
      const { data, count } = await supabase
        .from('benefits')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (data) {
        setBenefits(data);
        setFilteredBenefits(data);
        setTotalItems(data.length);
        const uniqueCategories = [...new Set(data.map(b => b.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching benefits:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let filtered = benefits;
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredBenefits(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, benefits]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBenefits.slice(indexOfFirstItem, indexOfLastItem);
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
    <div className="benefits-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>فوائد علمية</h1>
          <p>فوائد ودراسات مختارة من التراث الإسلامي</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث في الفوائد العلمية... (العنوان أو المحتوى)"
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
            تم العثور على {totalItems} فائدة
          </div>
        </div>

        {categories.length > 0 && (
          <div className="categories-filter">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              الكل
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
            <FaLightbulb />
            <p>لا توجد فوائد مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="benefits-grid-modern">
              {currentItems.map(benefit => (
                <div key={benefit.id} className="benefit-card-modern">
                  <div className="benefit-card-header">
                    {benefit.image_url ? (
                      <img src={benefit.image_url} alt={benefit.title} className="benefit-card-image" />
                    ) : (
                      <div className="benefit-card-icon">
                        <FaLightbulb />
                      </div>
                    )}
                    <div className="benefit-card-badge">فائدة علمية</div>
                  </div>
                  <div className="benefit-card-body">
                    <h3>{benefit.title}</h3>
                    {benefit.category && (
                      <div className="benefit-category">
                        <FaTag /> {benefit.category}
                      </div>
                    )}
                    {benefit.content && (
                      <p className="benefit-content">
                        {benefit.content.length > 100 
                          ? benefit.content.substring(0, 100) + '...' 
                          : benefit.content}
                      </p>
                    )}
                    {benefit.youtube_url && (
                      <a 
                        href={benefit.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="benefit-youtube-link"
                      >
                        🎬 مشاهدة على يوتيوب
                      </a>
                    )}
                  </div>
                  <div className="benefit-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedBenefit(benefit)}
                    >
                      <FaEye /> قراءة الفائدة
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
      {selectedBenefit && (
        <div className="modal-overlay" onClick={() => setSelectedBenefit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBenefit(null)}>×</button>
            <h2>{selectedBenefit.title}</h2>
            {selectedBenefit.category && (
              <div className="modal-category">
                <FaTag /> {selectedBenefit.category}
              </div>
            )}
            <div className="modal-body">
              <p>{selectedBenefit.content}</p>
            </div>
            {selectedBenefit.youtube_url && (
              <a href={selectedBenefit.youtube_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                🎬 مشاهدة على يوتيوب
              </a>
            )}
            {selectedBenefit.file_url && (
              <a href={selectedBenefit.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal" style={{ marginTop: '0.5rem' }}>
                📄 تحميل المرفق
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
        
        .benefits-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .benefit-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .benefit-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .benefit-card-header {
          position: relative;
          height: 160px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .benefit-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .benefit-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.3);
        }
        
        .benefit-card-badge {
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
        
        .benefit-card-body {
          padding: 1.5rem;
        }
        
        .benefit-card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .benefit-category {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          background: #f8f9fa;
          padding: 0.2rem 0.8rem;
          border-radius: 50px;
          color: #e8b339;
          margin-bottom: 0.75rem;
        }
        
        .benefit-content {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .benefit-youtube-link {
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
        
        .benefit-card-footer {
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
          white-space: pre-wrap;
        }
        
        .btn-primary-modal {
          display: inline-block;
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
          .benefits-grid-modern {
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
        }
      `}</style>
    </div>
  );
}

export default Benefits;