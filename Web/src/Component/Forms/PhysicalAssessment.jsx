import React, { useContext, useEffect, useReducer, useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import MultiSelectDropdown from "../Custom Hooks/MultiSelectDropdown";
import TitleHead from "../Custom Hooks/TitleHead";
import { UserContext } from "../Context/UserContext";
import "../Views/Styles/PhysicalAssessment.css";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  assessmentReducer,
  INITIAL_STATE,
} from "../Reducers/AssessmentReducer";
import { faker } from "@faker-js/faker";
import { App } from "antd";
import { format, parseISO } from "date-fns";
import API_ENDPOINTS from "../../config/api";

const PhysicalAssessment = () => {
  TitleHead("Physical Assessment");
  const { user, loading } = useContext(UserContext);
  const [state, dispatch] = useReducer(assessmentReducer, INITIAL_STATE);
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("action") === "edit";
  const { message: messageApi } = App.useApp();

  const cardio = [
    { label: "High Blood Pressure", value: "High_Blood_Pressure" },
    { label: "Heart Attack", value: "Heart_Attack" },
    { label: "Pacemakers", value: "Pacemakers" },
    { label: "Artificial Heart Valves", value: "Artificial_Heart_Valves" },
    { label: "Angioplasty with Stent", value: "Angioplasty_with_Stent" },
    { label: "Stroke", value: "Stroke" },
    { label: "Angina Pectoris (Chest Pain)", value: "Angina_Pectoris" },
    { label: "Swollen Ankles", value: "Swollen_Ankles" },
  ];
  const respiratory = [
    { label: "Chronic Cough", value: "Chronic_Cough" },
    { label: "Bloody Sputum", value: "Bloody_Sputum" },
    { label: "Tuberculosis", value: "Tuberculosis" },
    { label: "Frequent High Fever", value: "Frequent_High_Fever" },
    { label: "Sinusitis", value: "Sinusitis" },
    { label: "Emphysema", value: "Emphysema" },
    { label: "Asthma", value: "Asthma" },
    { label: "Breathing Problems", value: "Breathing_Problems" },
    { label: "Afternoon Fever", value: "Afternoon_Fever" },
  ];

  const infectious = [
    { label: "Herpes/Cold Sores", value: "Herpes_Cold_Sores" },
    { label: "HIV Positive", value: "HIV_Positive" },
    {
      label: "Sexually Transmitted Disease",
      value: "Sexually_Transmitted_Disease",
    },
    { label: "Pain Upon Urination", value: "Pain_Upon_Urination" },
    { label: "Blood/Pus in Urine", value: "Blood_Pus_in_Urine" },
    { label: "Recreational Drug Use", value: "Recreational_Drug_Use" },
    { label: "Steroid Therapy", value: "Steroid_Therapy" },
    { label: "Fainting Spells", value: "Fainting_Spells" },
    { label: "Mental Health Disorder", value: "Mental_Health_Disorder" },
  ];

  const metabolic = [
    { label: "Diabetes", value: "Diabetes" },
    { label: "Osteoporosis", value: "Osteoporosis" },
    { label: "Bisphosphonates", value: "Bisphosphonates" },
    { label: "Goiter", value: "Goiter" },
    { label: "Frequent Thirst", value: "Frequent_Thirst" },
    { label: "Frequent Hunger", value: "Frequent_Hunger" },
    { label: "Frequent Urination", value: "Frequent_Urination" },
    { label: "Sudden Weight Loss", value: "Sudden_Weight_Loss" },
  ];

  const neurological = [
    { label: "Frequent Headaches", value: "Frequent_Headaches" },
    { label: "Dizziness", value: "Dizziness" },
    { label: "Visual Impairment", value: "Visual_Impairment" },
    { label: "Hearing Impairment", value: "Hearing_Impairment" },
    { label: "Arthritis", value: "Arthritis" },
    { label: "Pain in Joints", value: "Pain_in_Joints" },
    { label: "Tremors", value: "Tremors" },
  ];

  const digestive = [
    { label: "Abdominal Discomfort", value: "Abdominal_Discomfort" },
    { label: "Acidic Reflux", value: "Acidic_Reflux" },
    { label: "Bleeding or Bruising Easily", value: "Bleeding_Bruising_Easily" },
    { label: "Kidney/Liver Problems", value: "Kidney_Liver_Problems" },
    { label: "Hepatitis (A,B,C,D)", value: "Hepatitis" },
  ];

  const getFetchedData = async () => {
    try {
      const [physical, medical] = await Promise.all([
        axios.get(`${API_ENDPOINTS.GET_PHYSICAL_ASSESSMENT(id)}`),
        axios.get(`${API_ENDPOINTS.GET_MEDICAL_HEALTH(id)}`),
      ]);

      const formattedDate = format(
        new Date(physical.data.date),
        "yyyy-MM-dd'T'hh:mm"
      );

      const allergyInfo = medical.data.allergy_information || [];
      const allergy = [
        "allergies",
        "aspirin",
        "penicillin",
        "latex",
        "metal",
        "unknown",
        "none",
      ];
      const allergyArray = {
        ...state.allergy_inputs,
        ...Object.fromEntries(
          allergy.map((item) => [item, allergyInfo.includes(item)])
        ),
      };

      const otherConditions = allergyInfo.filter(
        (item) => !allergy.includes(item)
      );

      allergyArray.other_info = {
        ...state.allergy_inputs.other_info,
        other: otherConditions.length > 0,
        otherConditions,
      };

      const diagnosedConditions = medical.data.diagnosed_conditions || [];
      const allDropdownItems = [
        ...cardio,
        ...respiratory,
        ...infectious,
        ...metabolic,
        ...neurological,
        ...digestive,
      ].map((item) => item.value);
      const diagnosedArray = diagnosedConditions.filter((item) =>
        allDropdownItems.includes(item)
      );
      const otherDiagnosed = diagnosedConditions.filter(
        (item) => !allDropdownItems.includes(item)
      );

      const combinedData = {
        ...state,
        date: formattedDate,
        bp: physical.data.bp,
        pr: physical.data.pr,
        rr: physical.data.rr,
        temp: physical.data.temp,
        allergy_information: allergyInfo,
        allergy_inputs: allergyArray,
        physician_care: medical.data.physician_care,
        hospitalization: medical.data.hospitalization,
        illness: medical.data.illness,
        Inr_or_HbA1C: medical.data.Inr_or_HbA1C,
        medications: medical.data.medications,
        childhood_disease_history: medical.data.childhood_disease_history,
        diagnosed_conditions: diagnosedArray,
        diagnosed_others: otherDiagnosed.length > 0,
        otherDiagnosedConditions: otherDiagnosed,
      };
      console.log("Combined Data:", combinedData);
      dispatch({ type: "HANDLE_EXISTING_PATIENT", payload: combinedData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isEdit) {
      getFetchedData();
    }
  }, []);

  const handleChange = (e) => {
    dispatch({ type: "HANDLE_INPUT", payload: e.target });
  };

  const handleAllergyChange = (e) => {
    dispatch({ type: "HANDLE_ALLERGY", payload: e.target });
  };

  const handleOtherAllergyChange = (e) => {
    dispatch({ type: "HANDLE_OTHER_ALLERGY", payload: e.target });
  };

  const handleDiagnosedChange = (selected) => {
    const diagnosedConditions = selected.map((item) => item);

    dispatch({ type: "HANDLE_DIAGNOSED", payload: diagnosedConditions });
    console.log(state.diagnosed_conditions);
  };

  const handleOtherAllergyAdd = (e) => {
    const allergyText = state.otherText.split(/[ ,]+/);
    allergyText.map((item) => {
      dispatch({ type: "ADD_OTHER_ALLERGY", payload: item });
    });
  };

  const handleOtherAllergyRemove = (item) => {
    dispatch({ type: "REMOVE_OTHER_ALLERGY", payload: item });
  };

  const handleOtherDiagnosedAdd = (e) => {
    const diagnosedText = state.diagnosedText.split(/[ ,]+/);
    diagnosedText.map((item) => {
      dispatch({ type: "ADD_OTHER_DIAGNOSED", payload: item });
    });
  };

  const handleOtherDiagnosedRemove = (item) => {
    dispatch({ type: "REMOVE_OTHER_DIAGNOSED", payload: item });
  };

  const generateData = () => {
    const fakedata = {
      date: faker.date.past(),
      bp: faker.number.int({ min: 60, max: 120 }),
      pr: faker.number.int({ min: 60, max: 100 }),
      rr: faker.number.int({ min: 12, max: 20 }),
      temp: faker.number.float({ min: 36, max: 38, fractionDigits: 1 }),
      physician_care: faker.person.fullName(),
      hospitalization: faker.lorem.sentence(),
      illness: faker.lorem.sentence(),
      Inr_or_HbA1C: faker.number.int({ min: 0, max: 10 }),
      medications: faker.lorem.sentence(),
      childhood_disease_history: faker.lorem.sentence(),
      allergy_information: faker.helpers.arrayElements([
        "Aspirin",
        "Penicillin",
        "Latex",
        "Metal",
        "Unknown",
        "None",
      ]),
      diagnosed_conditions: faker.helpers.arrayElements([
        "High Blood Pressure",
        "Heart Attack",
        "Pacemakers",
        "Artificial Heart Valves",
      ]),
    };
    dispatch({ type: "GENERATE_DATA", payload: fakedata });
    console.log("State: ", state);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      date,
      bp,
      pr,
      rr,
      temp,
      physician_care,
      hospitalization,
      allergy_information,
      illness,
      Inr_or_HbA1C,
      medications,
      childhood_disease_history,
      diagnosed_conditions,
    } = state;

    // Fixed: Handle date properly with validation
    if (!date) {
      messageApi.error("Please select a date and time");
      return;
    }

    // Handle date/time extraction safely
    let time = "";
    if (typeof date === "string" && date.includes("T")) {
      time = date.split("T")[1];
    } else if (date) {
      // If date is a Date object, convert it to string first
      const dateString = new Date(date).toISOString().slice(0, 16);
      time = dateString.split("T")[1];
    }

    const physicalAssessmentData = { date, time, bp, pr, rr, temp };

    const medicalHistoryData = {
      hospitalization,
      allergy_information,
      illness,
      Inr_or_HbA1C,
      medications,
      childhood_disease_history,
      diagnosed_conditions,
      physician_care,
    };

    if (isEdit) {
      await Promise.all([
        axios.put(
          `${API_ENDPOINTS.UPDATE_PHYSICAL_ASSESSMENT(id)}`,
          physicalAssessmentData,
          { withCredentials: true }
        ),
        axios.put(
          `${API_ENDPOINTS.UPDATE_MEDICAL_HEALTH(id)}`,
          medicalHistoryData,
          { withCredentials: true }
        ),
      ])
        .then((res) => {
          console.log("Physical Assessment Data:", res[0].data);
          console.log("Medical History Data:", res[1].data);
          messageApi.success("Data updated successfully");
          dispatch({ type: "CLEAR_ALL_INPUTS" });
          navigate(`/patient/${id}`);
        })
        .catch((err) => {
          console.log("Error:", err);
          messageApi.error("Error updating data");
        });
    } else {
      await Promise.all([
        axios.post(
          `${API_ENDPOINTS.CREATE_PHYSICAL_ASSESSMENT(id)}`,
          physicalAssessmentData,
          { withCredentials: true }
        ),
        axios.post(
          `${API_ENDPOINTS.CREATE_MEDICAL_HEALTH(id)}`,
          medicalHistoryData,
          { withCredentials: true }
        ),
      ])
        .then((res) => {
          console.log("Physical Assessment Data:", res[0].data);
          console.log("Medical History Data:", res[1].data);
          messageApi.success("Data saved successfully");
          dispatch({ type: "CLEAR_ALL_INPUTS" });
          navigate(-1);
        })
        .catch((err) => {
          console.log("Error:", err);
          messageApi.error("Error saving data");
        });
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4>Physical Assessment</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Vital Signs: Date and Time Taken</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="date"
                    value={state.date}
                    onChange={handleChange}
                    placeholder="Enter Date and Time Taken"
                  />
                </Form.Group>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>BP (Blood Pressure)</Form.Label>
                      <Form.Control
                        type="text"
                        name="bp"
                        value={state.bp}
                        onChange={handleChange}
                        placeholder="Enter Blood Pressure"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>PR (Pulse Rate)</Form.Label>
                      <Form.Control
                        type="text"
                        name="pr"
                        value={state.pr}
                        onChange={handleChange}
                        placeholder="Enter Pulse Rate"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>RR (Respiratory Rate)</Form.Label>
                      <Form.Control
                        type="text"
                        name="rr"
                        value={state.rr}
                        onChange={handleChange}
                        placeholder="Enter Respiratory Rate"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Temp (Temperature)</Form.Label>
                      <Form.Control
                        type="text"
                        name="temp"
                        value={state.temp}
                        onChange={handleChange}
                        placeholder="Enter Temperature"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Card.Header className="bg-primary text-white mb-3">
                  <h4>Medical History</h4>
                </Card.Header>

                <Form.Group className="mb-3">
                  <Form.Label>Under physician's care?</Form.Label>
                  <Form.Control
                    type="text"
                    name="physician_care"
                    value={state.physician_care}
                    onChange={handleChange}
                    placeholder="Explain if applicable"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hospitalization</Form.Label>
                  <Form.Control
                    type="text"
                    name="hospitalization"
                    value={state.hospitalization}
                    onChange={handleChange}
                    placeholder="Explain if applicable"
                  />
                </Form.Group>

                <Form.Label>Check any of the following:</Form.Label>
                <div className="checkbox-options mb-3">
                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="allergies"
                      id="allergies"
                      checked={state.allergy_inputs.allergies}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label
                      htmlFor="allergies"
                      className="custom-checkbox-label"
                    >
                      Allergies
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="aspirin"
                      id="aspirin"
                      checked={state.allergy_inputs.aspirin}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label htmlFor="aspirin" className="custom-checkbox-label">
                      Aspirin
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="penicillin"
                      id="penicillin"
                      checked={state.allergy_inputs.penicillin}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label
                      htmlFor="penicillin"
                      className="custom-checkbox-label"
                    >
                      Penicillin
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="latex"
                      id="latex"
                      checked={state.allergy_inputs.latex}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label htmlFor="latex" className="custom-checkbox-label">
                      Latex
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="metal"
                      id="metal"
                      checked={state.allergy_inputs.metal}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label htmlFor="metal" className="custom-checkbox-label">
                      Metal
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="unknown"
                      id="unknown"
                      checked={state.allergy_inputs.unknown}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label htmlFor="unknown" className="custom-checkbox-label">
                      Unknown
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="none"
                      id="none"
                      checked={state.allergy_inputs.none}
                      onChange={handleAllergyChange}
                      className="custom-checkbox"
                    />
                    <label htmlFor="none" className="custom-checkbox-label">
                      None
                    </label>
                  </div>

                  <div className="option-item">
                    <Form.Check
                      type="checkbox"
                      name="other"
                      id="other"
                      checked={state.allergy_inputs.other_info.other}
                      onChange={handleOtherAllergyChange}
                      className="custom-checkbox"
                    />
                    <label htmlFor="other" className="custom-checkbox-label">
                      Other
                    </label>
                  </div>
                </div>

                {/* Other Allergies Input */}
                {state.allergy_inputs.other_info.other && (
                  <div className="allergy-entry mb-3">
                    <div
                      className="input-with-button"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Form.Control
                        type="text"
                        placeholder="Please specify allergy"
                        name="otherText"
                        value={state.otherText}
                        onChange={handleChange}
                      />
                      <Button variant="primary" onClick={handleOtherAllergyAdd}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Display custom allergies as tags */}
                {state.allergy_inputs.other_info.otherConditions.length > 0 && (
                  <div className="selected-items mb-3">
                    {state.allergy_inputs.other_info.otherConditions.map(
                      (allergy, index) => (
                        <div className="selected-tag" key={index}>
                          <span className="tag-check-icon">✓</span>
                          <span className="tag-text">{allergy}</span>
                          <span
                            className="tag-remove-btn"
                            onClick={() => handleOtherAllergyRemove(allergy)}
                          >
                            &times;
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Illnesses</Form.Label>
                  <Form.Control
                    type="text"
                    name="illness"
                    value={state.illness}
                    onChange={handleChange}
                    placeholder="Explain if applicable"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>List INR or HbA1C (if known)?</Form.Label>
                  <Form.Control
                    type="text"
                    name="Inr_or_HbA1C"
                    value={state.Inr_or_HbA1C}
                    onChange={handleChange}
                    placeholder="Explain if applicable"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    List of Medications, vitamins, or herbal supplements?
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="medications"
                    value={state.medications}
                    onChange={handleChange}
                    placeholder="Explain if applicable"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Childhood Disease History</Form.Label>
                  <Form.Control
                    type="text"
                    name="childhood_disease_history"
                    value={state.childhood_disease_history}
                    onChange={handleChange}
                    placeholder="Explain if applicable"
                  />
                </Form.Group>

                <Card className="mb-3">
                  <Card.Header className="bg-primary text-white">
                    <h4>Medical Health Questionnaire</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Check if you have been/are diagnosed/are feeling any of
                        the following
                      </Form.Label>
                    </Form.Group>

                    <MultiSelectDropdown
                      label="Cardiovascular Conditions"
                      items={cardio}
                      value={state.diagnosed_conditions}
                      onChange={(selected) => handleDiagnosedChange(selected)}
                    />

                    <MultiSelectDropdown
                      label="Respiratory Conditions"
                      items={respiratory}
                      value={state.diagnosed_conditions}
                      onChange={(selected) => handleDiagnosedChange(selected)}
                    />

                    <MultiSelectDropdown
                      label="Infectious Diseases & Others"
                      items={infectious}
                      value={state.diagnosed_conditions}
                      onChange={(selected) => handleDiagnosedChange(selected)}
                    />

                    <MultiSelectDropdown
                      label="Metabolic & Endocrine Disorders"
                      items={metabolic}
                      value={state.diagnosed_conditions}
                      onChange={(selected) => handleDiagnosedChange(selected)}
                    />

                    <MultiSelectDropdown
                      label="Neurological & Musculoskeletal Conditions"
                      items={neurological}
                      value={state.diagnosed_conditions}
                      onChange={(selected) => handleDiagnosedChange(selected)}
                    />

                    <MultiSelectDropdown
                      label="Digestive & Renal Conditions"
                      items={digestive}
                      value={state.diagnosed_conditions}
                      onChange={(selected) => handleDiagnosedChange(selected)}
                    />

                    {/* Checkbox for "Others" Diagnosis */}
                    <div className="option-item mb-3 mt-3">
                      <Form.Check
                        type="checkbox"
                        id="otherDiagnosis"
                        name="diagnosed_others"
                        label="Others (Please Indicate)"
                        checked={state.diagnosed_others}
                        onChange={handleChange}
                        className="custom-checkbox"
                      />
                    </div>

                    {/* Input field for "Others" diagnosis */}
                    {state.diagnosed_others && (
                      <div className="diagnosis-entry mb-3">
                        <div
                          className="input-with-button"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Form.Control
                            type="text"
                            name="diagnosedText"
                            placeholder="Please specify other condition"
                            value={state.diagnosedText}
                            onChange={handleChange}
                          />
                          <Button
                            variant="primary"
                            onClick={handleOtherDiagnosedAdd}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Display custom diagnoses as tags */}
                    {state.otherDiagnosedConditions.length > 0 && (
                      <div className="selected-items mb-3">
                        {state.otherDiagnosedConditions.map(
                          (diagnosis, index) => (
                            <div className="selected-tag" key={index}>
                              <span className="tag-check-icon">✓</span>
                              <span className="tag-text">{diagnosis}</span>
                              <span
                                className="tag-remove-btn"
                                onClick={() =>
                                  handleOtherDiagnosedRemove(diagnosis)
                                }
                              >
                                &times;
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <div className="form-actions mt-3">
                  <Button variant="primary" type="submit" className="me-2">
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={generateData}
                  >
                    Generate Data
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
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

export default PhysicalAssessment;