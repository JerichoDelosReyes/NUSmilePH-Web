import React, { useContext, useEffect, useReducer, useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import "../Views/Styles/SocialHistory.css";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import { App } from "antd";
import {
  socialHistoryReducer,
  INITIAL_STATE,
} from "../Reducers/SocialHistoryReducer";
import API_ENDPOINTS from "../../config/api";

// Fake data generator for testing social history
const generateFakeSocialHistoryData = () => {
  // Smoking/Tobacco data
  const smokingTypes = [
    "Cigarettes",
    "E-cigarettes (Vaping)",
    "Cigars",
    "Pipe tobacco",
    "Chewing tobacco",
    "Hookah/Shisha",
    "Roll-your-own cigarettes",
    "Menthol cigarettes",
  ];

  const smokingFrequencies = [
    "1-5 cigarettes per day",
    "Half a pack per day (10 cigarettes)",
    "1 pack per day (20 cigarettes)",
    "2 packs per day",
    "Weekend only",
    "Social smoking (parties/events)",
    "Every few hours",
    "Chain smoker",
  ];

  const smokingDurations = [
    "6 months",
    "1 year",
    "2 years",
    "5 years",
    "10 years",
    "15 years",
    "20 years",
    "25+ years",
  ];

  const stoppedDurations = [
    "1 month ago",
    "3 months ago",
    "6 months ago",
    "1 year ago",
    "2 years ago",
    "5 years ago",
    "10 years ago",
    "15+ years ago",
  ];

  // Alcohol data
  const alcoholTypes = [
    "Beer",
    "Wine",
    "Hard liquor (whiskey, vodka, rum)",
    "Mixed drinks/cocktails",
    "Local wine (tuba, basi)",
    "Gin/Brandy",
    "All types of alcohol",
    "Light beer only",
  ];

  const alcoholFrequencies = [
    "Daily",
    "2-3 times per week",
    "Weekends only",
    "Social occasions only",
    "Monthly",
    "Special events only",
    "Binge drinking (weekends)",
    "Occasional (holidays)",
  ];

  // Drug data
  const drugTypes = [
    "Marijuana/Cannabis",
    "Cocaine",
    "Methamphetamine (shabu)",
    "Ecstasy/MDMA",
    "LSD",
    "Prescription painkillers (non-medical use)",
    "Heroin",
    "Multiple substances",
  ];

  const drugFrequencies = [
    "Daily",
    "Weekly",
    "Monthly",
    "Occasional (parties)",
    "Weekend use",
    "When stressed",
    "Social use only",
    "Experimental use",
  ];

  const getRandomElement = (array) =>
    array[Math.floor(Math.random() * array.length)];
  const getRandomBoolean = () => Math.random() < 0.4; // 40% chance of substance use
  const getRandomStoppedBoolean = () => Math.random() < 0.6; // 60% chance of having stopped if using

  // Generate smoking data with correct field names
  const smokingUses = getRandomBoolean();
  const smokingData = {
    uses: smokingUses,
    kind: smokingUses ? getRandomElement(smokingTypes) : "",
    frequency: smokingUses ? getRandomElement(smokingFrequencies) : "",
    duration_years: smokingUses ? getRandomElement(smokingDurations) : "",
    has_stopped: smokingUses ? getRandomStoppedBoolean() : false,
    has_stopped_years: "", // Changed from stopped_duration
  };

  if (smokingData.has_stopped) {
    smokingData.has_stopped_years = getRandomElement(stoppedDurations);
  }

  // Generate alcohol data with correct field names
  const alcoholUses = getRandomBoolean();
  const alcoholData = {
    uses: alcoholUses,
    kind: alcoholUses ? getRandomElement(alcoholTypes) : "",
    frequency: alcoholUses ? getRandomElement(alcoholFrequencies) : "",
    duration_years: alcoholUses ? getRandomElement(smokingDurations) : "",
    has_stopped: alcoholUses ? getRandomStoppedBoolean() : false,
    has_stopped_years: "", // Changed from stopped_duration
  };

  if (alcoholData.has_stopped) {
    alcoholData.has_stopped_years = getRandomElement(stoppedDurations);
  }

  // Generate drug data with correct field names (lower probability)
  const drugUses = Math.random() < 0.15; // 15% chance of drug use
  const drugData = {
    uses: drugUses,
    kind: drugUses ? getRandomElement(drugTypes) : "",
    frequency: drugUses ? getRandomElement(drugFrequencies) : "",
    duration_years: drugUses ? getRandomElement(smokingDurations) : "",
    has_stopped: drugUses ? getRandomStoppedBoolean() : false,
    has_stopped_years: "", // Changed from stopped_duration
  };

  if (drugData.has_stopped) {
    drugData.has_stopped_years = getRandomElement(stoppedDurations);
  }

  return {
    smoking: smokingData,
    alcohol: alcoholData,
    drug: drugData,
  };
};

const SocialHistory = () => {
  TitleHead("Patient's Social History");
  const { user, loading } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("action") === "edit";
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [state, dispatch] = useReducer(socialHistoryReducer, INITIAL_STATE);

  // Fake data generator function
  const handleGenerateFakeData = () => {
    const fakeData = generateFakeSocialHistoryData();

    // Update state with fake data
    dispatch({
      type: "HANDLE_UPDATE_SOCIAL_HISTORY",
      payload: fakeData,
    });

    messageApi.success("Fake social history data generated successfully! 🎲");
  };

  const getSocialHistory = async () => {
    await axios
      .get(`${API_ENDPOINTS.GET_SOCIAL_HISTORY(id)}`)
      .then((res) => {
        dispatch({
          type: "HANDLE_UPDATE_SOCIAL_HISTORY",
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isEdit) {
      getSocialHistory();
    }
  }, []);

  const handleChange = (key, e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "HANDLE_INPUTS",
      payload: { field: key, name, value, type, checked },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        const res = await axios.put(
          `${API_ENDPOINTS.UPDATE_SOCIAL_HISTORY(id)}`,
          state,
          { withCredentials: true }
        );
        console.log(res.data);
        messageApi.success(
          "Patient's Social History has been updated successfully!"
        );
        navigate(`/patient/${id}`);
      } else {
        const res = await axios.post(
          `${API_ENDPOINTS.CREATE_SOCIAL_HISTORY(id)}`,
          state,
          { withCredentials: true }
        );
        console.log(res.data);
        messageApi.success(
          "Patient's Social History has been saved successfully!"
        );
        navigate(`/patient/${id}`);
      }
    } catch (err) {
      console.error("Error saving social history:", err);

      // More detailed error handling
      if (err.response) {
        // Server responded with error status
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        messageApi.error(`Error saving Social History: ${errorMessage}`);
        console.error("Server error:", err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        messageApi.error(
          "Network error: Could not connect to server. Please check your connection."
        );
        console.error("Network error:", err.request);
      } else {
        // Something else happened
        messageApi.error(`Error saving Social History: ${err.message}`);
        console.error("Error:", err.message);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Social History</h4>

              {/* Development Tools - Only show in development */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleGenerateFakeData}
                  className="d-flex align-items-center gap-2"
                >
                  <span>🎲</span>
                  Generate Test Data
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Are you using/taking or have you used/taken any of the
                    following:
                  </Form.Label>

                  {/* Smoking Section */}
                  <Form.Check
                    type="checkbox"
                    label="Tobacco / Cigarettes / E-Cigarettes (Vaping)"
                    name="uses"
                    checked={state.smoking.uses}
                    onChange={(e) => handleChange("smoking", e)}
                  />

                  {state.smoking.uses && (
                    <>
                      <Form.Group className="mt-3">
                        <Form.Label>Kind:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="What kind you use?"
                          name="kind"
                          value={state.smoking.kind}
                          onChange={(e) => handleChange("smoking", e)}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>How often?</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="How often you use?"
                          name="frequency"
                          value={state.smoking.frequency}
                          onChange={(e) => handleChange("smoking", e)}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>How many years?</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="How many years you use?"
                          name="duration_years"
                          value={state.smoking.duration_years}
                          onChange={(e) => handleChange("smoking", e)}
                        />
                      </Form.Group>
                      <Form.Check
                        type="checkbox"
                        label="Have you stopped?"
                        name="has_stopped"
                        checked={state.smoking.has_stopped}
                        onChange={(e) => handleChange("smoking", e)}
                        className="mt-3"
                      />
                      {state.smoking.has_stopped && (
                        <Form.Group className="mt-3">
                          <Form.Label>How long ago?</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="How long have you stopped?"
                            name="has_stopped_years"
                            value={state.smoking.has_stopped_years}
                            onChange={(e) => handleChange("smoking", e)}
                          />
                        </Form.Group>
                      )}
                    </>
                  )}

                  {/* Alcohol Section */}
                  <Form.Check
                    type="checkbox"
                    label="Consume Alcohol"
                    name="uses"
                    checked={state.alcohol.uses}
                    onChange={(e) => handleChange("alcohol", e)}
                    className="mt-3"
                  />
                  {state.alcohol.uses && (
                    <>
                      <Form.Group className="mt-3">
                        <Form.Label>Kind:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="What kind you use?"
                          name="kind"
                          value={state.alcohol.kind}
                          onChange={(e) => handleChange("alcohol", e)}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>How often?</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="How often you use?"
                          name="frequency"
                          value={state.alcohol.frequency}
                          onChange={(e) => handleChange("alcohol", e)}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>How many years?</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="How many years you use?"
                          name="duration_years"
                          value={state.alcohol.duration_years}
                          onChange={(e) => handleChange("alcohol", e)}
                        />
                      </Form.Group>
                      <Form.Check
                        type="checkbox"
                        label="Have you stopped?"
                        name="has_stopped"
                        checked={state.alcohol.has_stopped}
                        onChange={(e) => handleChange("alcohol", e)}
                        className="mt-3"
                      />
                      {state.alcohol.has_stopped && (
                        <Form.Group className="mt-3">
                          <Form.Label>How long ago?</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="How long have you stopped?"
                            name="has_stopped_years"
                            value={state.alcohol.has_stopped_years}
                            onChange={(e) => handleChange("alcohol", e)}
                          />
                        </Form.Group>
                      )}
                    </>
                  )}

                  {/* Drugs Section */}
                  <Form.Check
                    type="checkbox"
                    label="Drugs for Recreation"
                    name="uses"
                    checked={state.drug.uses}
                    onChange={(e) => handleChange("drug", e)}
                    className="mt-3"
                  />
                  {state.drug.uses && (
                    <>
                      <Form.Group className="mt-3">
                        <Form.Label>Kind:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="What kind you use?"
                          name="kind"
                          value={state.drug.kind}
                          onChange={(e) => handleChange("drug", e)}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>How often?</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="How often you use?"
                          name="frequency"
                          value={state.drug.frequency}
                          onChange={(e) => handleChange("drug", e)}
                        />
                      </Form.Group>
                      <Form.Group className="mt-3">
                        <Form.Label>How many years?</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="How many years you use?"
                          name="duration_years"
                          value={state.drug.duration_years}
                          onChange={(e) => handleChange("drug", e)}
                        />
                      </Form.Group>
                      <Form.Check
                        type="checkbox"
                        label="Have you stopped?"
                        name="has_stopped"
                        checked={state.drug.has_stopped}
                        onChange={(e) => handleChange("drug", e)}
                        className="mt-3"
                      />
                      {state.drug.has_stopped && (
                        <Form.Group className="mt-3">
                          <Form.Label>How long ago?</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="How long have you stopped?"
                            name="has_stopped_years"
                            value={state.drug.has_stopped_years}
                            onChange={(e) => handleChange("drug", e)}
                          />
                        </Form.Group>
                      )}
                    </>
                  )}
                </Form.Group>

                {/* Form Action Buttons */}
                <div className="d-flex gap-3 mt-4">
                  <Button variant="primary" type="submit" className="flex-fill">
                    {isEdit ? "Update" : "Save"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-fill"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SocialHistory;
