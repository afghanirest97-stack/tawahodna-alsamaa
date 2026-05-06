import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

function IslamicCard({ title, description, imageUrl, icon, link, date, type, isExternal }) {
  dayjs.locale('ar');

  const content = (
    <>
      {imageUrl && <img src={imageUrl} alt={title} className="card-image" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
      {icon && <div className="card-icon" style={{ fontSize: '3rem', textAlign: 'center', padding: '1rem' }}>{icon}</div>}
      <div className="card-content" style={{ padding: '1.5rem' }}>
        <h3 className="card-title" style={{ color: '#1e3a5f', marginBottom: '0.75rem', fontSize: '1.25rem' }}>{title}</h3>
        {description && <p className="card-description" style={{ color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>{description}</p>}
        {date && (
          <div className="card-meta" style={{ fontSize: '0.85rem', color: '#999' }}>
            <span>{dayjs(date).format('DD MMMM YYYY')}</span>
          </div>
        )}
        {type === 'book' && (
          <div className="card-meta" style={{ fontSize: '0.85rem', color: '#999' }}>
            <span>📖 كتاب</span>
          </div>
        )}
      </div>
    </>
  );

  if (isExternal && link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="islamic-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'white', borderRadius: '15px', overflow: 'hidden', transition: 'transform 0.3s ease', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        {content}
      </a>
    );
  }

  if (link) {
    return (
      <Link to={link} className="islamic-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'white', borderRadius: '15px', overflow: 'hidden', transition: 'transform 0.3s ease', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        {content}
      </Link>
    );
  }

  return <div className="islamic-card" style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>{content}</div>;
}

export default IslamicCard;