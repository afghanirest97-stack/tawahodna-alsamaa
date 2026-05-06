import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTelegram, FaFacebook, FaTwitter, FaEnvelope, FaPhone, FaSignInAlt } from 'react-icons/fa';

function Footer() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>عن توحدنا</h4>
            <p>موقع متخصص في نشر كتب الأحاديث والتراث الإسلامي بالسند المتصل إلى رسول الله صلى الله عليه وسلم.</p>
          </div>
          
          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <Link to="/about">كلمة تعريفية</Link>
            <Link to="/articles">المقالات</Link>
            <Link to="/scholars">تراجم العلماء</Link>
            <Link to="/contact">تواصل معنا</Link>
          </div>
          
          <div className="footer-col">
            <h4>خدماتنا</h4>
            <Link to="/asaneed">أسانيد الشيوخ</Link>
            <Link to="/books">الكتب العلمية</Link>
            <Link to="/benefits">فوائد علمية</Link>
            <Link to="/listening-sessions">مجالس السماع</Link>
          </div>
          
          <div className="footer-col">
            <h4>تواصل معنا</h4>
            <a href="mailto:info@tawahudna.com"><FaEnvelope /> info@tawahudna.com</a>
            <a href="tel:+966XXXXXXXXX"><FaPhone /> +966 XXXXXXX</a>
            
            {/* زر تسجيل الدخول - يظهر فقط إذا لم يكن هناك مستخدم مسجل */}
            {!user && (
              <Link to="/login" className="login-footer-link">
                <FaSignInAlt /> تسجيل الدخول
              </Link>
            )}
            
            {/* رابط لوحة التحكم - يظهر إذا كان هناك مستخدم مسجل */}
            {user && (
              <Link to="/admin" className="admin-footer-link">
                <FaSignInAlt /> لوحة التحكم
              </Link>
            )}
            
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer"><FaTelegram /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} موقع توحدنا للسماع</p>
        </div>
      </div>

      <style>{`
        .login-footer-link,
        .admin-footer-link {
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(232, 179, 57, 0.15);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          margin-bottom: 0.75rem;
        }
        
        .login-footer-link:hover,
        .admin-footer-link:hover {
          background: rgba(232, 179, 57, 0.25);
          color: #e8b339;
        }
      `}</style>
    </footer>
  );
}

export default Footer;