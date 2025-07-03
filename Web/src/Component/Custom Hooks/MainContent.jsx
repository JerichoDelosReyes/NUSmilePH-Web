import React, { useEffect } from 'react'
import TopNavbar from './TopNavbar'
import SideBar from './SideBar'
import Footer from './Footer'
import { useNavigation } from './NavigationProvider'
import { Outlet } from 'react-router'

const MainContent = () => {
    const { isCollapsed, isMobile, sidebarVisible, toggleSidebar, closeSidebar } = useNavigation();
  
    // Main content always takes full width with no margin adjustments
    const mainContentStyle = {
        width: "100%", 
        transition: "all 0.3s ease",
        paddingTop: "60px", // Room for the navbar
    };
    
    // Add ESC key handler to close sidebar
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && sidebarVisible) {
                closeSidebar();
            }
        };
        
        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [sidebarVisible, closeSidebar]);
    
    return (
        <div className="dashboard-container">
            <TopNavbar toggleSidebar={toggleSidebar} />
            
            {/* Floating overlay sidebar - Pass closeSidebar function */}
            <SideBar
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                sidebarVisible={sidebarVisible}
                closeSidebar={closeSidebar}
            />
            
            {/* Remove duplicate overlay - only use the one in SideBar component */}
            
            {/* Main content - always full width */}
            <main style={mainContentStyle}>
                <div className="content-wrapper">
                    <Outlet/>
                </div>
            </main>
            
            <Footer />
        </div>
    )
}

export default MainContent