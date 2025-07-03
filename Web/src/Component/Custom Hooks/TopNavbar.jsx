import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_ENDPOINTS, { API_URL } from '../../config/api';
import { UserContext } from '../Context/UserContext';
import { useTitle } from '../Context/TitleContext';

const TopNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);
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

  // Responsive styles - improved text formatting and layout
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000080',
    color: 'white',
    padding: '0 1.5rem',
    height: '60px',
    width: '100%',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    height: '100%',
  };

  const logoStyle = {
    height: windowWidth <= 400 ? '28px' : '36px',
    width: 'auto',
  };

  // Improved title text styling
  const titleStyle = {
    fontSize: windowWidth <= 400 ? '16px' : windowWidth <= 768 ? '18px' : '20px',
    fontWeight: '600',
    margin: 0,
    display: windowWidth <= 576 ? 'none' : 'block',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: windowWidth <= 768 ? '150px' : '300px',
    lineHeight: '1.2'
  };

  const hamburgerStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    marginRight: '10px',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '100%',
  };

  // Improved user text container
  const userTextStyle = {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    display: windowWidth <= 576 ? 'none' : 'flex',
    height: '100%',
    paddingRight: '5px'
  };

  // Improved username text
  const userNameStyle = {
    margin: 0,
    fontSize: windowWidth <= 768 ? '12px' : '14px',
    fontWeight: '600',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px'
  };

  // Improved greeting text
  const userGreetingStyle = {
    margin: 0,
    fontSize: '10px',
    opacity: 0.8,
    lineHeight: '1.2',
    whiteSpace: 'nowrap'
  };

  const profileStyle = {
    width: windowWidth <= 400 ? '32px' : '36px',
    height: windowWidth <= 400 ? '32px' : '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #fff',
    cursor: 'pointer',
  };

  // Truncate long titles
  const truncateTitle = (title, maxLength = 25) => {
    if (!title) return 'NuSmilePH';
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div style={navbarStyle}>
      <div style={logoContainerStyle}>
        <button 
          onClick={handleToggleSidebar}
          style={hamburgerStyle}
          aria-label="Toggle Sidebar"
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
        />
      </div>
    </div>
  );
};

export default TopNavbar;