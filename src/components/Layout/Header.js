import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
    { path: '/ijaza', label: 'الإجازات' },
    { path: '/membership', label: 'تسجيل العضوية' },
    { path: '/contact', label: 'تواصل معنا' },
    { path: '/links', label: 'روابط مهمة' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {!imgError ? (
              <img 
                src="/tawqan_alsamaa_website_logo.png"
                alt="توحدنا للسماع" 
                className="logo-img"
                onError={() => setImgError(true)}
                style={{ 
                  height: '55px', 
                  width: 'auto',
                  display: 'block'
                }}
              />
            ) : (
              <span className="logo-text">
                توحدنا <span>للسماع</span>
              </span>
            )}
          </Link>
        </div>
        
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <nav className={`nav-menu ${isOpen ? 'open' : ''}`}>
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              onClick={() => setIsOpen(false)}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
          
          {user ? (
            <div className="user-menu">
              <Link to="/admin" className="user-profile">
                <FaUser />
                <span>{user.name || user.email?.split('@')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="تسجيل الخروج">
                <FaSignOutAlt /> خروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link" onClick={() => setIsOpen(false)}>
              تسجيل الدخول
            </Link>
          )}
        </nav>
      </div>

      <style>{`
        .header {
          background: linear-gradient(135deg, #0d2b3e 0%, #1b4f6e 100%);
          padding: 0.75rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        
        .logo {
          flex-shrink: 0;
        }
        
        .logo-img {
          height: 55px;
          width: auto;
          transition: all 0.3s ease;
        }
        
        .logo-img:hover {
          transform: scale(1.03);
        }
        
        .logo-text {
          font-family: 'Amiri', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: white;
        }
        
        .logo-text span {
          color: #e8b339;
        }
        
        .nav-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
          padding: 0.5rem;
        }
        
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        
        .nav-menu a {
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .nav-menu a:hover,
        .nav-menu a.active {
          color: #e8b339;
          background: rgba(255,255,255,0.1);
        }
        
        .login-link {
          background: rgba(232, 179, 57, 0.15);
          border: 1px solid #e8b339;
        }
        
        .login-link:hover {
          background: #e8b339;
          color: #0d2b3e !important;
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
          .header-container {
            padding: 0 1rem;
            flex-wrap: wrap;
          }
          
          .nav-toggle {
            display: block;
          }
          
          .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1b4f6e;
            flex-direction: column;
            padding: 1rem;
            gap: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            border-radius: 0 0 20px 20px;
            z-index: 999;
          }
          
          .nav-menu.open {
            display: flex;
          }
          
          .nav-menu a {
            width: 100%;
            text-align: center;
            padding: 0.75rem;
            font-size: 1rem;
            color: white !important;
            background: transparent;
          }
          
          .nav-menu a:hover,
          .nav-menu a.active {
            background: rgba(232, 179, 57, 0.2);
            color: #e8b339 !important;
          }
          
          .login-link {
            border: 1px solid #e8b339;
            margin-top: 0.25rem;
          }
          
          .logo-img {
            height: 45px;
          }
          
          .logo-text {
            font-size: 1.2rem;
          }
          
          .user-menu {
            border-right: none;
            border-top: 1px solid rgba(255,255,255,0.2);
            margin-right: 0;
            padding-right: 0;
            padding-top: 0.75rem;
            margin-top: 0.5rem;
            justify-content: center;
            width: 100%;
            flex-direction: column;
          }
          
          .user-profile {
            width: 100%;
            justify-content: center;
          }
          
          .logout-btn {
            width: 100%;
            justify-content: center;
            margin-top: 0.25rem;
          }
        }
        
        @media (max-width: 480px) {
          .logo-img {
            height: 40px;
          }
          
          .logo-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;