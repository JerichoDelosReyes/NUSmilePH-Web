import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const NavigationContext = createContext();

// Custom hook to use the navigation context
export const useNavigation = () => useContext(NavigationContext);

// Provider component - simplified for overlay sidebar behavior
export const NavigationProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Not really used in overlay mode
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Default to hidden

  // Handle window resize - just to detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar - simple show/hide
  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  // Values to provide in context
  const contextValue = {
    isCollapsed,
    setIsCollapsed,
    isMobile,
    sidebarVisible,
    setSidebarVisible,
    toggleSidebar,
    closeSidebar
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;