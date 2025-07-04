import React, { useState, useEffect, useContext } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../../config/api';
import { UserContext } from '../Context/UserContext';
import { useTitle } from '../Context/TitleContext';

const TopNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { pageTitle } = useTitle();  // Get page title from context
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update the window width when the window is resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handler for toggling sidebar
  const handleToggleSidebar = () => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  // Handler for profile click
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  // Handler for dashboard navigation
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Modern responsive styles with improved visual hierarchy
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000080',
    background: 'linear-gradient(135deg, #000080 0%, #0066cc 100%)',
    color: 'white',
    padding: '0 1.5rem',
    height: '64px',
    width: '100%',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 2px 12px rgba(0, 0, 128, 0.15)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    height: '100%',
    padding: '0',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  };

  const logoStyle = {
    height: windowWidth <= 400 ? '32px' : '40px',
    width: 'auto',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  };

  // Modern title text styling with better typography
  const titleStyle = {
    fontSize: windowWidth <= 400 ? '16px' : windowWidth <= 768 ? '18px' : '22px',
    fontWeight: '700',
    margin: 0,
    display: windowWidth <= 576 ? 'none' : 'block',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: windowWidth <= 768 ? '150px' : '300px',
    lineHeight: '1.2',
    letterSpacing: '0.5px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const hamburgerStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    margin: '0 10px 0 0',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    height: '40px',
    width: '40px',
    position: 'relative',
    top: '0',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'scale(1.05)'
    },
    '&:active': {
      transform: 'scale(0.95)'
    }
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    height: '100%',
    padding: '8px 0',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  };

  // Modern user text container with improved styling
  const userTextStyle = {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    display: windowWidth <= 576 ? 'none' : 'flex',
    height: '100%',
    paddingRight: '8px',
    gap: '2px'
  };

  // Modern username text with better typography
  const userNameStyle = {
    margin: 0,
    fontSize: windowWidth <= 768 ? '13px' : '15px',
    fontWeight: '600',
    lineHeight: '1.3',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: windowWidth <= 768 ? '180px' : '220px',
    color: '#ffffff',
    letterSpacing: '0.3px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  };

  // Modern greeting text with subtle styling
  const userGreetingStyle = {
    margin: 0,
    fontSize: '11px',
    opacity: 0.85,
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    color: '#e6f3ff',
    fontWeight: '400',
    letterSpacing: '0.2px'
  };

  const profileStyle = {
    width: windowWidth <= 400 ? '36px' : '40px',
    height: windowWidth <= 400 ? '36px' : '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    '&:hover': {
      border: '2px solid #ffffff',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    },
    '&:active': {
      transform: 'scale(0.95)'
    }
  };

  // Truncate long titles
  const truncateTitle = (title, maxLength = 25) => {
    if (!title) return 'NuSmilePH';
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div style={navbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <button 
          onClick={handleToggleSidebar}
          style={hamburgerStyle}
          aria-label="Toggle Sidebar"
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <Menu size={24} />
        </button>
        
        <div 
          style={logoContainerStyle}
          onClick={navigateToDashboard}
          title="Go to Dashboard"
        >
          <img
            src="/NU_logo.png"
            alt="NU Logo"
            style={logoStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          <h1 style={titleStyle} title={pageTitle || 'NuSmilePH'}>
            {truncateTitle(pageTitle)}
          </h1>
        </div>
      </div>

      <div style={userInfoStyle}>
        <div style={userTextStyle}>
          <h3 style={userNameStyle} title={user?.username || 'User'}>
            {user?.username || 'User'}
          </h3>
          <p style={userGreetingStyle}>
            Welcome back!
          </p>
        </div>
        <img
          src={user?.profile ? API_ENDPOINTS.GET_USER_PROFILE_IMAGE(user.profile) : '/bencent.jpg'}
          alt="Profile"
          style={profileStyle}
          onClick={handleProfileClick}
          title="View Profile"
          onMouseEnter={(e) => {
            e.target.style.border = '2px solid #ffffff';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.border = '2px solid rgba(255, 255, 255, 0.8)';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseDown={(e) => {
            e.target.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
        />
      </div>
    </div>
  );
};

export default TopNavbar;