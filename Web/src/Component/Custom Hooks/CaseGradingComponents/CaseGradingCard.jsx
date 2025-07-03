import { Card } from 'react-bootstrap';
import '../../Views/Styles/ProgressTracker.css';
import { toggleCategory, formatProcedureName } from '../TallySheetComponents/Utils';
import { CasePenaltySection } from './CasePenaltySection';
import { CaseGradingProcedures } from './CaseGradingProcedures';

export const CaseGradingCard = (props) => {
    const {
        category, 
        categoryData, 
        stateData,
        expanded, 
        fixedPartialDentures, 
        dispatch, 
        handleGradeModal,
        yearLevel
    } = props;
    
    // Skip rendering if no data (same as TallySheetCard)
    if (!categoryData || Object.keys(categoryData).length === 0) {
        return null;
    }
    
    const isPenalty = category === 'penalty';
    const isTypodont = category === 'typodont';
    
    // Filter out the 'expanded' property when rendering subcategories
    const subcategories = Object.keys(categoryData).filter(key => key !== 'expanded');
    
    return (
        <Card className="shadow-sm mb-4">
            <Card.Header 
                className="procedure-header"
                onClick={() => toggleCategory(category, stateData, dispatch)}
            >
                <span>{formatProcedureName(category)}</span>
                <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
            </Card.Header>
            {expanded && (
                <Card.Body>
                    {isPenalty ? (
                        <CasePenaltySection 
                            category={category} 
                            categoryData={categoryData}
                            handleGradeModal={handleGradeModal}
                        />
                    ) : (
                        <>
                            {subcategories.map((procedure) => (
                                categoryData[procedure] && (
                                    <CaseGradingProcedures 
                                        key={`${category}-${procedure}`}
                                        category={category}
                                        procedure={procedure}
                                        procedureData={categoryData[procedure]}
                                        handleGradeModal={handleGradeModal}
                                        yearLevel={yearLevel}
                                    />
                                )
                            ))}
                            
                            {/* Special handling for fixedPartialDentures in typodont */}
                            {isTypodont && fixedPartialDentures && (
                                <>
                                    {Object.keys(fixedPartialDentures)
                                        .filter(key => key !== 'expanded')
                                        .map((procedure) => (
                                            fixedPartialDentures[procedure] && (
                                                <CaseGradingProcedures 
                                                    key={`fpd-${procedure}`}
                                                    category="fixedPartialDentures"
                                                    procedure={procedure}
                                                    procedureData={fixedPartialDentures[procedure]}
                                                    fixedPartial={true}
                                                    handleGradeModal={handleGradeModal}
                                                    yearLevel={yearLevel}
                                                />
                                            )
                                        ))}
                                </>
                            )}
                        </>
                    )}
                </Card.Body>
            )}
        </Card>
    );
};