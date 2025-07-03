import { Col, Card, Badge, Image } from 'react-bootstrap';
import '../../Views/Styles/ProgressTracker.css';
import { getGradeColor } from '../TallySheetComponents/Utils';
import { format } from 'date-fns';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import API_ENDPOINTS from '../../../config/api';

export const CaseCard = (props) => {
    const { user } = useContext(UserContext);
    const {
        itemKey, 
        itemData, 
        category,
        procedure,
        handleGradeModal
    } = props;
    
    const [instructorName, setInstructorName] = useState('');
    const [signatureUrl, setSignatureUrl] = useState('');
    const completed = itemData?.rating && parseInt(itemData.rating) > 0;
    const isInstructor = user?.role === 'Clinical Instructor' || user?.role === 'Clinical Chair';
    
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
            handleGradeModal(category, procedure, itemKey, itemData);
        }
    };
    
    return (
        <Col xs={6}>
            <Card 
                className={`mb-2 ${completed ? 'border-success' : 'border-danger'} ${isInstructor ? 'case-card-clickable' : ''}`}
                onClick={isInstructor ? handleGrade : undefined}
            > 
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
                    
                    {(!completed && isInstructor) && (
                        <div className="text-center mt-2">
                            <small className="text-primary">Click to grade</small>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Col>
    );
};