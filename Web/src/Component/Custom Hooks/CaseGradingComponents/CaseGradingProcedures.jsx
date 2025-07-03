import { Badge, ProgressBar, Row } from "react-bootstrap";
import { CaseCard } from "./CaseCard";
import { calculateCaseCompletion, renderCaseStatusBadge, formatProcedureName } from "./CaseGradingUtils";

export const CaseGradingProcedures = (props) => {
    const {
        procedure, 
        category, 
        procedureData, 
        handleGradeModal, 
        fixedPartial,
        yearLevel
    } = props;
    
    // Skip rendering if procedure data is empty (same as TallySheetProcedures)
    if (!procedureData || Object.keys(procedureData).length === 0) {
        return null;
    }
    
    const { badgeBG, text } = renderCaseStatusBadge(procedureData);
    const { percent, completed, total } = calculateCaseCompletion(procedureData);
    
    return (
        <div className="mb-4">
            {/* Header with procedure name and status badge - identical to TallySheetProcedures */}
            <div className="mb-0 procedure-name d-flex align-items-center justify-content-between">
                <h6 className="mb-0 procedure-name">
                    {fixedPartial ? 'FIXED PARTIAL DENTURES - ' : ''}{formatProcedureName(procedure)}
                </h6>
                <Badge bg={badgeBG}>{text}</Badge>
            </div>
            
            {/* Progress indicator - identical to TallySheetProcedures */}
            <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                <small>{completed} of {total} complete</small>
                <small>{percent}%</small>
            </div>
            
            <ProgressBar
                now={percent}
                variant={percent === 100 ? 'success' : percent > 50 ? 'warning' : 'danger'} 
                className='mb-3'
            />
            
            {/* Case items */}
            <Row className="g-2">
                {Object.keys(procedureData).map((item) => (
                    <CaseCard 
                        key={`${category}-${procedure}-${item}`}
                        itemKey={item}
                        itemData={procedureData[item]}
                        handleGradeModal={handleGradeModal}
                        category={category}
                        procedure={procedure}
                        yearLevel={yearLevel}
                    />
                ))}
            </Row>
        </div>
    );
};