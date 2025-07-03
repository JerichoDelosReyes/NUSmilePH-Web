import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [color, setColor] = useState('white');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // anchorStyle is no longer needed for logo/title
  const footerStyle = {
    display: 'flex',
    flexDirection: windowWidth <= 768 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: windowWidth <= 768 ? 'center' : 'center',
    backgroundColor: '#000080',
    color: 'white',
    padding: windowWidth <= 768 ? '1rem' : '1rem 2rem',
    width: '100%',
    boxSizing: 'border-box',
    gap: windowWidth <= 768 ? '16px' : '0',
  };

  const footerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const footerLeftTextStyle = {
    fontSize: windowWidth <= 480 ? '16px' : '18px',
    margin: 0,
  };

  const footerNavStyle = {
    display: 'flex',
    flexDirection: windowWidth <= 480 ? 'column' : 'row',
    gap: windowWidth <= 480 ? '10px' : '20px',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: windowWidth <= 768 ? '12px 0' : '0',
    textAlign: 'center',
  };

  const footerLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: windowWidth <= 480 ? '14px' : '16px',
  };

  const footerRightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: windowWidth <= 768 ? 'center' : 'flex-end',
  };

  const footerContactStyle = {
    fontSize: windowWidth <= 480 ? '12px' : '14px',
    textAlign: windowWidth <= 768 ? 'center' : 'right',
    margin: windowWidth <= 768 ? '4px 0' : '0',
  };

  return (
    <div style={footerStyle}>
      {/* Left: Logo + Title (not clickable) */}
      <div style={footerLeftStyle}>
        <img
          src="/NU_logo.png"
          alt="NU Logo"
          style={{ height: windowWidth <= 480 ? '30px' : '40px', width: 'auto' }}
        />
        <h4 style={footerLeftTextStyle}>NUSmilePH</h4>
      </div>

      {/* Right: Copyright and Contact */}
      <div style={footerRightStyle}>
        <p style={footerContactStyle}>© 2025 National University. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;