import { useState, useEffect, useContext } from "react";
import TitleHead from "../Custom Hooks/TitleHead";
import "../Views/Styles/Dashboard.css";
import { useNavigate, useLocation } from 'react-router-dom';

// Material-UI imports
import {
  Box,
  Typography,
  Grid,
  Button as MuiButton,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  Tabs,
  Tab,
  CardActionArea,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// Material UI icons
import BoltIcon from '@mui/icons-material/Bolt';
import GridViewIcon from "@mui/icons-material/GridView";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import TimelineIcon from "@mui/icons-material/Timeline";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';

// Chart imports
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Area,
} from "recharts";

// Other imports
import axios from "axios";
import {
  Calendar,
  Users,
  FileText,
  Activity,
  Clock,
  Plus,
  ChevronRight,
  MoreVertical,
  User,
  CheckCircle,
  MapPin,
  Clipboard,
  UserCheck,
  FileCheck,
  Building,
  Briefcase,
  Check,
} from "lucide-react";
import { UserContext } from "../Context/UserContext";
import { API_URL } from "../../config/api";
import { App } from "antd";

// Progress Statistics Component
const ProgressStatistics = ({ clinicianId, clinicLevel }) => {
  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="h4" fontWeight="700" color="#34A853" sx={{ mb: 1 }}>
        75%
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Clinical Progress for Level {clinicLevel}
      </Typography>
      <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, height: 8, mb: 2 }}>
        <Box sx={{ width: '75%', bgcolor: '#34A853', borderRadius: 2, height: '100%' }} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Excellent progress! Keep up the great work.
      </Typography>
    </Box>
  );
};

// Create a wrapper component to use navigation context
const Dashboard = () => {
  const navigate = useNavigate();
  TitleHead("Dashboard");
  const { user, loading: userLoading } = useContext(UserContext);
  const location = useLocation();
  const { message } = App.useApp();

  // Simplified state - only keeping essential states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Move this here from renderClinicalChairDashboard
  const [selectedClinicalLevel, setSelectedClinicalLevel] = useState("IA"); // Default to level 1

  // useEffect hook with fixed dependencies
  useEffect(() => {
    if (location.state?.message) {
      message.warning(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, message]);
  useEffect(() => {
    if (!user || !user.role) {
      console.log("User not loaded yet, skipping data fetch");
      return;
    }

    const fetchUserData = async () => {
      try {
        setDashboardLoading(true);

        // Local variables to store fetched data
        let appointmentsToday = 0;
        let appointmentsUpcoming = 0;
        let patientCount = 0;
        let signedCases = 0;
        let penaltyCases = 0;

        // Fetch specific role data
        if (user.role === "Clinician" && user?.id) {
          try {
            const dashboardResponse = await axios.get(
              `${API_URL}/dashboard/clinician/${user.id}`
            );
            setDashboardStats(dashboardResponse.data);

            // Set userData from dashboard response
            setUserData({
              ...user,
              name: user.username,
              patients: dashboardResponse.data.summary.patients,
              appointments: dashboardResponse.data.summary.appointments,
              progress: dashboardResponse.data.summary.progress,
            });
          } catch (error) {
            console.error("Error fetching clinician dashboard data:", error);
          }
        } else if (user.role === "Clinical Instructor" && user?.id) {
          try {
            const dashboardResponse = await axios.get(
              `${API_URL}/dashboard/instructor/${user.id}`
            );
            setDashboardStats(dashboardResponse.data);

            // Set userData from dashboard response
            setUserData({
              ...user,
              name: user.username,
              clinicians: {
                today: dashboardResponse.data.summary.clinicians.today,
                thisWeek: dashboardResponse.data.summary.clinicians.thisWeek,
              },
              cases: {
                signed: dashboardResponse.data.summary.cases.signed,
                current: dashboardResponse.data.summary.cases.current,
              },
            });
          } catch (error) {
            console.error(
              "Error fetching clinical instructor dashboard data:",
              error
            );
          }
        } else if (user.role === "Clinical Chair") {
          // Add dashboard statistics fetching for Clinical Chair
          try {
            const dashboardResponse = await axios.get(
              `${API_URL}/dashboard/all`
            );
            setDashboardStats(dashboardResponse.data);
            patientCount = dashboardResponse.data.patientStats.count || 0;

            // Set basic user data
            setUserData({
              ...user,
              name: user.username,
              patients: { total: patientCount },
              instructors: {
                total:
                  dashboardResponse.data.userStats.counts.roleDistribution.find(
                    (role) => role._id === "Clinical Instructor"
                  )?.count || 0,
              },
              clinicians: {
                total:
                  dashboardResponse.data.userStats.counts.roleDistribution.find(
                    (role) => role._id === "Clinician"
                  )?.count || 0,
              },
              cases: {
                signed: 0,
                current: 0,
              },
            });
          } catch (error) {
            console.error("Error fetching dashboard statistics:", error);
          }
        } else {
          // ...existing code for other roles
        }

        setDashboardLoading(false);
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        setDashboardLoading(false);
      }
    };

    fetchUserData();
  }, [user?.role, user?.id, user?._id, user?.username, message]);
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
  ];
  const PieChartCard = ({ title, data, dataKey, description }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const onPieEnter = (_, index) => {
      setActiveIndex(index);
    };

    const customLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      name,
    }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return percent > 0.05 ? (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontWeight={activeIndex === index ? "bold" : "normal"}
          fontSize={12}
        >
          {(percent * 100).toFixed(0)}%
        </text>
      ) : null;
    };

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "10px",
              border: "1px solid #f0f0f0",
              borderRadius: "6px",
              boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Typography fontWeight="bold" color={payload[0].payload.fill}>
              {payload[0].name}
            </Typography>
            <Typography variant="body2">
              Count:{" "}
              <span style={{ fontWeight: "bold" }}>{payload[0].value}</span>
            </Typography>
            <Typography variant="body2">
              Percentage:{" "}
              <span style={{ fontWeight: "bold" }}>
                {(
                  (payload[0].value /
                    data.reduce((sum, entry) => sum + entry.value, 0)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </Typography>
          </Box>
        );
      }
      return null;
    };

    return (
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
          position: "relative",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="700" color="text.primary">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
          >
            Total: {data.reduce((sum, entry) => sum + entry.value, 0)}
          </Typography>
        </Box>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ height: 280, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={customLabel}
                outerRadius={95}
                innerRadius={45}
                fill="#8884d8"
                dataKey={dataKey}
                onMouseEnter={onPieEnter}
                animationBegin={0}
                animationDuration={1200}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={activeIndex === index ? 2 : 1}
                    style={{
                      filter:
                        activeIndex === index
                          ? "drop-shadow(0px 3px 5px rgba(0,0,0,0.2))"
                          : "none",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "15px" }}
                formatter={(value, entry) => (
                  <span
                    style={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    );
  };

  const BarChartCard = ({ title, data, xKey, yKey, description }) => {
    const [activeBar, setActiveBar] = useState(null);

    const handleMouseEnter = (data, index) => {
      setActiveBar(index);
    };

    const handleMouseLeave = () => {
      setActiveBar(null);
    };

    // Find maximum value for scaling
    const maxValue = Math.max(...data.map((item) => item[yKey]));

    // Customize the tooltip
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "10px",
              border: "1px solid #f0f0f0",
              borderRadius: "6px",
              boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Typography fontWeight="bold">{label}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#8884d8",
                  mr: 1,
                }}
              />
              <Typography variant="body2">
                {yKey}:{" "}
                <span style={{ fontWeight: "bold" }}>{payload[0].value}</span>
              </Typography>
            </Box>
          </Box>
        );
      }
      return null;
    };

    return (
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="700" color="text.primary">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
          >
            Total: {data.reduce((sum, item) => sum + item[yKey], 0)}
          </Typography>
        </Box>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ height: 280, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey={xKey}
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E0E0" }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#E0E0E0" }}
                domain={[0, maxValue + Math.ceil(maxValue * 0.1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={yKey}
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fillOpacity={activeBar === index ? 1 : 0.85}
                    style={{
                      filter:
                        activeBar === index
                          ? "drop-shadow(0px 4px 8px rgba(99, 102, 241, 0.4))"
                          : "none",
                      transition: "filter 0.3s",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    );
  };

  const LineChartCard = ({ title, data, xKey, yKey, description }) => {
    return (
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="700" color="text.primary">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
          >
            Total: {data.reduce((sum, item) => sum + item[yKey], 0)}
          </Typography>
        </Box>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ height: 280, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E0E0" }}
              />
              <YAxis tickLine={false} axisLine={{ stroke: "#E0E0E0" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  padding: "10px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                  boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.12)",
                }}
                labelStyle={{ fontWeight: "bold" }}
                itemStyle={{ padding: "2px 0" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="circle" />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke="#8884d8"
                strokeWidth={3}
                fill="url(#colorGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#8884d8"
                strokeWidth={3}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "white",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 0,
                  fill: "#8884d8",
                  boxShadow: "0 0 0 4px rgba(136, 132, 216, 0.2)",
                }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    );
  };

  // Early return AFTER all hooks are declared
  if (userLoading || !user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
        flexDirection="column"
      >
        <div className="loading-spinner"></div>
        <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
          Loading user data...
        </Typography>
      </Box>
    );
  }

  // Dashboard loading state
  const LoadingDashboard = () => (
    

    <div className="loading-spinner">Loading...</div>
  );

  // New SimpleCard component to match the mobile design in the image
  const SimpleCard = ({ title, items, buttonText, onClick }) => (
    <Card
      sx={{
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        mb: 3,
        overflow: "hidden",
        bgcolor: "white",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
            {title}
          </Typography>

          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
              }}
            >
              <Typography variant="body1">{item.label}</Typography>
              <Typography variant="body1" fontWeight="600">
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <MuiButton
          fullWidth
          sx={{
            bgcolor: "#4040DD",
            color: "white",
            py: 1.5,
            borderRadius: 0,
            "&:hover": {
              bgcolor: "#3636C2",
            },
          }}
          onClick={onClick}
        >
          {buttonText}
        </MuiButton>
      </CardContent>
    </Card>
  );

  // Quick Action Card Component
  const QuickActionCard = ({
    icon: Icon,
    title,
    description,
    color,
    onClick,
  }) => (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 2,
        transition: "transform 0.3s, box-shadow 0.3s",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 3,
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}20`,
              color: color,
              width: 40,
              height: 40,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <Icon size={20} />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              color="text.primary"
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        <ChevronRight size={16} color="#666" />
      </Box>
    </Paper>
  );

  // Render Clinician Modern Dental Dashboard
  const renderClinicianDashboard = () => {
    if (!userData) return null;

    // Transform recent appointments data for display
    const formatRecentAppointments = () => {
      if (!dashboardStats?.appointmentStats?.recentAppointments) return [];

      return dashboardStats.appointmentStats.recentAppointments.map((appt) => ({
        id: appt._id,
        patientName: `${appt.firstname} ${appt.lastname}`,
        date: new Date(appt.date).toLocaleDateString(),
        time: appt.time,
        room: appt.clinical_room,
        treatment: appt.treatment_type?.substring(0, 50) + "...",
        contactInfo: appt.phone_no,
      }));
    };

    const recentAppointments = formatRecentAppointments();

    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.4,
          }}
        />

        {/* Main Container */}
        <Box sx={{ position: 'relative', zIndex: 1, p: 0 }}>
          {/* Header Section */}
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              px: 4,
              py: 3,
            }}
          >
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {userData.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5
                      }}
                    >
                      Welcome back, Dr. {userData.username} 🦷
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospitalIcon sx={{ color: '#667eea' }} />
                      Dental Care Excellence Dashboard
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 2, md: 0 } }}>
                <Typography variant="body1" color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Stats Cards Row */}
          <Box sx={{ px: 4, py: 3 }}>
            <Grid container spacing={3}>
              {[
                {
                  title: "Total Patients",
                  value: dashboardStats?.summary?.patients?.total || 0,
                  icon: <Users size={28} />,
                  color: "#4285F4",
                  bgColor: "#E3F2FD",
                  subtitle: "Under your care"
                },
                {
                  title: "Today's Appointments",
                  value: dashboardStats?.summary?.appointments?.today || 0,
                  icon: <EventAvailableIcon sx={{ fontSize: 28 }} />,
                  color: "#34A853",
                  bgColor: "#E8F5E8",
                  subtitle: "Scheduled for today"
                },
                {
                  title: "Upcoming Treatments",
                  value: dashboardStats?.summary?.appointments?.upcoming || 0,
                  icon: <VaccinesIcon sx={{ fontSize: 28 }} />,
                  color: "#FBBC04",
                  bgColor: "#FFF8E1",
                  subtitle: "Next 7 days"
                },
                {
                  title: "Completed Cases",
                  value: dashboardStats?.summary?.progress?.complete || 0,
                  icon: <HealthAndSafetyIcon sx={{ fontSize: 28 }} />,
                  color: "#EA4335",
                  bgColor: "#FFEBEE",
                  subtitle: "This month"
                },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px rgba(${stat.color.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.3)`,
                      },
                      overflow: 'visible',
                      position: 'relative'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 3,
                            backgroundColor: stat.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <TrendingUpIcon sx={{ color: stat.color, fontSize: 20 }} />
                      </Box>
                      <Typography variant="h3" fontWeight="800" color="text.primary" sx={{ mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Main Content Grid */}
          <Box sx={{ px: 4, pb: 4 }}>
            <Grid container spacing={4}>
              
              {/* Today's Appointments - Full Width Priority */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      p: 3,
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <EventAvailableIcon sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="h5" fontWeight="700">
                            Today's Dental Appointments
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Your schedule for {new Date().toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <MuiButton
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => navigate("/setAppointments")}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        New Appointment
                      </MuiButton>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 0 }}>
                    {recentAppointments.length > 0 ? (
                      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {recentAppointments.map((appointment, index) => (
                          <Box
                            key={appointment.id}
                            sx={{
                              p: 3,
                              borderBottom: index < recentAppointments.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(102, 126, 234, 0.02)',
                              },
                            }}
                          >
                            <Grid container spacing={3} alignItems="center">
                              <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: '#E3F2FD',
                                      color: '#4285F4',
                                      width: 50,
                                      height: 50,
                                      fontSize: '1.2rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    {appointment.patientName.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6" fontWeight="600">
                                      {appointment.patientName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {appointment.contactInfo}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>

                              <Grid item xs={6} sm={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Calendar size={16} style={{ color: '#667eea' }} />
                                  <Typography variant="body2" fontWeight="500">
                                    {appointment.date}
                                  </Typography>
                                </Box>
                              </Grid>

                              <Grid item xs={6} sm={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Clock size={16} style={{ color: '#667eea' }} />
                                  <Typography variant="body2" fontWeight="500">
                                    {appointment.time}
                                  </Typography>
                                </Box>
                              </Grid>

                              <Grid item xs={6} sm={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocalHospitalIcon sx={{ fontSize: 16, color: '#667eea' }} />
                                  <Typography variant="body2" fontWeight="500">
                                    Room {appointment.room}
                                  </Typography>
                                </Box>
                              </Grid>

                              <Grid item xs={6} sm={2}>
                                <Box sx={{ textAlign: 'right' }}>
                                  <IconButton 
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                                    }}
                                  >
                                    <MoreVertical size={16} />
                                  </IconButton>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <EventAvailableIcon sx={{ fontSize: 80, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
                        <Typography variant="h5" fontWeight="600" color="text.secondary" gutterBottom>
                          No Appointments Today
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                          Your schedule is clear. Time to catch up or plan ahead!
                        </Typography>
                        <MuiButton
                          variant="contained"
                          size="large"
                          startIcon={<Plus size={20} />}
                          onClick={() => navigate("/setAppointments")}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            px: 4,
                            py: 1.5,
                            borderRadius: 3
                          }}
                        >
                          Schedule New Appointment
                        </MuiButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Clinical Progress Tracking */}
              <Grid item xs={12} lg={6}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    height: '100%',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #34A853 0%, #137333 100%)',
                      color: 'white',
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <InsightsIcon sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          Clinical Progress
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Track your learning journey
                        </Typography>
                      </Box>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={selectedClinicalLevel}
                        onChange={(e) => setSelectedClinicalLevel(e.target.value)}
                        sx={{
                          color: 'white',
                          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                          '.MuiSvgIcon-root': { color: 'white' }
                        }}
                      >
                        <MenuItem value="IA">Level IA</MenuItem>
                        <MenuItem value="IB">Level IB</MenuItem>
                        <MenuItem value="IIA">Level IIA</MenuItem>
                        <MenuItem value="IIB">Level IIB</MenuItem>
                        <MenuItem value="IIIA">Level IIIA</MenuItem>
                        <MenuItem value="IIIB">Level IIIB</MenuItem>
                        <MenuItem value="IVA">Level IVA</MenuItem>
                        <MenuItem value="IVB">Level IVB</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      <ProgressStatistics
                        clinicianId={user.id}
                        clinicLevel={selectedClinicalLevel}
                      />
                    </Box>
                    <MuiButton
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate(`/progress/${selectedClinicalLevel}`)}
                      sx={{
                        background: 'linear-gradient(135deg, #34A853 0%, #137333 100%)',
                        py: 1.5,
                        borderRadius: 3
                      }}
                      startIcon={<TrendingUpIcon />}
                    >
                      View Detailed Progress
                    </MuiButton>
                  </CardContent>
                </Card>
              </Grid>

              {/* Patient Demographics */}
              <Grid item xs={12} lg={6}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    height: '100%',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #EA4335 0%, #D93025 100%)',
                      color: 'white',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PeopleIcon sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          Patient Demographics
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Overview of your patient base
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    {dashboardStats?.patientStats?.patientDemographics && (
                      <Box sx={{ height: 240, mb: 3 }}>
                        <PieChartCard
                          title=""
                          data={dashboardStats.patientStats.patientDemographics.map(
                            (item) => ({
                              name: item._id,
                              value: item.count,
                            })
                          )}
                          dataKey="value"
                        />
                      </Box>
                    )}

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="700" color="#EA4335" sx={{ mb: 1 }}>
                        {dashboardStats?.patientStats?.totalPatients || 0}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Total Active Patients
                      </Typography>
                      <MuiButton
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/allpatientdashboard")}
                        sx={{
                          background: 'linear-gradient(135deg, #EA4335 0%, #D93025 100%)',
                          py: 1.5,
                          borderRadius: 3
                        }}
                        startIcon={<Users size={20} />}
                      >
                        Manage Patients
                      </MuiButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h4"
                    fontWeight="800"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                      mb: 1
                    }}
                  >
                    🚀 Quick Actions
                  </Typography>
                  <Typography variant="h6" color="text.secondary" textAlign="center">
                    Access your most-used dental practice tools
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {[
                    {
                      title: "New Appointment",
                      description: "Schedule patient consultation",
                      icon: <EventAvailableIcon sx={{ fontSize: 32 }} />,
                      color: "#4285F4",
                      bgColor: "#E3F2FD",
                      path: "/setAppointments",
                    },
                    {
                      title: "Patient Records",
                      description: "Access medical histories",
                      icon: <Users size={32} />,
                      color: "#34A853",
                      bgColor: "#E8F5E8",
                      path: "/allpatientdashboard",
                    },
                    {
                      title: "Case Studies",
                      description: "Review treatment cases",
                      icon: <FileText size={32} />,
                      color: "#FBBC04",
                      bgColor: "#FFF8E1",
                      path: "/casehistory",
                    },
                    {
                      title: "Treatment Plans",
                      description: "Create dental treatments",
                      icon: <VaccinesIcon sx={{ fontSize: 32 }} />,
                      color: "#EA4335",
                      bgColor: "#FFEBEE",
                      path: "/treatments",
                    },
                    {
                      title: "Clinical Notes",
                      description: "Document procedures",
                      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
                      color: "#9C27B0",
                      bgColor: "#F3E5F5",
                      path: "/notes",
                    },
                    {
                      title: "My Profile",
                      description: "Update your information",
                      icon: <User size={32} />,
                      color: "#FF5722",
                      bgColor: "#FBE9E7",
                      path: "/profile",
                    },
                  ].map((action, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                      <Card
                        sx={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: 4,
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-12px) scale(1.02)',
                            boxShadow: `0 25px 50px rgba(${action.color.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',')}, 0.4)`,
                          },
                          height: '100%',
                        }}
                        onClick={() => navigate(action.path)}
                      >
                        <CardActionArea sx={{ height: '100%', p: 0 }}>
                          <Box
                            sx={{
                              height: 120,
                              background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}25 100%)`,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `${action.color}20`,
                              }}
                            />
                            <Box sx={{ color: action.color, zIndex: 1 }}>
                              {action.icon}
                            </Box>
                          </Box>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="700" gutterBottom>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {action.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    );
  };

  // Clinical Instructor Dashboard - using the same mobile card design
  const renderClinicalInstructorDashboard = () => {
    if (!dashboardStats || !userData) return null;

    // Format case type data for chart
    const caseTypeData =
      dashboardStats.caseStats?.caseTypes?.map((item) => ({
        name: item._id,
        value: item.count,
      })) || [];

    // Format recent activity for display
    const recentActivities = dashboardStats.recentActivity || [];

    return (
      <Box sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
        {/* Dashboard Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            background: "linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)",
            color: "white",
            mb: 4,
            position: "relative",
            overflow: "hidden",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "100%",
              opacity: 0.07,
              background:
                "url('https://ik.imagekit.io/tfme5aczh/pattern-white.png')",
              backgroundSize: "cover",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h5"
              fontWeight="800"
              sx={{ mb: 1, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              Welcome back, {userData.username}! 👋
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Monitor your clinical team's progress and sign case sheets
            </Typography>

            <Grid container spacing={2}>
              {[
                {
                  title: "Signed Cases",
                  value: dashboardStats.caseStats?.signedCases || 0,
                  icon: <FileCheck size={18} />,
                },
                {
                  title: "Clinicians Today",
                  value: dashboardStats.clinicianStats?.cliniciansToday || 0,
                  icon: <Users size={18} />,
                },
                {
                  title: "Clinicians This Week",
                  value: dashboardStats.clinicianStats?.cliniciansThisWeek || 0,
                  icon: <Calendar size={18} />,
                },
              ].map((item, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderRadius: 2,
                      backdropFilter: "blur(10px)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Box sx={{ mr: 0.75, opacity: 0.9 }}>{item.icon}</Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Case Distribution Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                },
                height: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{ bgcolor: "#F3E5F5", color: "#7B1FA2", mr: 1.5 }}
                  >
                    <Clipboard size={20} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color="text.primary"
                  >
                    Case Distribution
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ height: 280 }}>
                  {caseTypeData.length > 0 ? (
                    <PieChartCard
                      title=""
                      data={caseTypeData}
                      dataKey="value"
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No case data available
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    color="text.primary"
                    sx={{ mb: 2 }}
                  >
                    Total Signed Cases:{" "}
                    <span style={{ color: "#7B1FA2" }}>
                      {dashboardStats.caseStats?.signedCases || 0}
                    </span>
                  </Typography>
                  <MuiButton
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/signedcasehistory")}
                    sx={{
                      bgcolor: "#7B1FA2",
                      "&:hover": { bgcolor: "#6A1B9A" },
                      py: 1,
                    }}
                    startIcon={<FileCheck size={18} />}
                  >
                    View Signed Cases
                  </MuiButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                },
                height: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{ bgcolor: "#E8F4FE", color: "#1565C0", mr: 1.5 }}
                    >
                      <Activity size={20} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      color="text.primary"
                    >
                      Recent Activity
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ maxHeight: 280, overflow: "auto", px: 0.5 }}>
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity, index) => (
                      <Paper
                        key={activity._id}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          border: "1px solid #f0f0f0",
                          boxShadow: "none",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                            borderColor: "#e0e0e0",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <Avatar
                            sx={{
                              bgcolor: "#E8F4FE",
                              color: "#1565C0",
                              width: 36,
                              height: 36,
                              mr: 1.5,
                              mt: 0.5,
                            }}
                          >
                            {activity.action === "SIGN" ? (
                              <Check size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="600">
                              {activity.description}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(activity.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent activity
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions Section */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography
              variant="h6"
              fontWeight="700"
              color="text.primary"
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                pl: 1,
                borderLeft: "4px solid #7B1FA2",
                py: 0.5,
              }}
            >
              <BoltIcon sx={{ color: "#7B1FA2" }} />
              Quick Actions
            </Typography>

            <Grid container spacing={2}>
              {[
                {
                  title: "Manage Clinicians",
                  description: "View and manage your clinician team",
                  icon: <Users size={30} />,
                  color: "#7B1FA2",
                  bgColor: "#F3E5F5",
                  path: "/clinicianlist",
                },
                {
                  title: "Penalty and Signed Cases",
                  description: "Review your signed and penalty case history",
                  icon: <FileCheck size={30} />,
                  color: "#1565C0",
                  bgColor: "#E3F2FD",
                  path: "/signedcasehistory",
                },
                {
                  title: "My Profile",
                  description: "View and manage your profile",
                  icon: <User size={30} />,
                  color: "#E91E63",
                  bgColor: "#FCE4EC",
                  path: "/profile",
                },
              ].map((action, index) => (
                <Grid item xs={6} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 12px 30px ${action.color}25`,
                      },
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(action.path)}
                      sx={{
                        height: "100%",
                        p: 0,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          height: { xs: 100, sm: 120 },
                          bgcolor: action.bgColor,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: action.color,
                            width: { xs: 50, sm: 60 },
                            height: { xs: 50, sm: 60 },
                          }}
                        >
                          {action.icon}
                        </Avatar>
                      </Box>
                      <CardContent
                        sx={{
                          textAlign: "center",
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Clinical Chair Dashboard - using the same mobile card design
  const renderClinicalChairDashboard = () => {
    if (!userData) return null;

    // Transform data for charts
    const prepareChartData = () => {
      if (!dashboardStats) return null;

      // Format patient gender data
      const genderData =
        dashboardStats.patientStats.demographics.genderDistribution.map(
          (item) => ({
            name: item._id,
            value: item.count,
          })
        );

      // Format patient age groups data
      const ageData = dashboardStats.patientStats.demographics.ageGroups.map(
        (item) => ({
          name: item._id,
          value: item.count,
        })
      );

      // Format user role data
      const roleData = dashboardStats.userStats.counts.roleDistribution.map(
        (item) => ({
          name: item._id,
          value: item.count,
        })
      );

      // Format audit activity data
      const activityData = dashboardStats.auditStats.recentActivity.map(
        (item) => ({
          date: item._id,
          logs: item.count,
        })
      );

      // Format action types data
      const actionData = dashboardStats.auditStats.actionTypes.map((item) => ({
        name: item._id,
        count: item.count,
      }));

      return { genderData, ageData, roleData, activityData, actionData };
    };

    const chartData = prepareChartData();

    // Get system summary metrics
    const totalPatients = userData.patients?.total || 0;
    const totalInstructors = userData.instructors?.total || 0;
    const totalClinicians = userData.clinicians?.total || 0;
    const totalUsers = totalInstructors + totalClinicians;
    const totalCases =
      (userData.cases?.signed || 0) + (userData.cases?.current || 0);

    return (
      <Box sx={{ py: 3, px: { xs: 1, sm: 2 } }}>
        {/* Dashboard Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            background: "linear-gradient(120deg, #4040DD 0%, #5858FE 100%)",
            color: "white",
            mb: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "40%",
              height: "100%",
              opacity: 0.1,
              background:
                "url('https://ik.imagekit.io/tfme5aczh/pattern-white.png')",
              backgroundSize: "cover",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h5" fontWeight="800" sx={{ mb: 1 }}>
              Welcome back, {userData.username || userData.name}! 👋
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Here's what's happening across the departments
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Patients
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totalPatients}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Users
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totalUsers}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Cases
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totalCases}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Today's Activity
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {chartData?.activityData?.[
                      chartData.activityData.length - 1
                    ]?.logs || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Dashboard Analytics Tabs */}
        {chartData && (
          <Paper
            elevation={0}
            sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#f8f9fa",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTabs-indicator": { backgroundColor: "#4040DD" },
                  "& .MuiTab-root.Mui-selected": { color: "#4040DD" },
                }}
              >
                <Tab
                  label="Overview"
                  icon={<GridViewIcon fontSize="small" />}
                  iconPosition="start"
                />
                <Tab
                  label="Patient Analytics"
                  icon={<PersonIcon fontSize="small" />}
                  iconPosition="start"
                />
                <Tab
                  label="User Analytics"
                  icon={<GroupIcon fontSize="small" />}
                  iconPosition="start"
                />
                <Tab
                  label="System Activity"
                  icon={<TimelineIcon fontSize="small" />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <LineChartCard
                    title="Recent System Activity"
                    data={chartData.activityData}
                    xKey="date"
                    yKey="logs"
                    description="Daily activity logs tracked across the system for the past 7 days"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <PieChartCard
                    title="User Distribution"
                    data={chartData.roleData}
                    dataKey="value"
                    description="Breakdown of users by their role in the system"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChartCard
                    title="Patient Age Demographics"
                    data={chartData.ageData}
                    xKey="name"
                    yKey="value"
                    description="Distribution of patients by age groups"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChartCard
                    title="System Activities"
                    data={chartData.actionData}
                    xKey="name"
                    yKey="count"
                    description="Distribution of actions performed in the system"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Patient Analytics Tab */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <PieChartCard
                    title="Patient Gender Distribution"
                    data={chartData.genderData}
                    dataKey="value"
                    description="Breakdown of patients by gender"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChartCard
                    title="Patient Age Groups"
                    data={chartData.ageData}
                    xKey="name"
                    yKey="value"
                    description="Distribution of patients by age range"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      color="text.primary"
                      sx={{ mb: 2 }}
                    >
                      Patient Management
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <MuiButton
                          fullWidth
                          variant="contained"
                          startIcon={<PeopleIcon />}
                          onClick={() => navigate("/allpatientdashboard")}
                          sx={{
                            p: 1.5,
                            bgcolor: "#4040DD",
                            "&:hover": { bgcolor: "#3636C2" },
                          }}
                        >
                          View All Patients
                        </MuiButton>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* User Analytics Tab */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <PieChartCard
                    title="User Role Distribution"
                    data={chartData.roleData}
                    dataKey="value"
                    description="Breakdown of users by their role in the system"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  {dashboardStats?.userStats?.counts?.statusDistribution && (
                    <PieChartCard
                      title="User Status"
                      data={dashboardStats.userStats.counts.statusDistribution.map(
                        (item) => ({
                          name:
                            item._id.charAt(0).toUpperCase() +
                            item._id.slice(1),
                          value: item.count,
                        })
                      )}
                      dataKey="value"
                      description="Distribution of user account statuses"
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      color="text.primary"
                      sx={{ mb: 2 }}
                    >
                      User Management
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <MuiButton
                          fullWidth
                          variant="contained"
                          startIcon={<SchoolIcon />}
                          onClick={() => navigate("/clinicalInstructorlist")}
                          sx={{
                            p: 1.5,
                            bgcolor: "#4040DD",
                            "&:hover": { bgcolor: "#3636C2" },
                          }}
                        >
                          Clinical Instructors
                        </MuiButton>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MuiButton
                          fullWidth
                          variant="contained"
                          startIcon={<MedicalServicesIcon />}
                          onClick={() => navigate("/clinicianlist")}
                          sx={{
                            p: 1.5,
                            bgcolor: "#4040DD",
                            "&:hover": { bgcolor: "#3636C2" },
                          }}
                        >
                          Clinicians
                        </MuiButton>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MuiButton
                          fullWidth
                          variant="outlined"
                          startIcon={<ManageAccountsIcon />}
                          onClick={() =>
                            navigate("/chinicalchair/user/accounts")
                          }
                          sx={{ p: 1.5 }}
                        >
                          Account Management
                        </MuiButton>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* System Activity Tab */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <LineChartCard
                    title="Daily System Activity (Last 7 Days)"
                    data={chartData.activityData}
                    xKey="date"
                    yKey="logs"
                    description="Trend of daily system activity over the past week"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChartCard
                    title="Actions by Type"
                    data={chartData.actionData}
                    xKey="name"
                    yKey="count"
                    description="Distribution of different actions performed in the system"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChartCard
                    title="Actions by Role"
                    data={dashboardStats?.auditStats?.actionsByRole.map(
                      (item) => ({
                        name: item._id,
                        count: item.count,
                      })
                    )}
                    xKey="name"
                    yKey="count"
                    description="Actions performed broken down by user roles"
                  />
                </Grid>
                <Grid item xs={12}>
                  <MuiButton
                    fullWidth
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate("/chinicalchair/get/auditlog")}
                    sx={{
                      p: 1.5,
                      bgcolor: "#4040DD",
                      "&:hover": { bgcolor: "#3636C2" },
                    }}
                  >
                    View Full Audit Log Report
                  </MuiButton>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        )}

        {/* Quick Actions Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight="700"
            color="text.primary"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <BoltIcon sx={{ color: "#4040DD" }} />
            Quick Actions
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 36px rgba(64, 64, 221, 0.15)",
                  },
                  height: "100%",
                }}
              >
                <CardActionArea
                  onClick={() => navigate("/chinicalchair/get/auditlog")}
                  sx={{ height: "100%", p: 0 }}
                >
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: "#E8F4FE",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#3B82F6",
                        width: 60,
                        height: 60,
                      }}
                    >
                      <Building size={30} />
                    </Avatar>
                  </Box>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Audit Logs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View all system activities and logs
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 36px rgba(16, 185, 129, 0.15)",
                  },
                  height: "100%",
                }}
              >
                <CardActionArea
                  onClick={() => navigate("/profile")}
                  sx={{ height: "100%", p: 0 }}
                >
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: "#ECFDF5",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#10B981",
                        width: 60,
                        height: 60,
                      }}
                    >
                      <Briefcase size={30} />
                    </Avatar>
                  </Box>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Profile Viewer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage your profile
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 36px rgba(139, 92, 246, 0.15)",
                  },
                  height: "100%",
                }}
              >
                <CardActionArea
                  onClick={() => navigate("/chinicalchair/user/accounts")}
                  sx={{ height: "100%", p: 0 }}
                >
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: "#F5F3FF",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#8B5CF6",
                        width: 60,
                        height: 60,
                      }}
                    >
                      <UserCheck size={30} />
                    </Avatar>
                  </Box>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Account Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage accounts within the system
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 36px rgba(239, 68, 68, 0.15)",
                  },
                  height: "100%",
                }}
              >
                <CardActionArea
                  onClick={() => navigate("/clinicianlist")}
                  sx={{ height: "100%", p: 0 }}
                >
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: "#FEF2F2",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#EF4444",
                        width: 60,
                        height: 60,
                      }}
                    >
                      <Calendar size={30} />
                    </Avatar>
                  </Box>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Clinician List
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage clinicians
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  // Tab Panel component
  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
        style={{ padding: "24px" }}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    );
  };

  // Render appropriate dashboard based on role
  const renderDashboardByRole = () => {
    if (!user || !user.role) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="h6">Loading dashboard...</Typography>
        </Box>
      );
    }

    switch (user.role) {
      case "Clinician":
        return renderClinicianDashboard();
      case "Clinical Instructor":
        return renderClinicalInstructorDashboard();
      case "Clinical Chair":
        return renderClinicalChairDashboard();
      default:
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">
              Dashboard not available for this role
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {user.role || "Unknown"}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <>{dashboardLoading ? <LoadingDashboard /> : renderDashboardByRole()}</>
  );
};

export default Dashboard;
