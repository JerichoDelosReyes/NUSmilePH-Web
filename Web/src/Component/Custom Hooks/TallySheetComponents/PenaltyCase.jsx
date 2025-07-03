import {Col, Card} from 'react-bootstrap';
import '../../Views/Styles/ProgressTracker.css'
import { getGradeColor } from './Utils';
import {format} from 'date-fns';
export const PenaltyCase = (props) =>{
    const {itemKey, itemData} = props
    return(
        <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
            <Card className={`tooth-case-card h-100 border-danger`}> 
                <Card.Header className="d-flex justify-content-between align-items-center tooth-card-header py-2">
                    <span>Case {itemKey}</span>
                </Card.Header>
                <Card.Body className="p-2">
                    <div className="tooth-case-details">
                        {/*Rating Section Map Here*/}
                        {itemData ? (
                            <>
                            <div className='detail-row'>
                                <span className="detail-label">Case:</span>
                                <span className={`detail-value`} >
                                    {itemData?.case}
                                </span>
                            </div>
                            <div className='detail-row'>
                                <span className="detail-label">Signatory:</span>
                                <span className="detail-value">{itemData?.clinicalInstructor}</span>
                            </div>
                            <div className='detail-row'>
                                <span className="detail-label">Date:</span>
                                <span className="detail-value">{format(new Date(itemData?.date), 'MM/dd/yyyy')}</span>
                            </div>
                            <div className="signature-line mt-2">
                                <div className="signature-placeholder"></div>
                                <div className="signature-name text-center">
                                    <small>{itemData?.signature}</small>
                                </div>
                            </div>
                        </>
                        ) : (
                            <div className='no-completion text-center text-muted'>
                                <small>None</small>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Col>
    )
}