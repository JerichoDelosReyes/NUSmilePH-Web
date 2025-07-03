import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Card,
  Form,
  Button,
  Modal,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import SignatureScreen from "../Custom Hooks/SignatureScreen";
import { UserContext } from "../Context/UserContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Views/Styles/DiagnosisandTreatment.css";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router";
import TitleHead from "../Custom Hooks/TitleHead";
import { App } from "antd";
import {
  diagnosisTreatmentReducer,
  INITIAL_STATE,
} from "../Reducers/DiagnosisTreatmentReducer";
import { convertImageBase64ToBlob } from "../Custom Hooks/ConvertImageBlob";
import { API_ENDPOINTS } from "../../config/api";

// Fake data generator for testing (inputs only)
const generateFakeInputData = () => {
  const diagnoses = [
    "Dental Caries (Tooth Decay) - Multiple teeth affected with varying degrees of severity including deep cavitation on molars #14, #19, and #30. Class II cavities requiring immediate restorative treatment.",
    "Gingivitis - Mild to moderate inflammation of gums with bleeding on probing, plaque accumulation along gumline, and early signs of periodontal involvement in posterior regions.",
    "Periodontitis - Advanced gum disease with 4-6mm pocket formation, bone loss evident on radiographs, mobility grade 1-2 on teeth #3, #14, and #30. Class III furcation involvement on #19.",
    "Impacted Third Molars (Wisdom Teeth) - Bilateral mandibular third molar impaction with mesioangular positioning. Patient experiencing pain, swelling, and difficulty opening mouth.",
    "Malocclusion - Class II Division 1 with increased overjet (8mm) and overbite (6mm). Upper incisors proclined, lower incisors retroclined. Crowding in lower anterior region.",
    "Temporomandibular Joint Disorder (TMJ) - Chronic bilateral TMJ pain with clicking sounds during opening and closing. Limited mouth opening (35mm), muscle tenderness in masseter region.",
    "Dental Abscess - Acute periapical abscess on tooth #19 with facial swelling extending to submandibular region. Patient reports severe throbbing pain and fever.",
    "Enamel Hypoplasia - Developmental defect affecting multiple teeth with horizontal lines and pitting on permanent incisors and first molars. Aesthetic and functional concerns noted.",
    "Bruxism - Nocturnal teeth grinding with evidence of severe wear facets on posterior teeth. Flattened cusps on molars, tooth sensitivity, and muscle tension headaches.",
    "Oral Ulceration - Recurrent aphthous stomatitis with multiple painful ulcerations on tongue, inner cheeks, and lip. Largest ulcer measuring 8mm diameter on lateral tongue.",
    "Tooth Sensitivity - Generalized dentin hypersensitivity affecting multiple teeth, particularly premolars and molars. Pain triggered by cold beverages and sweet foods.",
    "Fractured Crown - Traumatic injury to upper central incisor (#9) with oblique crown fracture extending subgingivally. Pulp exposure with vital response to cold testing.",
  ];

  const treatmentPlans = [
    "Phase 1: Comprehensive oral hygiene instruction with proper brushing and flossing techniques. Professional scaling and root planing in quadrants. Fluoride varnish application. Phase 2: Restoration of carious lesions using composite resin fillings on teeth #14, #19, #30. Phase 3: Periodontal maintenance every 3 months.",
    "Emergency Phase: Pain management with prescribed analgesics and antibiotics. Surgical extraction of impacted wisdom teeth #1, #16, #17, #32 under local anesthesia with conscious sedation. Post-operative care including ice therapy, soft diet, and chlorhexidine rinses. Suture removal in 7-10 days.",
    "Orthodontic Phase: Comprehensive orthodontic consultation for treatment planning. Pre-orthodontic extraction of premolars #5, #12, #21, #28 to create space. 24-month comprehensive orthodontic treatment with fixed metal braces. Monthly adjustment appointments.",
    "Protective Phase: Fabrication of custom-fitted hard acrylic night guard for upper arch to prevent further tooth wear. Stress management counseling and relaxation techniques. Regular monitoring appointments every 3 months to assess wear patterns.",
    "Emergency Endodontic Treatment: Immediate pulpectomy and cleaning of root canals on tooth #14. Temporary restoration placement. Root canal therapy completion with gutta-percha obturation in 1 week. Crown preparation and permanent crown placement in 3 weeks.",
    "Surgical Intervention: Immediate incision and drainage of abscess with local anesthesia. Antibiotic therapy (Amoxicillin 500mg TID for 7 days). Pain management with ibuprofen and acetaminophen. Root canal treatment vs extraction evaluation based on tooth restorability.",
    "Conservative Monitoring: Regular radiographic assessment every 6 months to monitor progression. Vitality testing at each appointment. Possible orthodontic consultation if condition progresses. Patient education regarding signs and symptoms to watch for.",
    "Desensitizing Protocol: Prescription of desensitizing toothpaste containing potassium nitrate for home use. In-office fluoride varnish application. Dietary counseling to avoid acidic foods and beverages. Custom-fitted fluoride trays for home use.",
  ];

  const getRandomElement = (array) =>
    array[Math.floor(Math.random() * array.length)];
  const getRandomBoolean = () => Math.random() < 0.7; // 70% chance of consent

  return {
    diagnosis: getRandomElement(diagnoses),
    treatmentPlan: getRandomElement(treatmentPlans),
    consentGiven: getRandomBoolean()
      ? true
      : Math.random() < 0.5
      ? false
      : null,
  };
};

const DiagnosisAndTreatment = () => {
  TitleHead("Diagnosis and Treatment");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("action") === "edit";
  const [state, dispatch] = useReducer(
    diagnosisTreatmentReducer,
    INITIAL_STATE
  );
  const {messsage: messageAPI} = App.useApp();

  // Fake data generator function for inputs only
  const handleGenerateFakeData = () => {
    const fakeData = generateFakeInputData();

    // Update only the input fields, preserve existing signatures
    dispatch({
      type: "HANDLE_INPUTS",
      payload: { name: "diagnosis", value: fakeData.diagnosis },
    });
    dispatch({
      type: "HANDLE_INPUTS",
      payload: { name: "treatmentPlan", value: fakeData.treatmentPlan },
    });
    dispatch({ type: "HANDLE_CONSENT", payload: fakeData.consentGiven });

    messageAPI.success(
      "Fake data generated for diagnosis and treatment plan! 🎲"
    );
  };

  const getPatientName = async () => {
    await axios
      .get(`${API_ENDPOINTS.GET_PATIENT_BY_ID(id)}`)
      .then((res) => {
        const fetched = res.data;
        const patient =
          fetched.firstname +
          (fetched.middlename ? " " + fetched.middlename + " " : " ") +
          fetched.lastname;
        dispatch({ type: "HANDLE_PATIENT_NAME", payload: patient });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getCurrentDiagnosisAndTreatment = async () => {
    await axios
      .get(`${API_ENDPOINTS.GET_DIAGNOSIS_AND_TREATMENT(id)}`)
      .then((res) => {
        console.log(res.data);
        dispatch({ type: "GET_DATA", payload: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isEdit) {
      getCurrentDiagnosisAndTreatment();
    }
    getPatientName();
  }, []);

  const consentForm = [
    { label: "Consent", value: true },
    { label: "Refuse", value: false },
  ];

  const handleImageSource = () => {
    const image = state.patientSignature || state.imgURI;

    if (!image) {
      return null;
    }
    if (typeof image !== "string") {
      return null;
    }
    if (image.startsWith("data:image/") || image.startsWith("blob:")) {
      return image;
    }

    return `${API_ENDPOINTS.GET_PATIENT_SIGNATURE(image)}`;
  };

  const handleChange = (e) => {
    dispatch({ type: "HANDLE_INPUTS", payload: e.target });
  };

  const handleConsentChange = (value) => {
    dispatch({ type: "HANDLE_CONSENT", payload: value });
  };

  const handleUploadSignature = (e) => {
    dispatch({
      type: "UPLOAD_SIGNATURE",
      payload: URL.createObjectURL(e.target.files[0]),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      diagnosis,
      treatmentPlan,
      consentGiven,
      patientName,
      patientSignature,
      imgURI,
    } = state;

    try {
      // Validate required fields
      if (!diagnosis.trim()) {
        return messageAPI.error("Please enter a diagnosis");
      }
      if (!treatmentPlan.trim()) {
        return messageAPI.error("Please enter a treatment plan");
      }
      if (consentGiven === null || consentGiven === undefined) {
        return messageAPI.error("Please select consent or refuse option");
      }

      // Validate signature only if consent is given
      if (consentGiven === true && !patientSignature && !imgURI) {
        return messageAPI.error(
          "Please provide your signature when consent is given"
        );
      }

      const url = isEdit
        ? `${API_ENDPOINTS.UPDATE_DIAGNOSIS_AND_TREATMENT(id)}`
        : `${API_ENDPOINTS.CREATE_DIAGNOSIS_AND_TREATMENT(id)}`;

      let response;

      if (consentGiven === true) {
        // Consent given - send FormData with signature
        const formData = new FormData();
        formData.append("diagnosis", diagnosis);
        formData.append("treatmentPlan", treatmentPlan);
        formData.append("consentGiven", "true");
        formData.append("patientName", patientName);

        // Handle signature
        const imageSrc = handleImageSource();
        if (imageSrc) {
          if (imageSrc.startsWith("data:image/")) {
            // Base64 image - convert to blob
            const image = convertImageBase64ToBlob(imageSrc);
            formData.append(
              "patientSignature",
              image,
              `${patientName}-signature.png`
            );
            console.log("Image Blob:", image);
          } else {
            // File or other format
            formData.append("patientSignature", imageSrc);
            console.log("Image Source:", imageSrc);
          }
        }

        console.log("Sending FormData with signature");
        response = await axios[isEdit ? "put" : "post"](url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      } else {
        // No consent - send JSON data only
        const jsonData = {
          diagnosis,
          treatmentPlan,
          consentGiven: false,
          patientName,
        };

        console.log("Sending JSON data without signature");
        response = await axios[isEdit ? "put" : "post"](url, jsonData, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
      }

      console.log(response.data);
      
      navigate(`/patient/${id}`);
    } catch (error) {
      console.error("Submit error:", error);

      // Handle specific error responses
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          const errorMessage =
            data?.error || data?.message || "Invalid request data";
          messageAPI.error(`Validation Error: ${errorMessage}`);
        } else if (status === 403) {
          messageAPI.error(
            "Permission denied. You do not have sufficient permissions."
          );
        } else if (status === 404) {
          messageAPI.error("Patient not found.");
        } else {
          messageAPI.error(`Server error (${status}). Please try again later.`);
        }
      } else if (error.request) {
        messageAPI.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        messageAPI.error("Something went wrong! Please try again.");
      }
    }
  };

  const resetForm = () => {
    dispatch({ type: "RESET_INPUTS" });
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fs-5">
                Diagnosis and Treatment Plan
              </h4>

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
                <Form.Group className="mb-4">
                  <Form.Label>Diagnosis</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="diagnosis"
                    value={state.diagnosis}
                    onChange={handleChange}
                    placeholder="Enter detailed diagnosis"
                    className="diagnosis-textarea"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Treatment Plan</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="treatmentPlan"
                    value={state.treatmentPlan}
                    onChange={handleChange}
                    placeholder="Describe the treatment plan in detail"
                    className="treatment-textarea"
                  />
                </Form.Group>

                <div className="consent-section mb-4 p-3 border rounded">
                  <p className="consent-text">
                    I <strong>{state.patientName}</strong> understand
                    the above planned treatment, the amount of time it
                    will take, the fees associated with homecare
                    recommendations, possible adverse effects, and risks
                    associated with NOT undergoing the suggested
                    treatment and seeking recommended referral. I
                    hereby:
                  </p>

                  <div className="consent-options mt-3">
                    {consentForm.map((option, index) => {
                      return (
                        <Form.Check
                          key={index}
                          type="checkbox"
                          id={`${option.label.toLowerCase()}Checkbox`}
                          label={`${option.label} to the above treatment`}
                          name="consentGiven"
                          checked={state.consentGiven === option.value}
                          onChange={() =>
                            handleConsentChange(option.value)
                          }
                          className={
                            option == "Consent"
                              ? "consent-checkbox mb-2"
                              : "refuse-checkbox"
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="signature-section mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="signature-label">
                      Patient's Signature:
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() =>
                          dispatch({
                            type: "HANDLE_MODAL",
                            payload: true,
                          })
                        }
                        className="signature-button"
                      >
                        {state.patientSignature || state.imgURI
                          ? "Change Signature"
                          : "Sign Here"}
                      </Button>
                      <Form.Control
                        type="file"
                        accept="image/png"
                        className="mt-2"
                        onChange={handleUploadSignature}
                      />
                    </div>
                  </div>

                  {(state.patientSignature || state.imgURI) && (
                    <div className="signature-preview mb-3 p-2 border rounded">
                      <img
                        src={handleImageSource()}
                        alt="Patient Signature"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          maxHeight: "100px",
                        }}
                      />
                    </div>
                  )}

                  <div className="signature-info small text-muted">
                    <strong>PATIENT'S NAME AND SIGNATURE</strong> <br />
                    Or <br />
                    <strong>
                      PARENT/GUARDIAN'S NAME AND SIGNATURE (for patient
                      below 18 years old)
                    </strong>
                  </div>
                </div>

                <div className="form-action-buttons mt-4">
                  <div className="row g-2">
                    <div className="col-12 col-md-6 order-md-2">
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 btn-submit"
                      >
                        Save and Continue
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 order-md-3">
                      <Button
                        variant="light"
                        onClick={() => resetForm()}
                        className="w-100 btn-back"
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 order-md-1">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="w-100 btn-back"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Signature Modal */}
      <Modal
        show={state.modalVisible}
        onHide={() => dispatch({ type: "HANDLE_MODAL", payload: false })}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Patient Signature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SignatureScreen
            onSave={(sig) => {
              dispatch({
                type: "HANDLE_SIGNATURE",
                payload: { signature: sig },
              });
              dispatch({ type: "HANDLE_MODAL", payload: false });
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DiagnosisAndTreatment;
