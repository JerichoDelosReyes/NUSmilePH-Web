import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import TopNavbar from '../Custom Hooks/TopNavbar';
import SideBar from '../Custom Hooks/SideBar';
import { NavigationProvider, useNavigation } from '../Custom Hooks/NavigationProvider';
import TitleHead from '../Custom Hooks/TitleHead';
import dayjs from 'dayjs';
import { message, Modal } from 'antd';
import { DateCalendar, DayCalendarSkeleton, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { FiArrowLeft } from 'react-icons/fi';
import Footer from '../Custom Hooks/Footer';
// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, isToday, isPast } from 'date-fns';
import axios from 'axios';
import { UserContext } from '../Context/UserContext';
import {
  Avatar, Badge, Box, Button, Card, CardContent,
  Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, Paper, Tab, Tabs, Typography,
  ButtonGroup, Tooltip, IconButton
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NoteIcon from '@mui/icons-material/Note';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import '../Views/Styles/AppointmentList.css';
import { useNavigate } from 'react-router';
import FullCalendarHeader from '../Custom Hooks/FullCalendarHeader';
import { API_URL } from '../../config/api';

// Appointment Status Component
const AppointmentStatus = ({ date }) => {
  const status = isToday(new Date(date)) ? 'today' :
    isPast(new Date(date)) ? 'missed' : 'upcoming';

  const statusText = isToday(new Date(date)) ? 'Today' :
    isPast(new Date(date)) ? 'Missed' : 'Upcoming';

  return (
    <Typography
      variant="caption"
      className={`status-chip ${status}`}
    >
      {statusText}
    </Typography>
  );
};


// Updated Appointment Item Component to match the image exactly
const AppointmentItem = ({ appointment, onClick }) => {
  // Determine if appointment is missed, today, or upcoming
  const status = isToday(new Date(appointment.date)) ? 'today' :
    isPast(new Date(appointment.date)) ? 'missed' : 'upcoming';

  // Get the appropriate status text
  const statusText = status === 'missed' ? 'MISSED' :
    status === 'today' ? 'TODAY' : 'UPCOMING';

  // Get the appropriate color
  const statusColor = status === 'missed' ? '#ff5252' :
    status === 'today' ? '#4caf50' : '#2196f3';

  // Use Media Query for responsive design
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  return (
    <Box className="appointment-item" onClick={onClick}>
      <Grid container alignItems="center" spacing={isSmallScreen ? 1 : 2}>
        <Grid item>
          {/* Avatar circle with patient initial */}
          <Avatar
            sx={{
              bgcolor: status === 'missed' ? '#ff5252' : status === 'today' ? '#4caf50' : '#2196f3',
              width: isSmallScreen ? 32 : 40,
              height: isSmallScreen ? 32 : 40,
              fontSize: isSmallScreen ? '14px' : '18px'
            }}
          >
            {appointment.firstname?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        </Grid>
        <Grid item xs>
          {/* Patient name */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              fontSize: isSmallScreen ? '14px' : '15px',
              mb: 0.5,
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}
          >
            {appointment.firstname} {appointment.middlename} {appointment.lastname}
          </Typography>
          {/* Date and time with icons - Responsive layout */}
          <Box display="flex" alignItems="center" flexWrap={isSmallScreen ? 'wrap' : 'nowrap'} gap={isSmallScreen ? 1 : 2}>
            <Box display="flex" alignItems="center">
              <EventIcon color="action" sx={{ fontSize: isSmallScreen ? 14 : 16, mr: 0.5, opacity: 0.7 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: isSmallScreen ? '11px' : '13px' }}>
                {format(new Date(appointment.date), isSmallScreen ? 'MM/dd/yy' : 'MMM dd, yyyy')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <AccessTimeIcon color="action" sx={{ fontSize: isSmallScreen ? 14 : 16, mr: 0.5, opacity: 0.7 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: isSmallScreen ? '11px' : '13px' }}>
                {appointment.time}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item>
          {/* Status label */}
          <Typography
            variant="caption"
            sx={{
              color: statusColor,
              fontWeight: 600,
              fontSize: isSmallScreen ? '10px' : '12px'
            }}
          >
            {statusText}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};



const CalendarNavigation = ({ onNavigate, currentDate }) => {
  // Use the passed currentDate prop instead of new Date()
  const displayDate = currentDate || new Date();
  const currentMonth = displayDate.toLocaleString('default', { month: 'long' });
  const currentYear = displayDate.getFullYear();

  // Use Media Query for responsive design
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  return (
    <>
      {/* Month title display */}
      <Typography
        variant="h6"
        className="calendar-month-title"
        sx={{
          fontSize: isSmallScreen ? '0.9rem' : '1rem',
          paddingTop: isSmallScreen ? '5px' : '12px'
        }}
      >
        {isSmallScreen ? `${currentMonth.substring(0, 3)} ${currentYear}` : `${currentMonth} ${currentYear}`}
      </Typography>

      {/* Navigation buttons */}
      <div className="mini-nav-buttons">
        <button className="mini-nav-button left" onClick={() => onNavigate('PREV')}>
          <ChevronLeftIcon sx={{ fontSize: isSmallScreen ? '1rem' : '1.2rem' }} />
        </button>
        <button className="mini-nav-button right" onClick={() => onNavigate('NEXT')}>
          <ChevronRightIcon sx={{ fontSize: isSmallScreen ? '1rem' : '1.2rem' }} />
        </button>
      </div>
    </>
  );
};

// Create a wrapper component to use navigation context
const AppointmentList = () => {
  const { isCollapsed, isMobile, sidebarVisible, toggleSidebar, closeSidebar } = useNavigation();
  TitleHead('Appointment List');
  const { user = {}, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [appointmentList, setAppointmentList] = useState([]);
  const [appointmentDay, setAppointmentDay] = useState([]);
  const [modalOpen, setModalOpen] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForScheduling, setSelectedDateForScheduling] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const calendarRef = useRef(null);
  const mobileScreen = useMediaQuery('(max-width:768px)');
  const tabletScreen = useMediaQuery('(max-width:1024px)');
  const smallScreen = useMediaQuery('(max-width:600px)');
  const mediumScreen = useMediaQuery('(max-width:960px)');

  const getAppointments = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      const res = await axios.get(`${API_URL}/clinician/${user.id}/patient/get/appointments`);
      setAppointmentList(res.data.appointments || []);
      setAppointmentDay((res.data.appointments || []).map(appointment => appointment.date));
    } catch (err) {
      console.log(err);
      message.error(err.message || 'Failed to fetch appointments');
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user?.id) {
      getAppointments();
    }
  }, [loading, user, getAppointments]);

  const checkDeadline = (date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isPast(date)) {
      return 'Missed';
    } else {
      return 'Upcoming';
    }
  };

  // Handle navigation for mini calendar
  const handleCalendarNavigate = (action) => {
    const newDate = new Date(currentDate);
    if (action === 'PREV') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (action === 'NEXT') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (action === 'TODAY') {
      newDate.setMonth(new Date().getMonth());
      newDate.setFullYear(new Date().getFullYear());
    }
    setCurrentDate(newDate);

    // Update FullCalendar if available
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (action === 'PREV') {
        calendarApi.prev();
      } else if (action === 'NEXT') {
        calendarApi.next();
      } else if (action === 'TODAY') {
        calendarApi.today();
      }
    }
  };

  const EmptyState = ({ message }) => (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: smallScreen ? '20px 10px' : '40px 16px',
      textAlign: 'center',
      color: '#718096'
    }}>
      <EventIcon sx={{ fontSize: smallScreen ? 36 : 48, opacity: 0.6, mb: 2 }} />
      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: smallScreen ? '0.9rem' : '1rem' }}>{message}</Typography>
      <Typography variant="body2" sx={{ mt: 1, fontSize: smallScreen ? '0.8rem' : '0.875rem' }}>
        No appointments to display at this time.
      </Typography>
    </Box>
  );

  const handleOpenSelected = (appointment) => {
    setSelectedAppointment(appointmentList);
  };

  const handleCloseSelected = () => {
    setSelectedAppointment(null);
  };

  const handleModalOpen = (id) => {
    const appointment = appointmentList.find(app => app._id === id);
    setSelectedAppointment(appointment);
    setModalOpen(id);
  };

  const handleModalClose = () => {
    setModalOpen(null);
    setSelectedAppointment(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle view change for FullCalendar
  const handleViewChange = (view) => {
    let fullCalendarView = 'dayGridMonth';

    switch (view) {
      case 'month':
        fullCalendarView = 'dayGridMonth';
        break;
      case 'week':
        fullCalendarView = 'timeGridWeek';
        break;
      case 'day':
        fullCalendarView = 'timeGridDay';
        break;
      default:
        fullCalendarView = 'dayGridMonth';
    }

    setViewMode(fullCalendarView);

    // Update FullCalendar if available
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(fullCalendarView);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/clinician/patient/delete/appointment/${id}`, { withCredentials: true });
      message.success(res.data.message || 'Appointment cancelled successfully');
      setModalOpen(false);
      getAppointments();
    } catch (err) {
      console.log(err);
      message.error(err.message || 'Something went wrong!');
    }
  };

  const updateAppointment = (id) => {
    navigate(`/setAppointments/${id}`);
  };

  const appointmentDates = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const selected = !outsideCurrentMonth && appointmentDay.includes(day.toISOString().split('T')[0]);

    return (
      <Badge
        overlap="circular"
        color="primary"
        variant={selected ? "dot" : "standard"}
        invisible={!selected}
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  };

  // Filter appointments based on tab
  const filteredAppointments = (appointmentList || []).filter(appointment => {
    if (tabValue === 0) return true; // All appointments
    if (tabValue === 1) return isToday(new Date(appointment.date)); // Today
    if (tabValue === 2) return !isPast(new Date(appointment.date)) && !isToday(new Date(appointment.date)); // Upcoming
    if (tabValue === 3) return isPast(new Date(appointment.date)) && !isToday(new Date(appointment.date)); // Past
    return true;
  });

  // Format appointments for FullCalendar with safe time parsing
  const calendarEvents = (appointmentList || []).map((appointment) => {
    // Determine event background color based on status
    let backgroundColor = '#4040dd'; // Default color for upcoming
    let borderColor = '#4040dd';

    if (isToday(new Date(appointment.date))) {
      backgroundColor = '#28a745'; // Green for today
      borderColor = '#28a745';
    } else if (isPast(new Date(appointment.date))) {
      backgroundColor = '#e26161'; // Red for missed
      borderColor = '#e26161';
    }

    // Safe time parsing
    const startDate = new Date(appointment.date);
    let endDate = new Date(appointment.date);

    if (appointment.time) {
      try {
        const timeParts = appointment.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          let hour = parseInt(timeParts[1]);
          const minute = parseInt(timeParts[2]);
          const isPM = /pm/i.test(timeParts[3]);

          // Convert to 24-hour format
          if (isPM && hour < 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;

          startDate.setHours(hour, minute, 0);
          endDate = new Date(startDate);
          endDate.setHours(startDate.getHours() + 1); // Assuming 1-hour appointments
        }
      } catch (error) {
        console.error("Error parsing time:", error);
      }
    }

    return {
      id: appointment._id,
      title: `${appointment.firstname} ${appointment.lastname}`,
      start: startDate,
      end: endDate,
      backgroundColor,
      borderColor,
      textColor: '#ffffff',
      extendedProps: {
        appointmentData: appointment
      }
    };
  });

  // Calculate calendar height based on screen size
  const getCalendarHeight = () => {
    if (smallScreen) return '400px';
    if (mobileScreen) return '450px';
    if (tabletScreen) return '500px';
    return '560px';
  };

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    
    if (selectedDate < today) {
      setShowErrorModal(true);
    } else {
      setSelectedDateForScheduling(date.toISOString().split('T')[0]);
      setShowScheduleModal(true);
    }
  };

  const handleScheduleAppointment = () => {
    setShowScheduleModal(false);
    navigate(`/setAppointments?date=${selectedDateForScheduling}`);
  };

  return (
      <div className="pcontainer">
        {/* Header Section */}
        <div className="pheader">
          <div className="pheader-left">
            <h1>Appointment Management</h1>
          </div>
          <div className="pheader-right">
            <Button 
              variant="contained" 
              color="primary"
              startIcon={!smallScreen && <AddIcon />}
              onClick={() => navigate('/setAppointments')}
              fullWidth={smallScreen}
              size={smallScreen ? "small" : "medium"}
            >
              {smallScreen ? "New" : "New Appointment"}
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <button
            className="btn btn-outline-secondary btn-sm compact-back-btn"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft size={16} />
            <span className="ms-1">Back</span>
          </button>
        </div>

              {/* Main Content Grid - Improved Layout */}
              <div className="app-layout">
                {/* Mini Calendar and Appointment List in a side-by-side layout */}
                <div className="top-row">
                  {/* Mini Calendar Card */}
                  <div className="mini-calendar-section">
                    <Paper elevation={0} className="paper-container">
                      <Box p={smallScreen ? 1.5 : 2} display="flex" justifyContent="space-between" alignItems="center" flexWrap={smallScreen ? "wrap" : "nowrap"}>
                        <div className={smallScreen ? "w-100 mb-2" : ""}>
                          <Typography variant="h6" className="section-title">
                            Mini Calendar
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: smallScreen ? '0.75rem' : 'inherit' }}>
                            Select a date to view appointments
                          </Typography>
                        </div>
                        <Button
                          variant="outlined"
                          size={smallScreen ? "small" : "medium"}
                          sx={{
                            minWidth: smallScreen ? '60px' : '80px',
                            maxWidth: smallScreen ? '60px' : '80px',
                            fontSize: smallScreen ? '0.75rem' : 'inherit'
                          }}
                          onClick={() => handleCalendarNavigate('TODAY')}
                        >
                          Today
                        </Button>
                      </Box>
                      <Divider />
                      <Box className="calendar-container">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <div className="calendar-white-bg">
                            <CalendarNavigation
                              currentDate={currentDate}
                              onNavigate={handleCalendarNavigate}
                            />
                            <DateCalendar
                              value={dayjs(currentDate)}
                              onChange={(newDate) => {
                                const jsDate = newDate.toDate();
                                setCurrentDate(jsDate);
                                handleDateClick(jsDate);

                                // Update FullCalendar to the selected date
                                if (calendarRef.current) {
                                  const calendarApi = calendarRef.current.getApi();
                                  calendarApi.gotoDate(jsDate);
                                }
                              }}
                              sx={{
                                '& .MuiPickersCalendarHeader-root': {
                                  display: 'none', // Hide default header, we use custom navigation
                                },
                                '& .MuiDayCalendar-monthContainer': {
                                  mx: smallScreen ? 0 : 'auto'
                                },
                                '& .MuiDayCalendar-weekContainer': {
                                  justifyContent: 'center'
                                },
                                '& .MuiPickersDay-root': {
                                  width: smallScreen ? 28 : 36,
                                  height: smallScreen ? 28 : 36,
                                  fontSize: smallScreen ? '0.75rem' : 'inherit'
                                }
                              }}
                              renderLoading={() => <DayCalendarSkeleton />}
                              slots={{
                                day: appointmentDates,
                              }}
                            />
                          </div>
                        </LocalizationProvider>
                      </Box>
                    </Paper>
                  </div>

                  {/* Appointments List Card */}
                  <div className="appointments-section">
                    <Paper elevation={0} className="paper-container">
                      <Box p={smallScreen ? 1.5 : 2} display="flex" flexDirection={mediumScreen ? "column" : "row"} justifyContent="space-between" alignItems={mediumScreen ? "flex-start" : "center"} gap={mediumScreen ? 1.5 : 0}>
                        <div>
                          <Typography variant="h6" className="section-title">
                            {tabValue === 0 && "All Appointments"}
                            {tabValue === 1 && "Today's Appointments"}
                            {tabValue === 2 && "Upcoming Appointments"}
                            {tabValue === 3 && "Past Appointments"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: smallScreen ? '0.75rem' : 'inherit' }}>
                            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                          </Typography>
                        </div>

                        {/* Responsive ButtonGroup */}
                        <div className={mediumScreen ? "w-100" : ""}>
                          <ButtonGroup
                            variant="outlined"
                            size={smallScreen ? "small" : "medium"}
                            fullWidth={mediumScreen}
                            className="responsive-button-group"
                          >
                            <Button
                              variant={tabValue === 0 ? "contained" : "outlined"}
                              onClick={() => setTabValue(0)}
                              sx={{
                                fontSize: smallScreen ? '0.65rem' : 'inherit',
                                padding: smallScreen ? '4px 8px' : 'inherit'
                              }}
                            >
                              All
                            </Button>
                            <Button
                              variant={tabValue === 1 ? "contained" : "outlined"}
                              onClick={() => setTabValue(1)}
                              sx={{
                                fontSize: smallScreen ? '0.65rem' : 'inherit',
                                padding: smallScreen ? '4px 8px' : 'inherit'
                              }}
                            >
                              Today
                            </Button>
                            <Button
                              variant={tabValue === 2 ? "contained" : "outlined"}
                              onClick={() => setTabValue(2)}
                              sx={{
                                fontSize: smallScreen ? '0.65rem' : 'inherit',
                                padding: smallScreen ? '4px 8px' : 'inherit'
                              }}
                            >
                              {smallScreen ? "Up" : "Upcoming"}
                            </Button>
                            <Button
                              variant={tabValue === 3 ? "contained" : "outlined"}
                              onClick={() => setTabValue(3)}
                              sx={{
                                fontSize: smallScreen ? '0.65rem' : 'inherit',
                                padding: smallScreen ? '4px 8px' : 'inherit'
                              }}
                            >
                              Past
                            </Button>
                          </ButtonGroup>
                        </div>
                      </Box>
                      <Divider />
                      <div className="appointments-preview">
                        {filteredAppointments.length > 0 ? (
                          filteredAppointments.map((appointment) => (
                            <AppointmentItem
                              key={appointment._id}
                              appointment={appointment}
                              onClick={() => handleModalOpen(appointment._id)}
                            />
                          ))
                        ) : (
                          <EmptyState message={`No ${tabValue === 1 ? "today's" : tabValue === 2 ? "upcoming" : tabValue === 3 ? "past" : ""} appointments found`} />
                        )}
                      </div>
                    </Paper>
                  </div>
                </div>

                {/* Bottom Row - Full Calendar View */}
                <div className="bottom-row">
                  <Paper elevation={0} className="paper-container">
                    <Box p={smallScreen ? 1.5 : 2} display="flex" flexDirection={mediumScreen ? "column" : "row"} justifyContent="space-between" alignItems={mediumScreen ? "flex-start" : "center"} gap={mediumScreen ? 1.5 : 0}>
                      <div>
                        <Typography variant="h6" className="section-title">
                          Calendar View
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: smallScreen ? '0.75rem' : 'inherit' }}>
                          Full schedule overview
                        </Typography>
                      </div>

                      {/* Responsive ButtonGroup for Calendar View */}
                      <div className={mediumScreen ? "w-100" : ""}>
                        <ButtonGroup
                          variant="outlined"
                          size={smallScreen ? "small" : "medium"}
                          fullWidth={mediumScreen}
                          className="responsive-button-group"
                        >
                          <Button
                            variant={viewMode === 'dayGridMonth' ? "contained" : "outlined"}
                            onClick={() => handleViewChange('month')}
                            sx={{
                              fontSize: smallScreen ? '0.65rem' : 'inherit',
                              padding: smallScreen ? '4px 8px' : 'inherit'
                            }}
                          >
                            Month
                          </Button>
                          <Button
                            variant={viewMode === 'timeGridWeek' ? "contained" : "outlined"}
                            onClick={() => handleViewChange('week')}
                            sx={{
                              fontSize: smallScreen ? '0.65rem' : 'inherit',
                              padding: smallScreen ? '4px 8px' : 'inherit'
                            }}
                          >
                            Week
                          </Button>
                          <Button
                            variant={viewMode === 'timeGridDay' ? "contained" : "outlined"}
                            onClick={() => handleViewChange('day')}
                            sx={{
                              fontSize: smallScreen ? '0.65rem' : 'inherit',
                              padding: smallScreen ? '4px 8px' : 'inherit'
                            }}
                          >
                            Day
                          </Button>
                        </ButtonGroup>
                      </div>
                    </Box>
                    <Divider />
                    <Box className="schedule-container calendar-white-bg">
                      <FullCalendarHeader
                        date={currentDate}
                        view={viewMode}  // Pass the current view mode
                        onNavigate={(action) => {
                          if (calendarRef.current) {
                            const calendarApi = calendarRef.current.getApi();
                            calendarApi[action]();
                            setCurrentDate(calendarApi.getDate());
                          }
                        }}
                        onTodayClick={() => {
                          if (calendarRef.current) {
                            const calendarApi = calendarRef.current.getApi();
                            calendarApi.today();
                            setCurrentDate(calendarApi.getDate());
                          }
                        }}
                      />
                      <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={viewMode}
                        headerToolbar={false} // Keep using custom header
                        events={calendarEvents}
                        height={getCalendarHeight()}
                        eventClick={(info) => {
                          const appointmentId = info.event.id;
                          handleModalOpen(appointmentId);
                        }}
                        dateClick={(info) => {
                          setCurrentDate(info.date);
                        }}
                        dayMaxEvents={true}
                        nowIndicator={true}
                        initialDate={currentDate}
                        eventTimeFormat={{
                          hour: 'numeric',
                          minute: '2-digit',
                          meridiem: 'short'
                        }}
                        dayHeaderFormat={{
                          weekday: smallScreen ? 'narrow' : 'short',
                          month: 'numeric',
                          day: 'numeric',
                          omitCommas: true
                        }}
                        allDaySlot={false}
                        slotDuration="00:30:00"
                        slotLabelFormat={{
                          hour: 'numeric',
                          minute: '2-digit',
                          meridiem: 'short'
                        }}
                        eventDisplay="block"
                        eventContent={(eventInfo) => {
                          return (
                            <div className="fc-event-content-wrapper">
                              <div className="fc-event-title" style={{
                                fontSize: smallScreen ? '0.7rem' : 'inherit',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {eventInfo.event.title}
                              </div>
                              {(viewMode === 'timeGridWeek' || viewMode === 'timeGridDay') && (
                                <div className="fc-event-time" style={{
                                  fontSize: smallScreen ? '0.65rem' : 'inherit'
                                }}>
                                  {format(eventInfo.event.start, smallScreen ? 'h:mm' : 'h:mm a')}
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                    </Box>
                  </Paper>
                </div>
              </div>

      {/* Appointment Details Modal - Made responsive */}
      <Dialog
        open={!!modalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        fullScreen={smallScreen}
      >
        {selectedAppointment && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" component="div" sx={{ fontSize: smallScreen ? '1.1rem' : '1.5rem' }}>
                  Appointment Details
                </Typography>
                <AppointmentStatus date={selectedAppointment.date} />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 1 }}>
                {/* Patient info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#4040dd', mr: 2, width: smallScreen ? 40 : 56, height: smallScreen ? 40 : 56 }}>
                    {selectedAppointment.firstname?.charAt(0) || "?"}
                  </Avatar>
                  <div>
                    <Typography variant="h6" sx={{ fontSize: smallScreen ? '1rem' : '1.25rem' }}>
                      {selectedAppointment.firstname} {selectedAppointment.middlename} {selectedAppointment.lastname}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Patient
                    </Typography>
                  </div>
                </Box>

                {/* Appointment details */}
                <Paper variant="outlined" sx={{ p: smallScreen ? 2 : 3, mb: 3, borderRadius: '12px' }}>
                  <Grid container spacing={smallScreen ? 2 : 3}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <EventIcon sx={{ color: '#4040dd', mr: 1.5, mt: 0.5, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">Date</Typography>
                          <Typography variant="body1" fontWeight={500} sx={{ fontSize: smallScreen ? '0.875rem' : 'inherit' }}>
                            {format(new Date(selectedAppointment.date), smallScreen ? 'MM/dd/yyyy' : 'EEEE, MMMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <AccessTimeIcon sx={{ color: '#4040dd', mr: 1.5, mt: 0.5, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">Time</Typography>
                          <Typography variant="body1" fontWeight={500} sx={{ fontSize: smallScreen ? '0.875rem' : 'inherit' }}>
                            {selectedAppointment.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <EmailIcon sx={{ color: '#4040dd', mr: 1.5, mt: 0.5, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">Email</Typography>
                          <Typography variant="body1" sx={{
                            fontSize: smallScreen ? '0.875rem' : 'inherit',
                            wordBreak: 'break-word'
                          }}>
                            {selectedAppointment.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <PhoneIcon sx={{ color: '#4040dd', mr: 1.5, mt: 0.5, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">Phone</Typography>
                          <Typography variant="body1" sx={{ fontSize: smallScreen ? '0.875rem' : 'inherit' }}>
                            {selectedAppointment.phone_no}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <MedicalServicesIcon sx={{ color: '#4040dd', mr: 1.5, mt: 0.5, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">Treatment Type</Typography>
                          <Typography variant="body1" sx={{ fontSize: smallScreen ? '0.875rem' : 'inherit' }}>
                            {selectedAppointment.treatment_type}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="flex-start">
                        <MeetingRoomIcon sx={{ color: '#4040dd', mr: 1.5, mt: 0.5, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">Clinical Room</Typography>
                          <Typography variant="body1" sx={{ fontSize: smallScreen ? '0.875rem' : 'inherit' }}>
                            {selectedAppointment.clinical_room}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Notes section */}
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <NoteIcon sx={{ color: '#4040dd', mr: 1, fontSize: smallScreen ? '1.1rem' : '1.5rem' }} />
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: smallScreen ? '0.95rem' : 'inherit' }}>
                      Notes
                    </Typography>
                  </Box>
                  <Paper variant="outlined" sx={{ p: smallScreen ? 1.5 : 2, borderRadius: '12px' }}>
                    <Typography variant="body1" sx={{ fontSize: smallScreen ? '0.875rem' : 'inherit' }}>
                      {selectedAppointment.notes || "No notes available for this appointment."}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: smallScreen ? 2 : 3, pt: smallScreen ? 1 : 1, flexDirection: smallScreen ? 'column' : 'row' }}>
              <Button
                variant="outlined"
                onClick={handleModalClose}
                fullWidth={smallScreen}
                sx={{ mb: smallScreen ? 1 : 0 }}
              >
                Close
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={!smallScreen && <EditIcon />}
                onClick={() => updateAppointment(selectedAppointment._id)}
                fullWidth={smallScreen}
                sx={{ mb: smallScreen ? 1 : 0 }}
              >
                {smallScreen ? "Reschedule" : "Reschedule"}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={!smallScreen && <CancelIcon />}
                onClick={() => {
                  cancelAppointment(selectedAppointment._id);
                  handleModalClose();
                }}
                fullWidth={smallScreen}
              >
                Cancel Appointment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Schedule Appointment Confirmation Modal */}
      <Dialog
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Schedule Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Would you like to schedule an appointment for {selectedDateForScheduling ? format(new Date(selectedDateForScheduling), 'MMMM dd, yyyy') : ''}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleModal(false)}>Cancel</Button>
          <Button onClick={handleScheduleAppointment} variant="contained" color="primary">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal for Past Dates */}
      <Dialog
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>Invalid Date Selection</DialogTitle>
        <DialogContent>
          <Typography>
            You cannot schedule appointments for past dates. Please select today or a future date.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorModal(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </div>
  );
};

export default AppointmentList;
