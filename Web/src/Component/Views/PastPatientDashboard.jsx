import React, { useState } from 'react';
import TopNavbar from '../Custom Hooks/TopNavbar';
import SideBar from '../Custom Hooks/SideBar';
import { NavigationProvider, useNavigation } from '../Custom Hooks/NavigationProvider';
import {
  Link, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import TitleHead from '../Custom Hooks/TitleHead';
import '../Views/Styles/PastPatientDashboard.css';
import Footer from '../Custom Hooks/Footer';

// Sample data for past patients
const pastPatients = [
  {
    id: 1,
    firstname: 'Steven',
    middlename: '',
    lastname: 'Sulayao',
    avatar: '/bencent.jpg',
    detailsLink: '/patient/1',
  },
  {
    id: 2,
    firstname: 'Spencer',
    middlename: '',
    lastname: 'Madia',
    avatar: '/bencent.jpg',
    detailsLink: '/patient/2',
  },
];

// Create a wrapper component to use navigation context
const DashboardContent = () => {
  const { isCollapsed, isMobile, sidebarVisible, toggleSidebar, closeSidebar } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');

  TitleHead('Past Patient');

  // Filter patients based on search term
  const filteredPatients = pastPatients.filter(patient => {
    const fullName = `${patient.firstname} ${patient.middlename || ''} ${patient.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <TopNavbar toggleSidebar={toggleSidebar} />
      
      {/* Page content wrapper - contains both sidebar and main content */}
      <div className="page-content-wrapper">
        {/* Sidebar */}
        <SideBar 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          sidebarVisible={sidebarVisible}
        />
        
        {/* Overlay to close sidebar on mobile */}
        <div 
          className={`sidebar-overlay ${isMobile && sidebarVisible ? 'active' : ''}`} 
          onClick={closeSidebar}
        ></div>
        
        {/* Main Content Area */}
        <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
          <div className="content-wrapper">
            <div className="pcontainer">
              <div className="pheader">
                <div className="pheader-left">
                  <img src="/user.png" alt="User Icon" className="header-logo" />
                  <h1>Past Patient</h1>
                </div>
                <div className="search-group">
                  <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24">
                    <g>
                      <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                    </g>
                  </svg>
                  <input 
                    placeholder="Search patients..." 
                    type="search" 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Responsive Table to Display Past Patients */}
              <div className="table-responsive">
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', mt: 3 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#4040DD' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Avatar</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <TableRow key={patient.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                            <TableCell>
                              <img
                                src={patient.avatar}
                                alt={`${patient.firstname}`}
                                className="patient-avatar"
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500 }}>
                              {patient.firstname} {patient.middlename} {patient.lastname}
                            </TableCell>
                            <TableCell>
                              <div className="actions-cell">
                                <Link href={patient.detailsLink}>
                                  <span className="action-link">
                                    View Patient Details
                                  </span>
                                </Link>
                                <Link>
                                  <span className="action-link">
                                    Set Appointments
                                  </span>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ color: '#000000', fontWeight: 500 }}>
                            No past patients found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const PastPatientDashboard = () => {
  return (
    <NavigationProvider>
      <DashboardContent />
    </NavigationProvider>
  );
};

export default PastPatientDashboard;