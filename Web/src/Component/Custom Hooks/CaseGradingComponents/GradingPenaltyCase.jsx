import { Card, Col, Badge, Image } from 'react-bootstrap';
import { format } from 'date-fns';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import API_ENDPOINTS from '../../../config/api';

export const GradingPenaltyCase = (props) => {
    const { user } = useContext(UserContext);
    const { category, itemKey, itemData, handleGradeModal } = props;
    const [instructorName, setInstructorName] = useState('');
    const [signatureUrl, setSignatureUrl] = useState('');
    const isInstructor = user?.role === 'Clinical Instructor' || user?.role === 'Clinical Chair';
    const completed = itemData && itemData.case;
    
    useEffect(() => {
        // Get instructor name if we have an instructor ID - Similar to TallySheetCase
        if (itemData?.clinicalInstructor) {
            axios.get(API_ENDPOINTS.GET_USER_BY_ID(itemData.clinicalInstructor))
                .then(response => {
                    const instructor = response.data.users;
                    if (instructor) {
                        setInstructorName(instructor.firstName + ' ' + instructor.surname);
                    }
                })
                .catch(error => {
                    console.error('Error fetching instructor details:', error);
                    setInstructorName('Unknown Instructor');
                });
        }
        
        // Get signature image if we have a signature ID
        if (itemData?.signature) {
            setSignatureUrl(API_ENDPOINTS.GET_FACULTY_SIGNATURE(itemData.signature));
        }
    }, [itemData]);
    
    const handleGrade = () => {
        if (isInstructor && handleGradeModal) {
            handleGradeModal(category, itemKey, null, itemData);
        }
    };
    
    return (
        <Col xs={6}>
            <Card 
                className={`mb-2 ${completed ? 'border-warning' : 'border-danger'} ${isInstructor ? 'case-card-clickable' : ''}`}
                onClick={isInstructor ? handleGrade : undefined}
            > 
                <Card.Body className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Case {itemKey}</strong>
                        </div>
                        <Badge 
                            bg={completed ? 'warning' : 'danger'}
                            className="ms-2"
                        >
                            {completed ? 'Penalty' : 'Not Recorded'}
                        </Badge>
                    </div>
                    
                    {completed ? (
                        <div className="mt-2">
                            <div className="small mb-1">
                                <strong>Case:</strong> <span className="text-warning">{itemData.case}</span>
                            </div>
                            
                            {itemData.date && (
                                <div className="small text-muted mb-1">
                                    {format(new Date(itemData.date), 'MM/dd/yyyy')}
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
                    ) : (
                        isInstructor && (
                            <div className="text-center mt-2">
                                <small className="text-primary">Click to record penalty</small>
                            </div>
                        )
                    )}
                </Card.Body>
            </Card>
        </Col>
    );
};