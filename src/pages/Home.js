import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import HeroSection from '../components/common/HeroSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaMosque, FaScroll, FaMicrophoneAlt, FaUserGraduate } from 'react-icons/fa';

function Home() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function fetchHomeData() {
    try {
      const [heroRes, articlesRes, booksRes] = await Promise.all([
        supabase.from('hero_slides').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('books').select('*').order('created_at', { ascending: false }).limit(6)
      ]);
      
      if (heroRes.data) setHeroSlides(heroRes.data);
      if (articlesRes.data) setLatestArticles(articlesRes.data);
      if (booksRes.data) setLatestBooks(booksRes.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const features = [
    {
      icon: <FaScroll className="feature-icon" />,
      title: 'أسانيد متصلة',
      description: 'نقدم الأسانيد المتصلة إلى رسول الله صلى الله عليه وسلم وإلى علماء الأمة'
    },
    {
      icon: <FaMicrophoneAlt className="feature-icon" />,
      title: 'مجالس السماع',
      description: 'مجالس سماع مسجلة للكتب والمتون الإسلامية'
    },
    {
      icon: (
        <svg className="feature-icon" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 10c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40zm0 15c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5zm7 40h-14c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5h3v-10h-3c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5h7c2.5 0 4.5 2 4.5 4.5v14h3c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5z"/>
        </svg>
      ),
      title: 'تراجم العلماء',
      description: 'سير وتراجم علماء الأمة عبر التاريخ بكل هيبة وإجلال'
    },
    {
      icon: <FaMosque className="feature-icon" />,
      title: 'الكتب العلمية',
      description: 'مكتبة ضخمة من الكتب التراثية والعلمية'
    }
  ];

  return (
    <div className="home-page">
      <HeroSection slides={heroSlides} />
      
      <section className="welcome-section">
        <div className="container">
          <div className="welcome-card-custom">
            <div className="welcome-basmalah">
              <span>﷽</span>
            </div>
            <h2>بسم الله الرحمن الرحيم</h2>
            <div className="welcome-text-custom">
              <p>
                الحمد لله رب العالمين، والصلاة والسلام على أشرف الأنبياء والمرسلين، 
                سيدنا محمد وعلى آله وصحبه أجمعين. مرحباً بكم في موقع 
                <strong> "توحدنا للسماع" </strong> 
                المختص بنشر كتب الأحاديث والتراث الإسلامي بالسند المتصل.
              </p>
            </div>
            <Link to="/about" className="btn-read-more">
              اقرأ المزيد
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section-custom">
        <div className="container">
          <div className="section-header-custom">
            <h2>نبذة عن الموقع</h2>
            <div className="header-decoration"></div>
          </div>
          <div className="features-grid-custom">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-custom">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {latestArticles.length > 0 && (
        <section className="latest-section">
          <div className="container">
            <div className="section-header-custom">
              <h2>أحدث المقالات</h2>
              <div className="header-decoration"></div>
            </div>
            <div className="articles-grid-custom">
              {latestArticles.map(article => (
                <Link key={article.id} to={`/article/${article.id}`} className="article-card-custom">
                  {article.image_url && (
                    <div className="article-image">
                      <img src={article.image_url} alt={article.title} />
                    </div>
                  )}
                  <div className="article-content">
                    <h3>{article.title}</h3>
                    <p>{article.summary || article.content?.substring(0, 120)}...</p>
                    <span className="read-more">اقرأ المزيد ←</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="view-all">
              <Link to="/articles" className="btn-view-all">جميع المقالات</Link>
            </div>
          </div>
        </section>
      )}

      {latestBooks.length > 0 && (
        <section className="latest-section">
          <div className="container">
            <div className="section-header-custom">
              <h2>أحدث الكتب</h2>
              <div className="header-decoration"></div>
            </div>
            <div className="books-grid-custom">
              {latestBooks.slice(0, 4).map(book => (
                <Link key={book.id} to={book.pdf_url || book.link_url || '#'} className="book-card-custom" target={book.pdf_url ? '_blank' : '_self'}>
                  {book.image_url ? (
                    <img src={book.image_url} alt={book.title} className="book-cover" />
                  ) : (
                    <div className="book-cover-placeholder">
                      <FaMosque />
                    </div>
                  )}
                  <h4>{book.title}</h4>
                  {book.author && <p>{book.author}</p>}
                </Link>
              ))}
            </div>
            <div className="view-all">
              <Link to="/books" className="btn-view-all">جميع الكتب</Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        /* تنسيقات الصفحة الرئيسية الجديدة */
        .welcome-section {
          padding: 3rem 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%);
        }

        .welcome-card-custom {
          background: white;
          border-radius: 32px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(232, 179, 57, 0.2);
        }

        .welcome-basmalah {
          font-size: 2.5rem;
          color: #e8b339;
          margin-bottom: 0.5rem;
          font-family: 'Amiri', serif;
        }

        .welcome-card-custom h2 {
          font-size: 1.5rem;
          color: #1b4f6e;
          margin-bottom: 1.5rem;
        }

        .welcome-text-custom p {
          color: #4a5568;
          line-height: 1.9;
          font-size: 1.05rem;
          margin-bottom: 1.5rem;
        }

        .welcome-text-custom strong {
          color: #e8b339;
        }

        .btn-read-more {
          display: inline-block;
          background: transparent;
          border: 2px solid #e8b339;
          color: #e8b339;
          padding: 0.6rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-read-more:hover {
          background: #e8b339;
          color: #1b4f6e;
          transform: translateY(-2px);
        }

        .features-section-custom {
          padding: 4rem 0;
          background: white;
        }

        .section-header-custom {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header-custom h2 {
          font-size: 2rem;
          color: #1b4f6e;
          margin-bottom: 0.75rem;
        }

        .header-decoration {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #e8b339, #c99a1a);
          margin: 0 auto;
          border-radius: 3px;
        }

        .features-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card-custom {
          text-align: center;
          padding: 2rem 1.5rem;
          background: #f8f9fa;
          border-radius: 24px;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .feature-card-custom:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.1);
          border-color: #e8b339;
        }

        .feature-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-card-custom:hover .feature-icon-wrapper {
          background: linear-gradient(135deg, #e8b339, #c99a1a);
        }

        .feature-icon {
          font-size: 2.5rem;
          color: white;
        }

        .feature-card-custom h3 {
          font-size: 1.3rem;
          color: #1b4f6e;
          margin-bottom: 0.75rem;
        }

        .feature-card-custom p {
          color: #6c757d;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .latest-section {
          padding: 4rem 0;
          background: #f8f9fa;
        }

        .articles-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .article-card-custom {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .article-card-custom:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
        }

        .article-image {
          height: 200px;
          overflow: hidden;
        }

        .article-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .article-card-custom:hover .article-image img {
          transform: scale(1.05);
        }

        .article-content {
          padding: 1.5rem;
        }

        .article-content h3 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.75rem;
        }

        .article-content p {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .read-more {
          color: #e8b339;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .books-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .book-card-custom {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .book-card-custom:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
        }

        .book-cover {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        .book-cover-placeholder {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .book-cover-placeholder svg {
          font-size: 3rem;
          color: #e8b339;
        }

        .book-card-custom h4 {
          font-size: 0.95rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .book-card-custom p {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .view-all {
          text-align: center;
          margin-top: 2.5rem;
        }

        .btn-view-all {
          display: inline-block;
          background: #1b4f6e;
          color: white;
          padding: 0.7rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-view-all:hover {
          background: #e8b339;
          color: #1b4f6e;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .welcome-card-custom {
            padding: 1.5rem;
          }
          
          .section-header-custom h2 {
            font-size: 1.6rem;
          }
          
          .features-grid-custom {
            gap: 1rem;
          }
          
          .books-grid-custom {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

export default Home;