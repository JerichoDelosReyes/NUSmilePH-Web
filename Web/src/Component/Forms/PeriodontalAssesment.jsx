import React, { useContext, useReducer } from "react";
import { Card, Row, Col, Form, Button, Container } from "react-bootstrap";
import { UserContext } from "../Context/UserContext";
import TitleHead from "../Custom Hooks/TitleHead";
import { useNavigate, useParams } from "react-router";
import { App } from "antd";
import axios from "axios";

// Import the modular table component and its styles
import PeriodontalTable from "../Custom Hooks/PeriodentalTable";
import API_ENDPOINTS from "../../config/api";

// Initialize tooth numbers and categories for all regions
const MaxillaTeeth = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];
const MandibleTeeth = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

const facialCategories = [
  "Mobility",
  "Suprasubgingival Calculus",
  "Bleeding/Purculence",
  "Attachment Loss (CEJ to BP)",
  "Recession (GM to CEJ)",
  "Probing Depth (GM to BP)",
];

const lingualCategories = [
  "Probing Depth (GM to BP)",
  "Recession (GM to CEJ)",
  "Attachment Loss (CEJ to BP)",
  "Bleeding/Purulence",
  "Plaque",
  "Suprasubgingival Calculus",
];

// Create initial state mapping each <region>-<view>-<category>-<tooth> to an empty string
const createInitialState = () => {
  let state = {};

  // Add Maxilla Facial entries
  MaxillaTeeth.forEach((num) => {
    facialCategories.forEach((cat) => {
      state[`maxilla-facial-${cat}-${num}`] = "";
    });
  });

  // Add Maxilla Lingual entries
  MaxillaTeeth.forEach((num) => {
    lingualCategories.forEach((cat) => {
      state[`maxilla-lingual-${cat}-${num}`] = "";
    });
  });

  // Add Mandible Facial entries
  MandibleTeeth.forEach((num) => {
    facialCategories.forEach((cat) => {
      state[`mandible-facial-${cat}-${num}`] = "";
    });
  });

  // Add Mandible Lingual entries
  MandibleTeeth.forEach((num) => {
    lingualCategories.forEach((cat) => {
      state[`mandible-lingual-${cat}-${num}`] = "";
    });
  });

  return state;
};

const INITIAL_STATE = createInitialState();

// Reducer to update individual fields
const periodontalReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    default:
      return state;
  }
};

const PeriodontalAssessment = () => {
  TitleHead("Periodontal Assessment");
  const { user } = useContext(UserContext);
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(periodontalReducer, INITIAL_STATE);
  const { message: messageApi } = App.useApp();

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", payload: { name, value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.CREATE_PERODONTAL_ASSESSMENT(id)}`,
        state,
        { withCredentials: true }
      );
      console.log("Success response:", response.data);
      messageApi.success("Data saved successfully");
      navigate(`/patient/${id}`);
    } catch (err) {
      console.error(
        "Error details:",
        err.response ? err.response.data : err.message
      );
      messageApi.error(
        `Error saving data: ${
          err.response
            ? err.response.data.message || err.response.statusText
            : err.message
        }`
      );
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12}>
          <h4 className="mb-4 fs-5 bg-primary text-white p-3 rounded">
            Periodontal Assessment
          </h4>
          <Form onSubmit={handleSubmit}>
            {/* Maxilla (Upper Jaw) Section */}
            <div className="section-maxilla mb-5">
              <h4 className="fw-bold text-primary mb-4">Maxilla (Upper Jaw)</h4>

              {/* Maxilla Facial View */}
              <h5 className="fw-bold my-3">Facial View</h5>
              <PeriodontalTable
                toothNumbers={MaxillaTeeth}
                categories={facialCategories}
                state={state}
                handleChange={handleChange}
                tableLabel="Maxilla-Facial"
                prefix="maxilla-facial"
              />

              {/* Maxilla Lingual View */}
              <h5 className="fw-bold my-3">Lingual/Palatal View</h5>
              <PeriodontalTable
                toothNumbers={MaxillaTeeth}
                categories={lingualCategories}
                state={state}
                handleChange={handleChange}
                tableLabel="Maxilla-Lingual"
                prefix="maxilla-lingual"
              />
            </div>

            {/* Mandible (Lower Jaw) Section */}
            <div className="section-mandible mb-5">
              <h4 className="fw-bold text-primary mb-4">
                Mandible (Lower Jaw)
              </h4>

              {/* Mandible Facial View */}
              <h5 className="fw-bold my-3">Facial View</h5>
              <PeriodontalTable
                toothNumbers={MandibleTeeth}
                categories={facialCategories}
                state={state}
                handleChange={handleChange}
                tableLabel="Mandible-Facial"
                prefix="mandible-facial"
              />

              {/* Mandible Lingual View */}
              <h5 className="fw-bold my-3">Lingual View</h5>
              <PeriodontalTable
                toothNumbers={MandibleTeeth}
                categories={lingualCategories}
                state={state}
                handleChange={handleChange}
                tableLabel="Mandible-Lingual"
                prefix="mandible-lingual"
              />
            </div>

            <div className="form-action-buttons mt-4">
              <Row className="g-2">
                <Col xs={12} md={6} className="order-md-2">
                  <Button variant="primary" type="submit" className="w-100">
                    Save and Continue
                  </Button>
                </Col>
                <Col xs={12} md={6} className="order-md-1">
                  <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                </Col>
              </Row>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default PeriodontalAssessment;
