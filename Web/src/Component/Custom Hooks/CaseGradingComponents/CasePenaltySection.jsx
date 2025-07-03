import { Badge, Row, ProgressBar } from "react-bootstrap";
import { GradingPenaltyCase } from "./GradingPenaltyCase";
import { calculateCaseCompletion, renderCaseStatusBadge, formatProcedureName } from "./CaseGradingUtils";

export const CasePenaltySection = (props) => {
    const { category, categoryData, handleGradeModal } = props;
    
    // Skip rendering if category data is empty (same as TallySheet components)
    if (!categoryData || Object.keys(categoryData).length === 0) {
        return null;
    }
    
    const { badgeBG, text } = renderCaseStatusBadge(categoryData);
    const { percent, completed, total } = calculateCaseCompletion(categoryData);
    
    return (
        <div className="mb-4">
            {/* Header with procedure name and status badge - matching TallySheetProcedures */}
            <div className="mb-0 procedure-name d-flex align-items-center justify-content-between">
                <h6 className="mb-0 procedure-name">{formatProcedureName(category)} Cases</h6>
                <Badge bg={badgeBG}>{text}</Badge>
            </div>
            
            {/* Progress indicator - matching TallySheetProcedures */}
            <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                <small>{completed} of {total} complete</small>
                <small>{percent}%</small>
            </div>
            
            <ProgressBar
                now={percent}
                variant={percent === 100 ? 'success' : percent > 50 ? 'warning' : 'danger'} 
                className='mb-3'
            />
            
            {/* Penalty case items */}
            <Row className="g-2">
                {Object.keys(categoryData).map((item) => (
                    <GradingPenaltyCase 
                        key={`penalty-${item}`}
                        category={category} 
                        itemKey={item} 
                        itemData={categoryData[item]}
                        handleGradeModal={handleGradeModal}
                    />
                ))}
            </Row>
        </div>
    );
};