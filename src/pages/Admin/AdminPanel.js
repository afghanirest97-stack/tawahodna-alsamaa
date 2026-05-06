import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AddSanad from './AddSanad';
import AddScholar from './AddScholar';
import ManageArticles from './ManageArticles';
import ManageContact from './ManageContact';
import ManageHero from './ManageHero';
import ManageBooks from './ManageBooks';
import ManageSessions from './ManageSessions';
import ManageBenefits from './ManageBenefits';
import ManageIjaza from './ManageIjaza';
import ManageLinks from './ManageLinks';
import ManageUsers from './ManageUsers';
import { 
  FaHome, FaBook, FaUsers, FaEnvelope, 
  FaImage, FaLink, FaChalkboardTeacher, 
  FaMicrophoneAlt, FaGraduationCap, FaCertificate,
  FaSignOutAlt, FaChartLine, FaNewspaper, FaDatabase,
  FaUserTie, FaUserGraduate, FaMosque, FaScroll,
  FaGem, FaShieldAlt, FaBell, FaCog
} from 'react-icons/fa';
import { MdDashboard, MdAnalytics } from 'react-icons/md';

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();

  useEffect(() => {
    checkUser();
    fetchNotifications();
  }, []);

  async function checkUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setLoading(false);
  }

  async function fetchNotifications() {
    try {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      setNotifications(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'الرئيسية';
    if (path === '/admin/hero') return 'إدارة الهيرو';
    if (path === '/admin/asaneed') return 'إدارة الأسانيد';
    if (path === '/admin/scholars') return 'إدارة العلماء';
    if (path === '/admin/articles') return 'إدارة المقالات';
    if (path === '/admin/books') return 'إدارة الكتب';
    if (path === '/admin/sessions') return 'مجالس السماع';
    if (path === '/admin/benefits') return 'الفوائد العلمية';
    if (path === '/admin/ijaza') return 'الإجازات';
    if (path === '/admin/links') return 'الروابط المهمة';
    if (path === '/admin/contact') return 'إدارة التواصل';
    if (path === '/admin/users') return 'إدارة المستخدمين';
    return 'لوحة التحكم';
  };

  const menuItems = [
    { path: '/admin', label: 'الرئيسية', icon: MdDashboard, color: '#e8b339' },
    { path: '/admin/hero', label: 'إدارة الهيرو', icon: FaImage, color: '#1b4f6e' },
    { path: '/admin/asaneed', label: 'إدارة الأسانيد', icon: FaLink, color: '#7c3aed' },
    { path: '/admin/scholars', label: 'إدارة العلماء', icon: FaUserTie, color: '#2d6a4f' },
    { path: '/admin/articles', label: 'إدارة المقالات', icon: FaNewspaper, color: '#e8b339' },
    { path: '/admin/books', label: 'إدارة الكتب', icon: FaBook, color: '#1b4f6e' },
    { path: '/admin/sessions', label: 'مجالس السماع', icon: FaMicrophoneAlt, color: '#ea580c' },
    { path: '/admin/benefits', label: 'الفوائد العلمية', icon: FaGraduationCap, color: '#0891b2' },
    { path: '/admin/ijaza', label: 'الإجازات', icon: FaCertificate, color: '#c2410c' },
    { path: '/admin/links', label: 'الروابط المهمة', icon: FaLink, color: '#4f46e5' },
    { path: '/admin/contact', label: 'إدارة التواصل', icon: FaEnvelope, color: '#dc2626' },
  ];

  if (user?.role === 'super_admin') {
    menuItems.push({ path: '/admin/users', label: 'إدارة المستخدمين', icon: FaUsers, color: '#9333ea' });
  }

  return (
    <div className="admin-panel-premium">
      {/* Sidebar */}
      <aside className="admin-sidebar-premium">
        <div className="sidebar-header">
          <div className="logo-premium">
            <FaGem />
            <span>توحدنا</span>
          </div>
        </div>
        
        <div className="user-profile-premium">
          <div className="user-avatar-premium">
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-info">
            <h4>{user?.name || user?.email?.split('@')[0]}</h4>
            <span className="user-role">
              {user?.role === 'super_admin' ? 'مدير عام' : 'مشرف'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon" style={{ color: item.color }}>
                <item.icon />
              </span>
              <span className="nav-label">{item.label}</span>
              {item.label === 'إدارة التواصل' && notifications > 0 && (
                <span className="nav-badge">{notifications}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn-premium" onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}>
            <FaSignOutAlt />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-premium">
        <header className="admin-header-premium">
          <div className="header-left">
            <h1>{getPageTitle()}</h1>
            <div className="breadcrumb-premium">
              <Link to="/admin">لوحة التحكم</Link>
              <span>/</span>
              <span>{getPageTitle()}</span>
            </div>
          </div>
          <div className="header-right">
            <button className="notifications-btn">
              <FaBell />
              {notifications > 0 && <span className="notification-dot">{notifications}</span>}
            </button>
            <button className="settings-btn">
              <FaCog />
            </button>
          </div>
        </header>

        <div className="admin-content-premium">
          <Routes>
            <Route path="/" element={<AdminDashboard user={user} notifications={notifications} />} />
            <Route path="/hero" element={<ManageHero />} />
            <Route path="/asaneed" element={<AddSanad />} />
            <Route path="/scholars" element={<AddScholar />} />
            <Route path="/articles" element={<ManageArticles />} />
            <Route path="/books" element={<ManageBooks />} />
            <Route path="/sessions" element={<ManageSessions />} />
            <Route path="/benefits" element={<ManageBenefits />} />
            <Route path="/ijaza" element={<ManageIjaza />} />
            <Route path="/links" element={<ManageLinks />} />
            <Route path="/contact" element={<ManageContact />} />
            {user?.role === 'super_admin' && (
              <Route path="/users" element={<ManageUsers />} />
            )}
          </Routes>
        </div>
      </main>

      <style>{`
        /* Premium Admin Panel Styles */
        .admin-panel-premium {
          display: flex;
          min-height: 100vh;
          background: #f0f2f5;
        }

        /* Sidebar Premium */
        .admin-sidebar-premium {
          width: 280px;
          background: linear-gradient(180deg, #0d2b3e 0%, #1b4f6e 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .logo-premium {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.3rem;
          font-weight: 700;
          color: #e8b339;
        }

        .logo-premium span {
          color: white;
        }

        .user-profile-premium {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .user-avatar-premium {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #e8b339, #c99a1a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1b4f6e;
        }

        .user-info h4 {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .user-role {
          font-size: 0.7rem;
          color: #e8b339;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(232, 179, 57, 0.1);
          color: white;
        }

        .nav-item.active {
          background: rgba(232, 179, 57, 0.15);
          color: #e8b339;
          border-right: 3px solid #e8b339;
        }

        .nav-icon {
          width: 24px;
          font-size: 1.1rem;
        }

        .nav-label {
          flex: 1;
          font-size: 0.9rem;
        }

        .nav-badge {
          background: #dc2626;
          color: white;
          font-size: 0.7rem;
          padding: 0.15rem 0.5rem;
          border-radius: 50px;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .logout-btn-premium {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: rgba(220, 38, 38, 0.2);
          border: none;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Cairo', sans-serif;
        }

        .logout-btn-premium:hover {
          background: #dc2626;
          color: white;
        }

        /* Main Content Premium */
        .admin-main-premium {
          flex: 1;
          margin-right: 280px;
        }

        .admin-header-premium {
          background: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 99;
        }

        .header-left h1 {
          font-size: 1.3rem;
          color: #1b4f6e;
          margin-bottom: 0.25rem;
        }

        .breadcrumb-premium {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .breadcrumb-premium a {
          color: #e8b339;
          text-decoration: none;
        }

        .header-right {
          display: flex;
          gap: 0.75rem;
        }

        .notifications-btn,
        .settings-btn {
          background: #f8f9fa;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          color: #1b4f6e;
          transition: all 0.2s ease;
        }

        .notifications-btn:hover,
        .settings-btn:hover {
          background: #e8b339;
          color: white;
        }

        .notification-dot {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc2626;
          color: white;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 50px;
        }

        .admin-content-premium {
          padding: 2rem;
        }

        /* Loading Screen */
        .loading-screen-premium {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0d2b3e, #1b4f6e);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .spinner-premium {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(232,179,57,0.3);
          border-top-color: #e8b339;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-sidebar-premium {
            transform: translateX(100%);
            position: fixed;
            transition: transform 0.3s ease;
          }
          
          .admin-sidebar-premium.open {
            transform: translateX(0);
          }
          
          .admin-main-premium {
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen-premium">
      <div className="loading-content">
        <div className="spinner-premium"></div>
        <h3>جاري تحميل لوحة التحكم...</h3>
      </div>
    </div>
  );
}

function AdminDashboard({ user, notifications }) {
  const [stats, setStats] = useState({
    articles: 0,
    books: 0,
    scholars: 0,
    messages: 0,
    asaneed: 0,
    sessions: 0,
    benefits: 0,
    links: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const [
      articlesRes, booksRes, scholarsRes, 
      messagesRes, asaneedRes, sessionsRes,
      benefitsRes, linksRes
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('scholars').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('asaneed').select('*', { count: 'exact', head: true }),
      supabase.from('listening_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('benefits').select('*', { count: 'exact', head: true }),
      supabase.from('important_links').select('*', { count: 'exact', head: true })
    ]);

    setStats({
      articles: articlesRes.count || 0,
      books: booksRes.count || 0,
      scholars: scholarsRes.count || 0,
      messages: messagesRes.count || 0,
      asaneed: asaneedRes.count || 0,
      sessions: sessionsRes.count || 0,
      benefits: benefitsRes.count || 0,
      links: linksRes.count || 0
    });
  }

  const statCards = [
    { icon: <FaNewspaper />, label: 'المقالات', value: stats.articles, color: '#e8b339', bg: '#e8b33910' },
    { icon: <FaBook />, label: 'الكتب', value: stats.books, color: '#1b4f6e', bg: '#1b4f6e10' },
    { icon: <FaUserTie />, label: 'العلماء', value: stats.scholars, color: '#2d6a4f', bg: '#2d6a4f10' },
    { icon: <FaEnvelope />, label: 'رسائل جديدة', value: stats.messages, color: '#dc2626', bg: '#dc262610' },
    { icon: <FaLink />, label: 'الأسانيد', value: stats.asaneed, color: '#7c3aed', bg: '#7c3aed10' },
    { icon: <FaMicrophoneAlt />, label: 'مجالس السماع', value: stats.sessions, color: '#ea580c', bg: '#ea580c10' },
    { icon: <FaGraduationCap />, label: 'الفوائد', value: stats.benefits, color: '#0891b2', bg: '#0891b210' },
    { icon: <FaLink />, label: 'الروابط', value: stats.links, color: '#4f46e5', bg: '#4f46e510' }
  ];

  const quickActions = [
    { label: 'مقال جديد', path: '/admin/articles', icon: <FaNewspaper />, color: '#e8b339' },
    { label: 'كتاب جديد', path: '/admin/books', icon: <FaBook />, color: '#1b4f6e' },
    { label: 'عالم جديد', path: '/admin/scholars', icon: <FaUserTie />, color: '#2d6a4f' },
    { label: 'سند جديد', path: '/admin/asaneed', icon: <FaLink />, color: '#7c3aed' },
    { label: 'مجلس سماع', path: '/admin/sessions', icon: <FaMicrophoneAlt />, color: '#ea580c' },
    { label: 'فائدة جديدة', path: '/admin/benefits', icon: <FaGraduationCap />, color: '#0891b2' }
  ];

  return (
    <div className="dashboard-premium">
      {/* Welcome Banner */}
      <div className="welcome-banner-premium">
        <div className="banner-content">
          <h2>مرحباً {user?.name || user?.email?.split('@')[0]}</h2>
          <p>إليك ملخص سريع لإحصائيات الموقع اليوم</p>
        </div>
        <div className="banner-date">
          {new Date().toLocaleDateString('ar', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-premium">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card-premium" style={{ background: stat.bg }}>
            <div className="stat-icon-premium" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-premium">
        <div className="section-header">
          <h3><FaChartLine /> إجراءات سريعة</h3>
          <span className="section-subtitle">أضف محتوى جديد بنقرة واحدة</span>
        </div>
        <div className="actions-grid-premium">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path} className="action-card-premium">
              <span className="action-icon" style={{ background: action.color }}>
                {action.icon}
              </span>
              <span className="action-text">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-premium {
          animation: fadeInUp 0.5s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .welcome-banner-premium {
          background: linear-gradient(135deg, #1b4f6e, #0d2b3e);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          color: white;
        }
        
        .banner-content h2 {
          font-size: 1.3rem;
          margin-bottom: 0.25rem;
        }
        
        .banner-content p {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        
        .banner-date {
          background: rgba(255,255,255,0.15);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
        }
        
        .stats-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        
        .stat-card-premium {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
        }
        
        .stat-card-premium:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border-color: transparent;
        }
        
        .stat-icon-premium {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1b4f6e;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }
        
        .quick-actions-premium {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          margin-top: 1rem;
        }
        
        .section-header {
          margin-bottom: 1.25rem;
        }
        
        .section-header h3 {
          font-size: 1.1rem;
          color: #1b4f6e;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        
        .section-subtitle {
          font-size: 0.8rem;
          color: #6c757d;
        }
        
        .actions-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .action-card-premium {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .action-card-premium:hover {
          transform: translateX(-5px);
          background: #e8b339;
        }
        
        .action-card-premium:hover .action-text {
          color: white;
        }
        
        .action-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          color: white;
        }
        
        .action-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #1b4f6e;
        }
        
        @media (max-width: 768px) {
          .stats-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .actions-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid-premium {
            grid-template-columns: 1fr;
          }
          
          .actions-grid-premium {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;