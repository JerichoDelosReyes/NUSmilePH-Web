import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Container,
  Tabs,
  Tab,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Assignment,
  Warning,
  CheckCircle,
  Folder,
  Refresh,
  Star,
  ArrowBack,
  Description,
  Info,
  HourglassEmpty,
  Search,
  FilterList,
  SentimentDissatisfied,
} from '@mui/icons-material';
import { 
  FiArrowLeft, 
  // other icons you're using from react-icons/fi
} from 'react-icons/fi';
import TitleHead from './TitleHead';
import { UserContext } from '../Context/UserContext';
import '../Views/Styles/Dashboard.css';

import { API_URL } from '../../config/api';

const CISignedCaseHistory = () => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  TitleHead('Signed Case History');

  // State management
  const [signedCases, setSignedCases] = useState([]);
  const [signedPenalties, setSignedPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');

  // Fetch signed cases function
  const fetchSignedCases = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getUserById/${user.id}`);
      const userData = response.data.users;
      
      // Sort data by date (newest first)
      const sortedCases = (userData.signedCase || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      const sortedPenalties = (userData.signedPenalty || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setSignedCases(sortedCases);
      setSignedPenalties(sortedPenalties);
    } catch (error) {
      console.error('Error fetching signed cases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSignedCases();
  }, [fetchSignedCases]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSignedCases();
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Enhanced Case Item Component
  const CaseItem = ({ item }) => {
    const ratingColor = getRatingColor(item.rating);
    
    return (
      <Card
        elevation={1}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: 'hidden',
          borderLeft: `4px solid ${ratingColor.color}`,
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-3px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              {/* Left side - Case details */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Description sx={{ fontSize: 20, color: ratingColor.color, mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  {item.caseName}
                </Typography>
              </Box>
              
              <Box sx={{ pl: 0.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Date: <strong>{formatDate(item.date)}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Sheet Level: <strong>{item.sheetLevel}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Folder sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Path: <strong>{item.casePath}</strong>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              {/* Right side - Rating and actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'flex-start', sm: 'flex-end' },
                  height: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <Chip
                  icon={<Star sx={{ color: `${ratingColor.color} !important` }} />}
                  label={item.rating}
                  sx={{
                    bgcolor: ratingColor.bgColor,
                    color: ratingColor.color,
                    fontWeight: '600',
                    px: 1,
                    '& .MuiChip-icon': {
                      color: ratingColor.color,
                    },
                  }}
                />
                
                <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    sx={{ borderRadius: 2 }}
                    onClick={() => {/* View details implementation */}}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Enhanced Penalty Item Component
  const PenaltyItem = ({ item }) => {
    return (
      <Card
        elevation={1}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: 'hidden',
          borderLeft: '4px solid #d32f2f',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-3px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              {/* Left side - Case details */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Warning sx={{ fontSize: 20, color: '#d32f2f', mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  {item.case}
                </Typography>
              </Box>
              
              <Box sx={{ pl: 0.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Date: <strong>{formatDate(item.date)}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Sheet Level: <strong>{item.sheetLevel}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Folder sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Path: <strong>{item.casePath}</strong>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              {/* Right side - Clinician and actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'flex-start', sm: 'flex-end' },
                  height: '100%',
                  justifyContent: 'space-between',
                }}
              >
                {item.clinician && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: '#4CAF50',
                        fontSize: '14px',
                      }}
                    >
                      {item.clinician.firstName?.charAt(0) || ''}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">
                      {`${item.clinician.firstName || ''} ${item.clinician.surname || ''}`}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    sx={{ borderRadius: 2 }}
                    onClick={() => {/* View details implementation */}}
                  >
                    View Penalty
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Helper function to determine color based on rating
  const getRatingColor = (rating) => {
    const ratingNum = parseFloat(rating);
    
    if (ratingNum >= 4.5) return { color: '#2e7d32', bgColor: '#e8f5e9' }; // Excellent - Green
    if (ratingNum >= 3.5) return { color: '#1976d2', bgColor: '#e3f2fd' }; // Good - Blue
    if (ratingNum >= 2.5) return { color: '#ed6c02', bgColor: '#fff3e0' }; // Average - Orange
    return { color: '#d32f2f', bgColor: '#ffebee' }; // Poor - Red
  };

  // Enhanced Empty State Component
  const EmptyState = ({ message, type }) => (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {type === 'penalties' ? (
        <Warning sx={{ fontSize: 64, color: '#e0e0e0' }} />
      ) : (
        <Description sx={{ fontSize: 64, color: '#e0e0e0' }} />
      )}
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {type === 'penalties'
          ? 'Any penalty cases you sign will appear here'
          : 'Any cases you sign will appear here'}
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Search />}
        sx={{ mt: 2 }}
        onClick={() => navigate('/dashboard')}
      >
        Go to Dashboard
      </Button>
    </Box>
  );

  // Enhanced Loading Component
  const LoadingComponent = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress size={60} thickness={4} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Assignment sx={{ color: '#bbdefb', fontSize: 24 }} />
        </Box>
      </Box>
      <Typography variant="h6" color="primary.main" fontWeight="500">
        Loading signed documents...
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
        We're retrieving your signed cases and penalties. This will only take a moment.
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <LoadingComponent />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
    {/* Using the provided back button */}
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => navigate(-1)}
        className="compact-back-btn mb-3"
      >
        <FiArrowLeft size={16} />
        <span className="ms-1">Back</span>
      </Button>
      
      {/* Enhanced Header */}
      <Box 
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(45deg, #303F9F 30%, #1976D2 90%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
              Signed Documents
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              View all signed cases and penalty cases
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge 
              badgeContent={signedCases.length + signedPenalties.length} 
              color="error" 
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '11px',
                  height: '20px',
                  minWidth: '20px',
                }
              }}
            >
              <Button
                variant="contained"
                color="inherit"
                size={isMediumScreen ? "small" : "medium"}
                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  color: '#1976D2',
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Badge>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Tab Container */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          mb: 3,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
                textTransform: 'none',
              },
              '& .Mui-selected': {
                color: '#1976D2',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976D2',
                height: 3,
              },
            }}
          >
            <Tab 
              icon={<Description sx={{ mb: 0.5 }} />}
              iconPosition="start"
              label={`Cases (${signedCases.length})`} 
              value="cases" 
            />
            <Tab 
              icon={<Warning sx={{ mb: 0.5 }} />}
              iconPosition="start"
              label={`Penalties (${signedPenalties.length})`} 
              value="penalties" 
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 'cases' ? (
            <Box>
              {signedCases.length > 0 ? (
                <>
                  {/* Add summary stats for cases */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mb: 3, 
                      flexWrap: 'wrap',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {signedCases.length} {signedCases.length === 1 ? 'Case' : 'Cases'} Found
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Tooltip title="Latest signing date">
                        <Chip
                          size="small"
                          icon={<CalendarToday fontSize="small" />}
                          label={`Latest: ${formatDate(signedCases[0]?.date)}`}
                          sx={{ bgcolor: '#f5f5f5', fontWeight: 500 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Case list */}
                  {signedCases.map((item, index) => (
                    <CaseItem
                      key={item.id || index.toString()}
                      item={item}
                    />
                  ))}
                </>
              ) : (
                <EmptyState 
                  message="No signed cases found" 
                  type="cases" 
                />
              )}
            </Box>
          ) : (
            <Box>
              {signedPenalties.length > 0 ? (
                <>
                  {/* Add summary stats for penalties */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mb: 3, 
                      flexWrap: 'wrap',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium" color="error">
                      {signedPenalties.length} {signedPenalties.length === 1 ? 'Penalty' : 'Penalties'} Found
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Tooltip title="Latest penalty date">
                        <Chip
                          size="small"
                          icon={<CalendarToday fontSize="small" />}
                          label={`Latest: ${formatDate(signedPenalties[0]?.date)}`}
                          sx={{ bgcolor: '#f5f5f5', fontWeight: 500 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Penalty list */}
                  {signedPenalties.map((item, index) => (
                    <PenaltyItem
                      key={item.id || index.toString()}
                      item={item}
                    />
                  ))}
                </>
              ) : (
                <EmptyState 
                  message="No signed penalties found" 
                  type="penalties" 
                />
              )}
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Information card */}
      <Card 
        sx={{ 
          borderRadius: 3, 
          bgcolor: '#e3f2fd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          mt: 4,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Info sx={{ color: '#0288d1', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                About Signed Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This page displays all cases and penalties that have been signed off by instructors or chairs. 
                Cases are regular treatments that have been completed and reviewed, while penalties are cases 
                where additional review or remediation was required.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
  </Container>
  );
};

export default CISignedCaseHistory;