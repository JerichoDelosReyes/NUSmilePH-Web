import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';

const Header = () => {
  
  const [color, setColor] = useState('white');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const { user } = useContext(UserContext); // Use the UserContext
  const navigate = useNavigate();

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide auth message after 3 seconds
  useEffect(() => {
    if (showAuthMessage) {
      const timer = setTimeout(() => {
        setShowAuthMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAuthMessage]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Check if user is authenticated using UserContext
    const isAuthenticated = user && user.id; // Check if user exists and has an ID
    
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setShowAuthMessage(true);
    }
  };

  const anchorStyle = {
    color: color,
    textDecoration: 'none',
    cursor: 'pointer'
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: windowWidth <= 600 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#000080',
    color: 'white',
    padding: windowWidth <= 600 ? '1rem' : '1rem 2rem',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: '"Poppins", sans-serif',
    gap: windowWidth <= 600 ? '16px' : '0',
    position: 'relative', // For auth message positioning
  };

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const headerLeftTextStyle = {
    fontSize: windowWidth <= 480 ? '20px' : windowWidth <= 768 ? '22px' : '24px',
    margin: 0,
    textDecoration: 'none',
  };

  const loginLinkStyle = {
    backgroundColor: '#000080',
    color: 'white',
    padding: windowWidth <= 480 ? '6px 12px' : '8px 16px',
    borderRadius: '5px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: windowWidth <= 480 ? '36px' : '40px',
    textDecoration: 'none',
    fontSize: windowWidth <= 480 ? '14px' : '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const signupLinkStyle = {
    backgroundColor: '#F0C800',
    color: '#000',
    padding: windowWidth <= 480 ? '6px 12px' : '8px 16px',
    borderRadius: '5px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: windowWidth <= 480 ? '36px' : '40px',
    fontSize: windowWidth <= 480 ? '14px' : '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const authMessageStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    marginTop: '10px',
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    opacity: showAuthMessage ? '1' : '0',
    visibility: showAuthMessage ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={headerStyle}>
      {/* Left: Logo + Title */}
      <a
        style={anchorStyle} 
        onClick={handleLogoClick}
        onMouseOver={() => setColor('#7db0f0')}
        onMouseOut={() => setColor('white')}
      >
        <div style={headerLeftStyle}>
          <img
            src="/NU_logo.png"
            alt="NU Logo"
            style={{ height: windowWidth <= 480 ? '32px' : '40px', width: 'auto' }}
          />
          <h1 style={headerLeftTextStyle}>NUSmilePH</h1>
        </div>
      </a>

      {/* Right: Navigation based on user state */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: windowWidth <= 480 ? '8px' : '10px',
        marginTop: windowWidth <= 600 ? '10px' : '0'
      }}>
        

       
      </div>

      {/* Authentication message */}
      <div style={authMessageStyle}>
        Please log in to access the dashboard
      </div>
    </div>
  );
};

export default Header;  