import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format } from 'date-fns';

const FullCalendarHeader = ({ date, onNavigate, onTodayClick }) => {
  const formattedDate = format(date, 'MMMM yyyy');
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="space-between" 
      sx={{ 
        backgroundColor: '#f7fafc',
        padding: '12px 16px',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <Box display="flex" alignItems="center">
        {/* Navigation buttons explicitly separated to ensure visibility */}
        <Box 
          sx={{
            display: 'flex',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            overflow: 'visible', // Changed from 'hidden' to ensure buttons are fully visible
            mr: 2
          }}
        >
          {/* Left button with explicit width */}
          <IconButton 
            size="small" 
            onClick={() => onNavigate('prev')} 
            sx={{ 
              borderRadius: '0',
              width: '36px',
              height: '36px',
              padding: '6px'
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          
          {/* Divider between buttons */}
          <Box sx={{ width: '1px', backgroundColor: '#e2e8f0' }} />
          
          {/* Right button with explicit width */}
          <IconButton 
            size="small" 
            onClick={() => onNavigate('next')} 
            sx={{ 
              borderRadius: '0',
              width: '36px',
              height: '36px',
              padding: '6px',
              zIndex: 1 // Ensure it's on top
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => onTodayClick()}
          sx={{ 
            backgroundColor: '#334155', 
            '&:hover': { backgroundColor: '#1e293b' },
            textTransform: 'lowercase',
            borderRadius: '4px',
            px: 2
          }}
        >
          Today
        </Button>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {formattedDate}
      </Typography>
    </Box>
  );
};

export default FullCalendarHeader;