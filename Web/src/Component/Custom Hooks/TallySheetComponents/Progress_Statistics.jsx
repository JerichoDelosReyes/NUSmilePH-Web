import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Container, Row, Col, ProgressBar, Alert, Spinner } from "react-bootstrap";
import { API_URL } from "../../../config/api";

export const ProgressStatistics = ({ clinicianId, clinicLevel }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/tallysheet/progress/${clinicianId}/${clinicLevel}`
        );
        setStatistics(response.data.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load progress statistics");
      } finally {
        setLoading(false);
      }
    };

    if (clinicianId && clinicLevel) fetchStatistics();
  }, [clinicianId, clinicLevel]);

  if (loading) return <div className="text-center py-2"><Spinner size="sm" animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger" className="py-2 mb-2">{error}</Alert>;
  if (!statistics) return <Alert variant="info" className="py-2 mb-2">No statistics available</Alert>;

  const getProgressColor = (percentage) => 
    percentage > 70 ? "success" : percentage > 30 ? "warning" : "danger";

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header className="bg-white py-2 d-flex align-items-center">
        <span className="material-symbols-outlined text-primary me-2" style={{ fontSize: "18px" }}>analytics</span>
        <span className="fw-bold">Progress Tracker</span>
      </Card.Header>

      <Card.Body className="py-2">
        <div className="progress-items">
          {statistics.progressOverview.map((progress, index) => (
            <div key={index} className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="text-truncate me-2" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {progress.name}
                </div>
                <span style={{ 
                  fontSize: "0.8rem", 
                  fontWeight: "bold",
                  color: getProgressColor(progress.completionPercentage) === "success" ? "#28a745" : 
                         getProgressColor(progress.completionPercentage) === "warning" ? "#ffc107" : "#dc3545"
                }}>
                  {progress.completionPercentage}%
                </span>
              </div>
              
              <ProgressBar
                now={progress.completionPercentage}
                variant={getProgressColor(progress.completionPercentage)}
                style={{ height: "6px" }}
                className="mb-1"
              />
              
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                {progress.progressText}
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};