import { Card } from 'react-bootstrap';
import '../../Views/Styles/ProgressTracker.css';
import { toggleCategory, formatProcedureName } from '../TallySheetComponents/Utils';
import { CasePenaltySection } from './CasePenaltySection';
import { CaseGradingProcedures } from './CaseGradingProcedures';

export const PediatricDentistryCaseGradingCard = (props) => {
    const {
        category, 
        categoryData, 
        stateData,
        expanded, 
        dispatch, 
        handleGradeModal,
        yearLevel
    } = props;
    
    // Skip rendering if no data
    if (!categoryData || Object.keys(categoryData).length === 0) {
        return null;
    }
    
    const isPenalty = category === 'penalty';
    
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
                            {/* Handle Restorations category with class subcategories */}
                            {category === 'Restorations' ? (
                                subcategories.map((classType) => (
                                    categoryData[classType] && (
                                        <CaseGradingProcedures 
                                            key={`${category}-${classType}`}
                                            category={category}
                                            procedure={classType}
                                            procedureData={categoryData[classType]}
                                            handleGradeModal={handleGradeModal}
                                            yearLevel={yearLevel}
                                        />
                                    )
                                ))
                            ) : (
                                /* For other pediatric dentistry categories with cases */
                                categoryData.cases ? (
                                    <CaseGradingProcedures 
                                        key={`${category}-cases`}
                                        category={category}
                                        procedure="cases"
                                        procedureData={categoryData.cases}
                                        handleGradeModal={handleGradeModal}
                                        yearLevel={yearLevel}
                                    />
                                ) : (
                                    /* Fallback for any other structure */
                                    subcategories.map((procedure) => (
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
                                    ))
                                )
                            )}
                        </>
                    )}
                </Card.Body>
            )}
        </Card>
    );
};
