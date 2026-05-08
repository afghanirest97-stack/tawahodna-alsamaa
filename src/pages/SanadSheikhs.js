import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaFileAlt, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaChalkboardTeacher, FaGraduationCap, FaCalendarAlt, FaUserShield } from 'react-icons/fa';

function SanadSheikhs() {
  const [asaneed, setAsaneed] = useState([]);
  const [filteredAsaneed, setFilteredAsaneed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSanad, setSelectedSanad] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAsaneed();
  }, []);

  async function fetchAsaneed() {
    try {
      // جلب الأسانيد مع ربط جدول users لجلب اسم المستخدم
      const { data, count } = await supabase
        .from('asaneed')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (data) {
        console.log('تم جلب البيانات:', data);
        setAsaneed(data);
        setFilteredAsaneed(data);
        setTotalItems(data.length);
      } else {
        console.log('لا توجد بيانات');
        setAsaneed([]);
        setFilteredAsaneed([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching asaneed:', error);
      setAsaneed([]);
      setFilteredAsaneed([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAsaneed(asaneed);
      setTotalItems(asaneed.length);
    } else {
      const filtered = asaneed.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.sheikh_name && item.sheikh_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ijazah_for && item.ijazah_for.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAsaneed(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, asaneed]);

  const toggleReadMore = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAsaneed.slice(indexOfFirstItem, indexOfLastItem);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // دالة للحصول على اسم المشرف من البيانات المرتبطة
  const getAdminName = (sanad) => {
    // التحقق من وجود بيانات المستخدم المرتبطة
    if (sanad.users && sanad.users.name) {
      return sanad.users.name;
    }
    // إذا كان هناك اسم مباشر في حقل أخر
    if (sanad.admin_name) {
      return sanad.admin_name;
    }
    // في حالة عدم وجود اسم
    return 'غير معروف';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sanad-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>📜 أسانيد الشيوخ</h1>
          <p>الأسانيد المتصلة إلى علماء الأمة وإلى رسول الله صلى الله عليه وسلم</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث عن سند... (اسم السند، الشيخ المجيز، لمن الإجازة، أو الوصف)"
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
            📊 تم العثور على {totalItems} سند
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaFileAlt />
            <h3>لا توجد نتائج</h3>
            <p>لم يتم العثور على أسانيد مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="asaneed-grid-modern">
              {currentItems.map(sanad => {
                const isExpanded = expandedCards[sanad.id];
                const description = sanad.description || '';
                const shouldTruncate = description.length > 150;
                const displayDescription = isExpanded || !shouldTruncate 
                  ? description 
                  : description.substring(0, 150) + '...';
                
                return (
                  <div key={sanad.id} className="sanad-card-modern">
                    {/* صورة السند */}
                    {sanad.image_url ? (
                      <div className="sanad-card-image-wrapper">
                        <img 
                          src={sanad.image_url} 
                          alt={sanad.name} 
                          className="sanad-card-image"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'none';
                            e.target.parentElement.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="sanad-card-icon" style={{ display: 'none' }}>
                          <FaFileAlt />
                        </div>
                      </div>
                    ) : (
                      <div className="sanad-card-icon">
                        <FaFileAlt />
                      </div>
                    )}
                    
                    <div className="sanad-card-badge">
                      <FaGraduationCap /> سند متصل
                    </div>
                    
                    <div className="sanad-card-body">
                      {/* اسم السند */}
                      <h3>{sanad.name}</h3>
                      
                      {/* الشيخ المجيز */}
                      {sanad.sheikh_name && (
                        <div className="sanad-info-row">
                          <FaChalkboardTeacher className="info-icon" />
                          <span className="info-label">الشيخ المجيز:</span>
                          <span className="info-value">{sanad.sheikh_name}</span>
                        </div>
                      )}
                      
                      {/* لمن الإجازة */}
                      {sanad.ijazah_for && (
                        <div className="sanad-info-row">
                          <FaGraduationCap className="info-icon" />
                          <span className="info-label">لمن الإجازة:</span>
                          <span className="info-value">{sanad.ijazah_for}</span>
                        </div>
                      )}
                      
                      {/* الوصف */}
                      {description && (
                        <div className="sanad-description">
                          <p>{displayDescription}</p>
                          {shouldTruncate && (
                            <button 
                              className="read-more-btn"
                              onClick={() => toggleReadMore(sanad.id)}
                            >
                              {isExpanded ? 'عرض أقل' : 'اقرأ المزيد'}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* تاريخ الإضافة والمشرف */}
                      <div className="sanad-meta">
                        {sanad.created_at && (
                          <div className="meta-item">
                            <FaCalendarAlt className="meta-icon" />
                            <span>{formatDate(sanad.created_at)}</span>
                          </div>
                        )}
                        <div className="meta-item">
                          <FaUserShield className="meta-icon" />
                          <span>أضيف بواسطة: {getAdminName(sanad)}</span>
                        </div>
                      </div>
                      
                      {/* رابط الملف */}
                      {sanad.file_url && (
                        <a 
                          href={sanad.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="sanad-file-link"
                        >
                          <FaFileAlt /> تحميل السند أو الملف المرفق
                        </a>
                      )}
                    </div>
                    
                    <div className="sanad-card-footer">
                      <button 
                        className="btn-view-details"
                        onClick={() => setSelectedSanad(sanad)}
                      >
                        <FaEye /> عرض التفاصيل الكاملة
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Modal عرض التفاصيل */}
      {selectedSanad && (
        <div className="modal-overlay" onClick={() => setSelectedSanad(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSanad(null)}>×</button>
            
            {selectedSanad.image_url && (
              <div className="modal-image">
                <img src={selectedSanad.image_url} alt={selectedSanad.name} />
              </div>
            )}
            
            <h2>{selectedSanad.name}</h2>
            
            <div className="modal-info">
              {selectedSanad.sheikh_name && (
                <div className="modal-info-row">
                  <FaChalkboardTeacher />
                  <strong>الشيخ المجيز:</strong> {selectedSanad.sheikh_name}
                </div>
              )}
              
              {selectedSanad.ijazah_for && (
                <div className="modal-info-row">
                  <FaGraduationCap />
                  <strong>لمن الإجازة:</strong> {selectedSanad.ijazah_for}
                </div>
              )}
              
              {selectedSanad.created_at && (
                <div className="modal-info-row">
                  <FaCalendarAlt />
                  <strong>تاريخ الإضافة:</strong> {formatDate(selectedSanad.created_at)}
                </div>
              )}
              
              <div className="modal-info-row">
                <FaUserShield />
                <strong>أضيف بواسطة:</strong> {getAdminName(selectedSanad)}
              </div>
            </div>
            
            {selectedSanad.description && (
              <div className="modal-body">
                <h4>تفاصيل السند:</h4>
                <p>{selectedSanad.description}</p>
              </div>
            )}
            
            {selectedSanad.file_url && (
              <a 
                href={selectedSanad.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary-modal"
              >
                <FaFileAlt /> تحميل السند أو الملف المرفق
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        .sanad-page {
          background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
          min-height: 100vh;
          padding: 2rem 0;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .page-header-modern {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .page-header-modern h1 {
          font-size: 2.2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
        }
        
        .page-header-modern p {
          color: #6c757d;
          font-size: 1rem;
        }
        
        .search-section-modern {
          max-width: 650px;
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
          background: white;
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
          font-size: 1rem;
        }
        
        .results-count {
          text-align: center;
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }
        
        .asaneed-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .sanad-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .sanad-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
        }
        
        .sanad-card-image-wrapper {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          position: relative;
        }
        
        .sanad-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .sanad-card-modern:hover .sanad-card-image {
          transform: scale(1.05);
        }
        
        .sanad-card-icon {
          width: 100%;
          height: 150px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.2);
        }
        
        .sanad-card-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .sanad-card-body {
          padding: 1.5rem;
          flex: 1;
        }
        
        .sanad-card-body h3 {
          font-size: 1.25rem;
          color: #1b4f6e;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.4;
        }
        
        .sanad-info-row {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }
        
        .info-icon {
          color: #e8b339;
          font-size: 0.9rem;
          margin-top: 0.1rem;
          flex-shrink: 0;
        }
        
        .info-label {
          font-weight: 600;
          color: #1b4f6e;
          min-width: 90px;
        }
        
        .info-value {
          color: #495057;
          flex: 1;
        }
        
        .sanad-description {
          margin: 1rem 0;
          padding: 0.75rem 0;
          border-top: 1px solid #f0f2f5;
          border-bottom: 1px solid #f0f2f5;
        }
        
        .sanad-description p {
          color: #6c757d;
          font-size: 0.85rem;
          line-height: 1.6;
          margin: 0;
        }
        
        .read-more-btn {
          background: none;
          border: none;
          color: #e8b339;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .read-more-btn:hover {
          color: #d4a32a;
          text-decoration: underline;
        }
        
        .sanad-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 1rem 0;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: #6c757d;
        }
        
        .meta-icon {
          color: #e8b339;
          font-size: 0.7rem;
        }
        
        .sanad-file-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #e8b339;
          text-decoration: none;
          font-size: 0.85rem;
          padding: 0.5rem 0;
          transition: color 0.2s;
        }
        
        .sanad-file-link:hover {
          color: #d4a32a;
          text-decoration: underline;
        }
        
        .sanad-card-footer {
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid #e9ecef;
        }
        
        .btn-view-details {
          width: 100%;
          background: #f8f9fa;
          border: none;
          padding: 0.7rem;
          border-radius: 12px;
          color: #1b4f6e;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .btn-view-details:hover {
          background: #e8b339;
          color: white;
          transform: translateY(-2px);
        }
        
        .pagination-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
          padding: 2rem 0;
          flex-wrap: wrap;
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
          flex-wrap: wrap;
          justify-content: center;
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
          background: white;
          border-radius: 20px;
          margin: 2rem 0;
        }
        
        .no-results svg {
          font-size: 4rem;
          color: #dee2e6;
          margin-bottom: 1rem;
        }
        
        .no-results h3 {
          color: #495057;
          margin-bottom: 0.5rem;
        }
        
        .no-results p {
          color: #6c757d;
        }
        
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
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
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
          position: sticky;
          top: 1rem;
          left: 1rem;
          float: left;
          background: #f8f9fa;
          border: none;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          color: #495057;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem;
          z-index: 1;
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
          margin: 1rem 0;
          clear: both;
        }
        
        .modal-info {
          padding: 0 1.5rem;
          margin: 1rem 0;
        }
        
        .modal-info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          flex-wrap: wrap;
        }
        
        .modal-info-row svg {
          color: #e8b339;
        }
        
        .modal-body {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f2f5;
          border-bottom: 1px solid #f0f2f5;
        }
        
        .modal-body h4 {
          color: #1b4f6e;
          margin-bottom: 0.75rem;
        }
        
        .modal-body p {
          color: #495057;
          line-height: 1.6;
        }
        
        .btn-primary-modal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #e8b339;
          color: #1b4f6e;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          margin: 1.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .btn-primary-modal:hover {
          background: #d4a32a;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .sanad-page {
            padding: 1rem 0;
          }
          
          .page-header-modern h1 {
            font-size: 1.5rem;
          }
          
          .page-header-modern p {
            font-size: 0.85rem;
          }
          
          .asaneed-grid-modern {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .sanad-card-image-wrapper {
            height: 180px;
          }
          
          .sanad-card-body {
            padding: 1rem;
          }
          
          .sanad-card-body h3 {
            font-size: 1.1rem;
          }
          
          .sanad-info-row {
            font-size: 0.75rem;
          }
          
          .info-label {
            min-width: 70px;
          }
          
          .sanad-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .pagination-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
          }
          
          .modal-content {
            margin: 1rem;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .asaneed-grid-modern {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 1.5rem;
          }
        }
        
        @media (min-width: 1400px) {
          .asaneed-grid-modern {
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

export default SanadSheikhs;