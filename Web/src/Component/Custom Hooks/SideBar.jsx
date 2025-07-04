import React, { useContext, useState, useEffect, useRef } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router";
import axios from "axios";
import { App } from "antd";
import { API_URL } from "../../config/api";

const SideBar = ({
  sidebarVisible,
  closeSidebar,
}) => {
  const { user, dispatch } = useContext(UserContext);
  const { message } = App.useApp();
  const [activeItem, setActiveItem] = useState("");
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Handle clicks outside the sidebar to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    }

    // Only add the listener if the sidebar is visible
    if (sidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible, closeSidebar]);

  // Prevent back navigation after logout
  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    // Add event listener for back button
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  // Set active item based on current URL
  useEffect(() => {
    const path = window.location.pathname.split("/")[1] || "dashboard";
    setActiveItem(path);
  }, []);

  const handleMenuClick = (itemKey, href) => {
    setActiveItem((prev) => (prev === itemKey ? "" : itemKey));
    closeSidebar(); // Close sidebar after navigation
    navigate(`/${href || itemKey}`);
  };

  const handleLogout = async () => {
    try {
      // Show loading message
      message.loading("Logging out...", 0);

      // Set flag in sessionStorage to track logout
      sessionStorage.setItem("userLoggedOut", "true");

      // Clear all cookies
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        const domains = [
          window.location.hostname,
          `.${window.location.hostname}`,
          "localhost",
          ".localhost",
        ];
        const paths = ["/", "/dashboard", "/"];

        domains.forEach((domain) => {
          paths.forEach((path) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
          });
        });
      });

      // Make logout API call
      try {
        await axios.post(
          `${API_URL}/logout`,
          {},
          {
            withCredentials: true,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
      } catch {
        console.log("API logout failed, but continuing with local logout");
      }

      // Clear session storage and local storage
      sessionStorage.clear();
      localStorage.clear();

      // Prevent navigation history
      window.history.pushState(null, "", "/");

      // Destroy loading message
      message.destroy();
      message.success("Logged out successfully");

      // IMPORTANT: Dispatch logout at the end, right before navigation
      dispatch({ type: "LOGOUT" });

      // // Use a single navigation method without setTimeout
      // window.location.replace("/");
    } catch (err) {
      console.error("Error during logout:", err);
      message.destroy();
      message.warning("Logged out locally");

      // Clear contexts and storage
      dispatch({ type: "LOGOUT" });
      sessionStorage.clear();
      localStorage.clear();

      // Single navigation call
      window.location.replace("/");
    }
  };

  // Overlay style for sidebar backdrop
  const overlayStyle = {
    display: sidebarVisible ? "block" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    transition: "opacity 0.3s ease",
    opacity: sidebarVisible ? 1 : 0,
    cursor: "pointer",
  };

  // Modern sidebar container style with glassmorphism effect
  const sidebarContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 2000,
    width: "280px", // Slightly wider for better content space
    background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: `
      0 25px 50px -12px rgba(0, 0, 128, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.05)
    `,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    borderRight: "1px solid rgba(0, 0, 128, 0.1)",
  };

  return (
    <>
      {/* Dark overlay for sidebar backdrop with explicit close handler */}
      <div
        style={overlayStyle}
        onClick={() => closeSidebar()}
        aria-hidden="true"
      ></div>

      {/* True overlay sidebar with fixed height structure */}
      <div
        ref={sidebarRef}
        style={sidebarContainerStyle}
        className="overlay-sidebar"
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Modern header with gradient and improved styling */}
        <div
          className="sidebar-header"
          style={{
            padding: "24px 20px",
            background: "linear-gradient(135deg, #000080 0%, #0066cc 100%)",
            color: "white",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            position: "relative",
            boxShadow: "0 4px 20px rgba(0, 0, 128, 0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: "1",
                gap: "12px",
              }}
            >
              {/* Tooth Icon - Bigger with White Background */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.5)",
                  overflow: "hidden",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                }}
              >
                <img
                  src="/tooth.png"
                  alt="Dental Tooth Icon"
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.35rem",
                    fontWeight: "700",
                    letterSpacing: "0.3px",
                    textShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                    background: "linear-gradient(45deg, #ffffff, #f0f8ff)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  NUSmilePH
                </h2>
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "0.75rem",
                    opacity: 0.8,
                    fontWeight: "300",
                    letterSpacing: "0.5px",
                    color: "#e6f3ff",
                  }}
                >
                  Dental Management
                </p>
              </div>
            </div>

            {/* Subtle Close Button - Red on Hover */}
            <button
              onClick={closeSidebar}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "12px",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
                backdropFilter: "blur(5px)",
              }}
              aria-label="Close menu"
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.8)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(220, 38, 38, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Simple and clean close icon */}
              <span 
                style={{
                  fontSize: "16px",
                  fontWeight: "300",
                  lineHeight: "1",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                ×
              </span>
            </button>
          </div>
        </div>
        <Sidebar
          backgroundColor="transparent"
          collapsed={false}
          rootStyles={{
            height: "100%",
            borderRight: "none",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            background: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "0",
            }}
          >
            {/* User info section with modern design */}
            {user && (
              <div
                style={{
                  padding: "20px",
                  background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
                  borderBottom: "1px solid rgba(0, 0, 128, 0.08)",
                  margin: "0",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {/* User avatar placeholder */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #000080 0%, #0066cc 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "18px",
                      boxShadow: "0 4px 12px rgba(0, 0, 128, 0.2)",
                    }}
                  >
                    {(user.username || "U").charAt(0).toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                        fontSize: "15px",
                        color: "#000080",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.username || "User"}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#6b7280",
                        fontWeight: "400",
                      }}
                    >
                      {user.role || "Role not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Menu
              style={{
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "8px 0",
                border: "none",
              }}
              menuItemStyles={{
                button: ({ active }) => ({
                  color: active ? "#000080" : "#374151",
                  fontSize: "14px",
                  fontWeight: active ? "600" : "500",
                  padding: "12px 20px",
                  margin: "2px 16px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  backgroundColor: active 
                    ? "linear-gradient(135deg, #f0f5ff 0%, #e6f3ff 100%)" 
                    : "transparent",
                  border: active 
                    ? "1px solid rgba(0, 0, 128, 0.15)" 
                    : "1px solid transparent",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    backgroundColor: active 
                      ? "linear-gradient(135deg, #e6f3ff 0%, #dbeafe 100%)"
                      : "rgba(0, 0, 128, 0.04)",
                    borderColor: "rgba(0, 0, 128, 0.1)",
                    transform: "translateX(2px)",
                    boxShadow: "0 2px 8px rgba(0, 0, 128, 0.08)",
                  },
                  "&:active": {
                    transform: "translateX(1px) scale(0.98)",
                  },
                  "&::before": {
                    content: "''",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: active ? "4px" : "0",
                    height: "100%",
                    backgroundColor: "#000080",
                    borderRadius: "0 4px 4px 0",
                    transition: "width 0.2s ease",
                  }
                }),
                subMenuContent: {
                  backgroundColor: "rgba(248, 250, 255, 0.5)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  margin: "4px 16px",
                  border: "1px solid rgba(0, 0, 128, 0.08)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "hidden",
                },
                label: {
                  fontWeight: "600",
                  color: "#1f2937",
                },
              }}            >
              {/* Main navigation items */}
              <div style={{ flexGrow: 0, padding: "8px 0" }}>
                <MenuItem
                  active={activeItem === "dashboard"}
                  onClick={() => handleMenuClick("dashboard")}
                >
                  <span style={{ fontSize: "16px", marginRight: "8px" }}>🏠</span>
                  Dashboard
                </MenuItem>

                {/* Patient Menu - Only for Clinicians */}
                {user?.role === "Clinician" && (
                  <SubMenu 
                    label={
                      <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "16px" }}>👤</span>
                        Patient
                      </span>
                    }
                    defaultOpen={false}
                  >
                    <MenuItem
                      active={activeItem === "allpatientdashboard"}
                      onClick={() => handleMenuClick("allpatientdashboard")}
                    >
                      <span style={{ fontSize: "14px", marginRight: "8px" }}>📋</span>
                      Patients
                    </MenuItem>
                    <MenuItem
                      active={activeItem === "patientdata"}
                      onClick={() => handleMenuClick("patientdata")}
                    >
                      <span style={{ fontSize: "14px", marginRight: "8px" }}>➕</span>
                      Add Patient
                    </MenuItem>
                  </SubMenu>
                )}

                {/* For Clinical Chair role - show only Patient List */}
                {user?.role === "Clinical Chair" && (
                  <MenuItem
                    active={activeItem === "allpatientdashboard"}
                    onClick={() => handleMenuClick("allpatientdashboard")}
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>👤</span>
                    Patients
                  </MenuItem>
                )}

                {/* Calendar Menu - Only for Clinicians */}
                {user?.role === "Clinician" && (
                  <SubMenu 
                    label={
                      <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "16px" }}>📅</span>
                        Calendar
                      </span>
                    }
                    defaultOpen={false}
                  >
                    <MenuItem
                      active={activeItem === "appointments"}
                      onClick={() => handleMenuClick("appointments")}
                    >
                      <span style={{ fontSize: "14px", marginRight: "8px" }}>📋</span>
                      Appointments
                    </MenuItem>
                    <MenuItem
                      active={activeItem === "appointmentForm"}
                      onClick={() =>
                        handleMenuClick("setAppointments", "setAppointments")
                      }
                    >
                      <span style={{ fontSize: "14px", marginRight: "8px" }}>➕</span>
                      Set Appointments
                    </MenuItem>
                  </SubMenu>
                )}

                {/* Progress Tracker Menu - Only for Clinicians */}
                {user?.role === "Clinician" && (
                  <SubMenu 
                    label={
                      <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "16px" }}>📊</span>
                        Progress Tracker
                      </span>
                    }
                    defaultOpen={false}
                  >
                    <MenuItem
                      active={activeItem === "progress"}
                      onClick={() => handleMenuClick("progress/IA")}
                    >
                      <span style={{ fontSize: "14px", marginRight: "8px" }}>📈</span>
                      Progress
                    </MenuItem>
                    <MenuItem
                      active={activeItem === "casehistory"}
                      onClick={() => handleMenuClick("casehistory")}
                    >
                      <span style={{ fontSize: "14px", marginRight: "8px" }}>📄</span>
                      Submitted Case History
                    </MenuItem>
                  </SubMenu>
                )}

                {/* Account Management - Only for Clinical Chair */}
                {user?.role === "Clinical Chair" && (
                  <MenuItem
                    active={activeItem === "/chinicalchair/user/accounts"}
                    onClick={() =>
                      handleMenuClick("chinicalchair/user/accounts")
                    }
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>⚙️</span>
                    Account Management
                  </MenuItem>
                )}

                {/* Clinician List - For Clinical Instructor and Clinical Chair */}
                {(user?.role === "Clinical Instructor" ||
                  user?.role === "Clinical Chair") && (
                  <MenuItem
                    active={activeItem === "clinicianlist"}
                    onClick={() => handleMenuClick("clinicianlist")}
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>👨‍⚕️</span>
                    Clinician List
                  </MenuItem>
                )}

                {/* Clinical Instructor List - Only for Clinical Chair */}
                {user?.role === "Clinical Chair" && (
                  <MenuItem
                    active={activeItem === "clinicalInstructorlist"}
                    onClick={() => handleMenuClick("clinicalInstructorlist")}
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>👩‍🏫</span>
                    Clinical Instructor List
                  </MenuItem>
                )}

                {/* Signed Case History - For Clinical Instructor and Clinical Chair */}
                {(user?.role === "Clinical Instructor" ||
                  user?.role === "Clinical Chair") && (
                  <MenuItem
                    active={activeItem === "signedcasehistory"}
                    onClick={() => handleMenuClick("signedcasehistory")}
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>✅</span>
                    Signed Case History
                  </MenuItem>
                )}

                {/* Audit Logs - Only for Clinical Chair */}
                {user?.role === "Clinical Chair" && (
                  <MenuItem
                    active={activeItem === "/chinicalchair/get/auditlog"}
                    onClick={() =>
                      handleMenuClick("chinicalchair/get/auditlog")
                    }
                  >
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>📝</span>
                    Audit Logs
                  </MenuItem>
                )}
              </div>

              {/* Spacer to push logout to bottom */}
              <div style={{ flexGrow: 1 }}></div>

              {/* Modern logout button */}
              <div 
                style={{ 
                  padding: "16px",
                  borderTop: "1px solid rgba(0, 0, 128, 0.08)",
                  background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
                }}
              >
                <MenuItem
                  active={activeItem === "logout"}
                  onClick={() => handleLogout()}
                  style={{
                    margin: "0",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    color: "#dc2626",
                    fontWeight: "600",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #fecaca 0%, #fee2e2 100%)",
                      borderColor: "rgba(220, 38, 38, 0.3)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
                    }
                  }}
                >
                  <span style={{ fontSize: "16px", marginRight: "8px" }}>🚪</span>
                  Logout
                </MenuItem>
              </div>
            </Menu>
          </div>
        </Sidebar>
      </div>
    </>
  );
};

export default SideBar;
