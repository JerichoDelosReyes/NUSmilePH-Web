import React, { useContext, useState, useEffect, useRef } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router";
import axios from "axios";
import { App } from "antd";
import { API_URL } from "../../config/api";

const SideBar = ({
  isCollapsed = true,
  isMobile,
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
      } catch (apiError) {
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

  // Updated sidebar container style - removed top padding
  const sidebarContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 2000,
    paddingTop: 0, // Removed padding top to eliminate dead space
    width: "250px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "transform 0.3s ease",
    transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
    pointerEvents: "auto",
    display: "flex", // Added for better layout control
    flexDirection: "column", // Ensure column layout
    overflowY: "auto", // Enable scrolling for long menus
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
        {/* Navy blue header with white text */}
        <div
          className="sidebar-header"
          style={{
            padding: "22px 15px 18px",
            backgroundColor: "#000080",
            color: "white",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundImage: "linear-gradient(to bottom, #000099, #000080)",
          }}
        >
          {/* Two-row layout to avoid overlapping */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: "4px",
            }}
          >
            {/* Logo and app name in left section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: "1",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                style={{
                  marginRight: "10px",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                }}
              >
                <path
                  fill="white"
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12,5.5A6.5,6.5 0 0,0 5.5,12A6.5,6.5 0 0,0 12,18.5A6.5,6.5 0 0,0 18.5,12A6.5,6.5 0 0,0 12,5.5"
                />
              </svg>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  textShadow: "0px 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                NUSmilePH
              </h2>
            </div>

            {/* Close button in right section */}
            <button
              onClick={closeSidebar}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                color: "#ffffff",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                margin: "0 0 0 8px", // Add margin to separate from title
              }}
              aria-label="Close menu"
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
          </div>

          {/* Optional subtitle - uncomment if needed */}
          {/* <div style={{ 
    fontSize: "0.75rem", 
    opacity: 0.85,
    fontWeight: "300",
    letterSpacing: "0.5px",
    textAlign: "center",
    marginTop: "4px" 
  }}>
    Dental Management System
  </div> */}
        </div>
        <Sidebar
          backgroundColor="#ffffff"
          collapsed={false}
          rootStyles={{
            height: "100%",
            borderRight: "1px solid #e0e0e0",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Menu wrapper div to ensure proper height */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Menu
              style={{
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                height: "100%", // Ensure menu takes full height
              }}
              menuItemStyles={{
                button: ({ level, active }) => ({
                  color: "#333",
                  fontSize: "16px",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: active ? "#f0f5ff" : "transparent", // Lighter background for active items
                  borderLeft: active
                    ? "4px solid #000080" // Navy blue left border
                    : "4px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f0f5ff", // Lighter hover background
                    borderLeft: "4px solid #000080", // Navy blue left border on hover
                  },
                  "&.active": {
                    backgroundColor: "#f0f5ff !important",
                    color: "#000080 !important", // Navy blue text for active items
                  },
                }),
                subMenuContent: {
                  backgroundColor: "#ffffff",
                  transition: "height 0.3s ease",
                },
              }}
            >
              {/* User info section - Moved to top with navy blue accent */}
              {user && (
                <div
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #e0e0e0",
                    marginBottom: "10px",
                    backgroundImage:
                      "linear-gradient(to right, #f0f5ff, #ffffff)", // Lighter gradient
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "5px",
                      color: "#000080",
                    }}
                  >
                    {" "}
                    {/* Navy blue user name */}
                    {user.username || "User"}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#555" }}>
                    {user.role || "Role not assigned"}
                  </div>
                </div>
              )}

              {/* Main menu content in a separate div with flex */}
              <div style={{ flexGrow: 0 }}>
                <MenuItem
                  active={activeItem === "dashboard"}
                  onClick={() => handleMenuClick("dashboard")}
                >
                  Dashboard
                </MenuItem>

                {/* Patient Menu - Only for Clinicians */}
                {user?.role === "Clinician" && (
                  <SubMenu label="Patient" defaultOpen={false}>
                    <MenuItem
                      active={activeItem === "allpatientdashboard"}
                      onClick={() => handleMenuClick("allpatientdashboard")}
                    >
                      Patients
                    </MenuItem>
                    <MenuItem
                      active={activeItem === "patientdata"}
                      onClick={() => handleMenuClick("patientdata")}
                    >
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
                    Patients
                  </MenuItem>
                )}

                {/* Calendar Menu - Only for Clinicians */}
                {user?.role === "Clinician" && (
                  <SubMenu label="Calendar" defaultOpen={false}>
                    <MenuItem
                      active={activeItem === "appointments"}
                      onClick={() => handleMenuClick("appointments")}
                    >
                      Appointments
                    </MenuItem>
                    <MenuItem
                      active={activeItem === "appointmentForm"}
                      onClick={() =>
                        handleMenuClick("setAppointments", "setAppointments")
                      }
                    >
                      Set Appointments
                    </MenuItem>
                  </SubMenu>
                )}

                {/* Progress Tracker Menu - Only for Clinicians */}
                {user?.role === "Clinician" && (
                  <SubMenu label="Progress Tracker" defaultOpen={false}>
                    <MenuItem
                      active={activeItem === "progress"}
                      onClick={() => handleMenuClick("progress/IA")}
                    >
                      Progress
                    </MenuItem>
                    <MenuItem
                      active={activeItem === "casehistory"}
                      onClick={() => handleMenuClick("casehistory")}
                    >
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
                    Clinician List
                  </MenuItem>
                )}

                {/* Clinical Instructor List - Only for Clinical Chair */}
                {user?.role === "Clinical Chair" && (
                  <MenuItem
                    active={activeItem === "clinicalInstructorlist"}
                    onClick={() => handleMenuClick("clinicalInstructorlist")}
                  >
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
                    Audit Logs
                  </MenuItem>
                )}
              </div>

              {/* Spacer to push logout to bottom */}
              <div style={{ flexGrow: 1 }}></div>

              {/* Logout - Available for all roles */}
              <div style={{ marginTop: "auto" }}>
                <MenuItem
                  active={activeItem === "logout"}
                  onClick={() => handleLogout()}
                  style={{
                    borderTop: "1px solid #e0e0e0",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#d32f2f",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
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
