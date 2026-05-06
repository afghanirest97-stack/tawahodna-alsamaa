import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaScroll, FaMicrophoneAlt, FaBook, FaUserTie, FaMosque, FaHeart, FaEye } from 'react-icons/fa';

function About() {
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDescription();
  }, []);

  async function fetchDescription() {
    try {
      const { data } = await supabase
        .from('site_description')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();
      
      if (data) setDescription(data);
    } catch (error) {
      console.error('Error fetching description:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const features = [
    { icon: <FaScroll />, title: 'أسانيد متصلة', description: 'نقدم الأسانيد المتصلة إلى رسول الله صلى الله عليه وسلم وإلى علماء الأمة' },
    { icon: <FaMicrophoneAlt />, title: 'مجالس سماع', description: 'تسجيلات لمجالس السماع المسندة والكتب المسموعة' },
    { icon: <FaBook />, title: 'مكتبة علمية', description: 'آلاف الكتب التراثية والعلمية بصيغة PDF' },
    { icon: <FaUserTie />, title: 'تراجم العلماء', description: 'سير أعلام الأمة عبر التاريخ مع توثيق المصادر' }
  ];

  return (
    <div className="about-page-modern">
      <div className="container">
        {/* Header Section */}
        <div className="page-header-modern">
          <div className="header-icon">
            <FaMosque />
          </div>
          <h1>كلمة تعريفية</h1>
          <p>تعريف بموقع توحدنا للسماع ورؤيتنا ورسالتنا</p>
        </div>

        {/* Hero Banner */}
        <div className="about-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h2>{description?.title || 'موقع توحدنا للسماع'}</h2>
            <p>{description?.content || 'موقع متخصص في نشر كتب الأحاديث والتراث الإسلامي بالسند المتصل'}</p>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="mission-vision-section">
          <div className="mission-card">
            <div className="card-icon">🎯</div>
            <h3>رسالتنا</h3>
            <p>{description?.mission || 'الحفاظ على الإسناد المتصل ونشر كتب التراث الإسلامي بأسانيدها المعتمدة، وتيسير الوصول إلى المصادر الأصلية للمسلمين.'}</p>
          </div>
          <div className="vision-card">
            <div className="card-icon">👁️</div>
            <h3>رؤيتنا</h3>
            <p>{description?.vision || 'أن نكون المرجع الأول في العالم الإسلامي للأسانيد المتصلة والسماع المسند، ونعمل على إحياء سنة الإجازة والسماع.'}</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="about-features-modern">
          <div className="section-header">
            <h2>ماذا نقدم؟</h2>
            <div className="header-decoration"></div>
          </div>
          <div className="features-grid-modern">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-modern">
                <div className="feature-icon-modern">
                  {feature.icon}
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">+1000</div>
            <div className="stat-label">كتاب علمي</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">+50</div>
            <div className="stat-label">عالماً</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">+200</div>
            <div className="stat-label">سند متصل</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">+30</div>
            <div className="stat-label">مجلس سماع</div>
          </div>
        </div>
      </div>

      <style>{`
        .about-page-modern {
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }
        
        .page-header-modern {
          text-align: center;
          margin: 2rem 0 3rem;
        }
        
        .header-icon {
          font-size: 3rem;
          color: #e8b339;
          margin-bottom: 1rem;
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
        
        .about-hero {
          position: relative;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 3rem;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(27,79,110,0.8), rgba(13,43,62,0.95));
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
          padding: 3rem;
          text-align: center;
          color: white;
        }
        
        .hero-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: white;
        }
        
        .hero-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto;
          opacity: 0.9;
        }
        
        .mission-vision-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .mission-card,
        .vision-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border-bottom: 3px solid #e8b339;
        }
        
        .mission-card:hover,
        .vision-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .card-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .mission-card h3,
        .vision-card h3 {
          font-size: 1.3rem;
          color: #1b4f6e;
          margin-bottom: 1rem;
        }
        
        .mission-card p,
        .vision-card p {
          color: #6c757d;
          line-height: 1.7;
        }
        
        .about-features-modern {
          margin-bottom: 3rem;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        
        .section-header h2 {
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
        
        .features-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .feature-card-modern {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .feature-card-modern:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon-modern {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.8rem;
          color: #e8b339;
        }
        
        .feature-card-modern h4 {
          font-size: 1.2rem;
          color: #1b4f6e;
          margin-bottom: 0.75rem;
        }
        
        .feature-card-modern p {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.6;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .stat-item {
          text-align: center;
          color: white;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: #e8b339;
        }
        
        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .mission-vision-section {
            grid-template-columns: 1fr;
          }
          
          .features-grid-modern {
            grid-template-columns: 1fr;
          }
          
          .stats-section {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .hero-content {
            padding: 2rem;
          }
          
          .hero-content h2 {
            font-size: 1.5rem;
          }
          
          .hero-content p {
            font-size: 0.95rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .page-header-modern h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default About;