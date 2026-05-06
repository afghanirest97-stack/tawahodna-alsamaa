import React, { useState, useEffect } from 'react';

function HeroSection({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="hero-section" style={{ position: 'relative', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', backgroundColor: '#1e3a5f' }}>
        <div className="hero-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)' }}></div>
        <div className="hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '800px', padding: '3rem' }}>
          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem' }}>موقع توحدنا للسماع</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>نشر كتب الأحاديث والتراث الإسلامي بالسند المتصل</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="hero-section" style={{ position: 'relative', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white' }}>
      <div className="hero-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${slide.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <div className="hero-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)' }}></div>
      <div className="hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '800px', padding: '3rem' }}>
        <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem' }}>{slide.title}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{slide.description}</p>
        {slide.link_url && (
          <a href={slide.link_url} className="btn btn-secondary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'transparent', color: 'white', border: '2px solid white', borderRadius: '30px', textDecoration: 'none', transition: 'all 0.3s ease' }}>اقرأ المزيد</a>
        )}
      </div>
    </div>
  );
}

export default HeroSection;