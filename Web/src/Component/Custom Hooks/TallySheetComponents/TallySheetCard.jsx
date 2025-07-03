import { Card } from 'react-bootstrap';
import '../../Views/Styles/ProgressTracker.css'
import { formatProcedureName, toggleCategory } from './Utils'
import { PenaltySection } from './PenaltySection';
import { TallySheetProcedures } from './TallySheetProcedures';

export const TallySheetCard = (props) => {
    const { category, categoryData, expanded, state, dispatch } = props;
    const isPenalty = category === 'penalty';
    
    // Skip rendering if category data is empty
    if (!categoryData || Object.keys(categoryData).length === 0) {
        return null;
    }
    
    return (
        <Card className="shadow-sm mb-4">
            <Card.Header
                className="procedure-header"
                onClick={() => toggleCategory(category, state, dispatch)}
            >
                <span>{formatProcedureName(category)}</span>
                <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
            </Card.Header>
            {expanded && (
                <Card.Body>
                    {isPenalty ? (
                        <PenaltySection category={category} categoryData={categoryData} />
                    ) : (
                        <>
                            {/* Only map through subcategories that actually exist */}
                            {Object.keys(categoryData).map((subcategory) => (
                                categoryData[subcategory] ? (
                                    <TallySheetProcedures
                                        key={`${category}-${subcategory}`}
                                        procedure={subcategory}
                                        procedureData={categoryData[subcategory]}
                                    />
                                ) : null
                            ))}
                        </>
                    )}
                </Card.Body>
            )}
        </Card>
    )
}