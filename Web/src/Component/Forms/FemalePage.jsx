import React, { useContext, useEffect, useReducer, useState } from "react";
import { Card, Form, Button, Row, Col, Container } from "react-bootstrap";
import { UserContext } from "../Context/UserContext";
import "../Views/Styles/FemalePage.css";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TitleHead from "../Custom Hooks/TitleHead";
import { App } from "antd";
import { femaleReducer, INITIAL_STATE } from "../Reducers/FemaleReducer";
import API_ENDPOINTS from "../../config/api";

const FemalePage = () => {
  TitleHead("Female Health Details");
  const { user, loading } = useContext(UserContext);
  const { message: messageApi } = App.useApp();
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("action") === "edit";
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(femaleReducer, INITIAL_STATE);

  const getFemaleData = async () => {
    await axios
      .get(`${API_ENDPOINTS.GET_FEMALE_FORM(id)}`, { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        dispatch({ type: "GET_DATA", payload: res.data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (isEdit) {
      getFemaleData();
    }
  }, []);

  const handleChange = (e) => {
    dispatch({ type: "HANDLE_INPUT", payload: e.target });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_ENDPOINTS.UPDATE_FEMALE_FORM(id)}`, state, {
          withCredentials: true,
        });
        messageApi.success("Data updated successfully!", 3);
        navigate(`/patient/${id}`);
      } else {
        await axios.post(`${API_ENDPOINTS.CREATE_FEMALE_FORM(id)}`, state, {
          withCredentials: true,
        });
        messageApi.success("Data saved successfully!", 3);
        navigate(`/patient/${id}`);
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to save data", 3);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 fs-5">Reproductive Health Details</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-notice">
                    This form is for females only. Please proceed to the next
                    page if this section does not apply to you.
                  </Form.Label>
                  <Form.Label className="mt-3 fw-bold">Are you...</Form.Label>
                  <div className="d-flex flex-column">
                    <Form.Check
                      type="checkbox"
                      label="Pregnant"
                      name="pregnant"
                      id="pregnant-check"
                      checked={state.pregnant}
                      onChange={handleChange}
                      className="mb-2"
                    />
                    {state.pregnant && (
                      <Form.Group className="mb-3 ms-4">
                        <Form.Label className="form-label-sm">
                          If pregnant, how many months?
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter number of months"
                          name="pregnantMonths"
                          value={state.pregnantMonths}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    )}
                    <Form.Check
                      type="checkbox"
                      label="Breastfeeding"
                      name="breast_feeding"
                      id="breast_feeding-check"
                      checked={state.breast_feeding}
                      onChange={handleChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Menopause"
                      name="menopause"
                      id="menopause-check"
                      checked={state.menopause}
                      onChange={handleChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Under hormone replacement therapy?"
                      name="hormone_replacement"
                      id="hormone-check"
                      checked={state.hormone_replacement}
                      onChange={handleChange}
                      className="mb-2"
                    />
                  </div>
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button
                    variant="secondary"
                    className="me-md-2"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                  <Button variant="primary" type="submit">
                    Save and Continue
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FemalePage;
