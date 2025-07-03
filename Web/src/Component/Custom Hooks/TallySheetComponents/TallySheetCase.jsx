import React, { useState, useEffect } from 'react';
import { Col, Card, Badge, Image, Row } from 'react-bootstrap';
import axios from 'axios';
import { getGradeColor } from './Utils';
import API_ENDPOINTS from '../../../config/api';

export const TallySheetCase = (props) => {
    const { itemKey, itemData } = props;
    const completed = itemData?.rating && parseInt(itemData.rating) > 0;
    const [instructorName, setInstructorName] = useState();
    const [signatureUrl, setSignatureUrl] = useState('');

    // Get signature image if we have a signature ID
    useEffect(() => {
        if (itemData?.clinicalInstructor) {
            axios.get(API_ENDPOINTS.GET_USER_BY_ID(itemData?.clinicalInstructor))
                .then(response => {
                    const instructor = response.data.users;
                    if (instructor) {
                        setInstructorName(instructor.firstName + ' ' + instructor.surname);
                    }
                })
                .catch(error => {
                    console.error('Error fetching instructor data:', error);
                    setInstructorName('Unknown Instructor');
                });
        }
        
        if (itemData?.signature) {
            setSignatureUrl(API_ENDPOINTS.GET_FACULTY_SIGNATURE(itemData.signature));
        }
    }, [itemData]);

    return (
        <Col xs={6}>
            <Card className={`mb-2 ${completed ? 'border-success' : 'border-danger'}`}>
                <Card.Body className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Case {itemKey}</strong>
                            {completed && itemData.rating && (
                                <Badge 
                                    bg={getGradeColor(itemData.rating)} 
                                    className="ms-2"
                                >
                                    {itemData.rating}
                                </Badge>
                            )}
                        </div>
                        <Badge 
                            bg={completed ? 'success' : 'danger'}
                            className="ms-2"
                        >
                            {completed ? 'Completed' : 'Pending'}
                        </Badge>
                    </div>
                    
                    {completed && (
                        <div className="mt-2">
                            {itemData.date && (
                                <div className="small text-muted mb-2">
                                    {new Date(itemData.date).toLocaleDateString()}
                                </div>
                            )}
                            
                            {instructorName && (
                                <div className="small mb-1">
                                    <strong>Instructor:</strong> {instructorName}
                                </div>
                            )}
                            
                            {signatureUrl && (
                                <div className="signature-container mt-1">
                                    <Image 
                                        src={signatureUrl} 
                                        alt="Signature" 
                                        style={{ height: '30px', maxWidth: '100%' }} 
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Col>
    );
};