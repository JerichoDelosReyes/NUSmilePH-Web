import { Badge, Row, ProgressBar } from "react-bootstrap";
import '../../Views/Styles/ProgressTracker.css'
import {calculatePercentCompletion, formatProcedureName, renderStatusBadge} from './Utils'
import { TallySheetCase } from "./TallySheetCase";

export const TallySheetProcedures = (props) =>{
    const {procedure, procedureData} = props;
    
    // Skip rendering if procedure data is empty
    if (!procedureData || Object.keys(procedureData).length === 0) {
        return null;
    }
    
    const {badgeBG, text} = renderStatusBadge(procedureData);
    
    // Calculate completion metrics
    const {percent, completed, total} = calculatePercentCompletion(procedureData);
    
    return(
        <div className="mb-4">
            <div className="mb-0 procedure-name d-flex align-items-center justify-content-between">
                <h6 className="mb-0 procedure-name">{formatProcedureName(procedure)}</h6>
                <Badge bg={badgeBG}>{text}</Badge>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                <small>{completed} of {total} complete</small>
                <small>{percent}%</small>
            </div>
            
            <ProgressBar
                now={percent}
                variant={percent === 100 ? 'success' : percent > 50 ? 'warning' : 'danger'} 
                className='mb-3'
            />
            
            <Row className="g-2">
                {Object.keys(procedureData).map((caseItem) => (
                    <TallySheetCase 
                        key={`${procedure}-${caseItem}`} 
                        itemKey={caseItem} 
                        itemData={procedureData[caseItem]}
                    />
                ))}
            </Row>
        </div>
    );
};