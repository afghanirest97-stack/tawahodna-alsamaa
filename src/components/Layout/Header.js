import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/about', label: 'كلمة تعريفية' },
    { path: '/articles', label: 'المقالات' },
    { path: '/asaneed', label: 'أسانيد الشيوخ' },
    { path: '/listening-sessions', label: 'مجالس السماع' },
    { path: '/study-sanad', label: 'دراسة الأسانيد' },
    { path: '/scholars', label: 'تراجم العلماء' },
    { path: '/books', label: 'الكتب العلمية' },
    { path: '/benefits', label: 'فوائد علمية' },
    { path: '/contact', label: 'تواصل معنا' },
    { path: '/links', label: 'روابط مهمة' },
  ];

  // قائمة بأسماء الملفات المحتملة للشعار
  const logoPaths = [
    '/tawqan_alsamae_website_logo.png',
    '/tawqan_alsamaa_website_logo.png',
    '/logo192.png',
    '/logo512.png'
  ];

  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  const handleLogoError = () => {
    if (currentLogoIndex < logoPaths.length - 1) {
      setCurrentLogoIndex(currentLogoIndex + 1);
    } else {
      setLogoError(true);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            {!logoError && (
              <img 
                src={logoPaths[currentLogoIndex]}
                alt="توحدنا للسماع" 
                className="logo-img"
                onError={handleLogoError}
                style={{ 
                  height: '70px', 
                  width: 'auto',
                  filter: 'none'  // إزالة الفلتر الأبيض
                }}
              />
            )}
            <span className="logo-text" style={{ display: logoError ? 'block' : 'none' }}>
              توحدنا <span>للسماع</span>
            </span>
          </Link>
        </div>
        
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <nav className={`nav-menu ${isOpen ? 'open' : ''}`}>
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path} onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          ))}
          
          {user && (
            <div className="user-menu">
              <Link to="/admin" className="user-profile">
                <FaUser />
                <span>{user.name || user.email?.split('@')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="تسجيل الخروج">
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </nav>
      </div>

      <style>{`
        .logo {
          display: flex;
          align-items: center;
        }
        
        .logo-img {
          height: 70px;
          width: auto;
          transition: all 0.3s ease;
          /* إزالة filter brightness invert */
        }
        
        .logo-img:hover {
          transform: scale(1.03);
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-right: 1rem;
          padding-right: 1rem;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(232, 179, 57, 0.15);
          padding: 0.4rem 1rem;
          border-radius: 50px;
          color: #e8b339 !important;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .user-profile:hover {
          background: rgba(232, 179, 57, 0.25);
          transform: translateY(-2px);
        }
        
        .logout-btn {
          background: rgba(220, 38, 38, 0.15);
          border: none;
          color: #ef4444;
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        .logout-btn:hover {
          background: #dc2626;
          color: white;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .logo-img {
            height: 50px;
          }
          
          .user-menu {
            border-right: none;
            border-top: 1px solid rgba(255,255,255,0.2);
            margin-right: 0;
            padding-right: 0;
            padding-top: 0.75rem;
            margin-top: 0.5rem;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .logo-img {
            height: 40px;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;