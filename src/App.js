import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Articles from './pages/Articles';
import SanadSheikhs from './pages/SanadSheikhs';
import ListeningSessions from './pages/ListeningSessions';
import StudySanad from './pages/StudySanad';
import Scholars from './pages/Scholars';
import Books from './pages/Books';
import Benefits from './pages/Benefits';
import Contact from './pages/Contact';
import ImportantLinks from './pages/ImportantLinks';
import Ijaza from './pages/Ijaza';  // إضافة استيراد صفحة الإجازات
import Login from './pages/Login';
import AdminPanel from './pages/Admin/AdminPanel';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="islamic-pattern"></div>
        <div className="loading-content">
          <h1>موقع توحدنا للسماع</h1>
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/asaneed" element={<SanadSheikhs />} />
            <Route path="/listening-sessions" element={<ListeningSessions />} />
            <Route path="/study-sanad" element={<StudySanad />} />
            <Route path="/scholars" element={<Scholars />} />
            <Route path="/books" element={<Books />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/links" element={<ImportantLinks />} />
            <Route path="/ijaza" element={<Ijaza />} />  {/* إضافة مسار الإجازات */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/*" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;