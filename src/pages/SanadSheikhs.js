import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaBook, FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaUser, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .order('title', { ascending: true });
      
      if (data) {
        setBooks(data);
        setFilteredBooks(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
      setTotalItems(books.length);
    } else {
      const filtered = books.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBooks(filtered);
      setTotalItems(filtered.length);
    }
    setCurrentPage(1);
  }, [searchTerm, books]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
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
    <div className="books-page">
      <div className="container">
        <div className="page-header-modern">
          <h1>الكتب العلمية</h1>
          <p>مكتبة ضخمة من الكتب التراثية والعلمية</p>
        </div>

        <div className="search-section-modern">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث عن كتاب... (العنوان أو المؤلف)"
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
            تم العثور على {totalItems} كتاب
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">
            <FaBook />
            <p>لا توجد كتب مطابقة للبحث</p>
          </div>
        ) : (
          <>
            <div className="books-grid-modern">
              {currentItems.map(book => (
                <div key={book.id} className="book-card-modern">
                  <div className="book-card-header">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="book-card-image" />
                    ) : (
                      <div className="book-card-icon">
                        <FaBook />
                      </div>
                    )}
                    <div className="book-card-badge">📖 كتاب علمي</div>
                  </div>
                  <div className="book-card-body">
                    <h3>{book.title}</h3>
                    {book.author && (
                      <div className="book-author">
                        <FaUser /> {book.author}
                      </div>
                    )}
                    {book.description && (
                      <p className="book-description">
                        {book.description.length > 100 
                          ? book.description.substring(0, 100) + '...' 
                          : book.description}
                      </p>
                    )}
                    <div className="book-links">
                      {book.pdf_url && (
                        <a 
                          href={book.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="book-download-link"
                        >
                          <FaDownload /> تحميل PDF
                        </a>
                      )}
                      {book.link_url && !book.pdf_url && (
                        <a 
                          href={book.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="book-read-link"
                        >
                          <FaExternalLinkAlt /> قراءة مباشرة
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="book-card-footer">
                    <button 
                      className="btn-view-details"
                      onClick={() => setSelectedBook(book)}
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
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBook(null)}>×</button>
            <h2>{selectedBook.title}</h2>
            {selectedBook.author && (
              <div className="modal-author">
                <FaUser /> {selectedBook.author}
              </div>
            )}
            <div className="modal-body">
              <p>{selectedBook.description}</p>
            </div>
            <div className="modal-actions">
              {selectedBook.pdf_url && (
                <a href={selectedBook.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                  <FaDownload /> تحميل الكتاب
                </a>
              )}
              {selectedBook.link_url && !selectedBook.pdf_url && (
                <a href={selectedBook.link_url} target="_blank" rel="noopener noreferrer" className="btn-primary-modal">
                  <FaExternalLinkAlt /> قراءة الكتاب
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
        
        .books-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        
        .book-card-modern {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .book-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .book-card-header {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
        }
        
        .book-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .book-card-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.3);
        }
        
        .book-card-badge {
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
        
        .book-card-body {
          padding: 1.5rem;
        }
        
        .book-card-body h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .book-author {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #e8b339;
          margin-bottom: 0.75rem;
        }
        
        .book-description {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .book-links {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .book-download-link,
        .book-read-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          text-decoration: none;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }
        
        .book-download-link {
          background: #e8b339;
          color: #1b4f6e;
        }
        
        .book-download-link:hover {
          background: #d4a32a;
        }
        
        .book-read-link {
          background: #f8f9fa;
          color: #1b4f6e;
          border: 1px solid #e9ecef;
        }
        
        .book-read-link:hover {
          background: #e8b339;
          border-color: #e8b339;
        }
        
        .book-card-footer {
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
        
        .modal-author {
          color: #e8b339;
          margin: 0.5rem 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
          .books-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default Books;