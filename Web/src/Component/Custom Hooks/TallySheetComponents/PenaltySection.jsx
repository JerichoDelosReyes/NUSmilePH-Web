import { Badge, Row, ProgressBar } from "react-bootstrap"
import { PenaltyCase } from "./PenaltyCase"
import '../../Views/Styles/ProgressTracker.css'
import {formatProcedureName, renderStatusBadge} from './Utils'
export const PenaltySection = (props) =>{
    const {category, categoryData} = props
    const {badgeBG, text} = renderStatusBadge()
    return(
        <div className="mb-4">
            <div className="mb-0 procedure-name">
                <h6 className="mb-0 procedure-name">{formatProcedureName(category)} Case</h6>
                <Badge bg={badgeBG}>{text}</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <small>{0} of {Object.keys(category).length} complete</small>
                <small>{0}%</small>
            </div>
            <Row className="g-2">
                {Object.keys(categoryData).map((item, index) =>{
                    const itemData = categoryData[item]
                    return(
                        <PenaltyCase key={index} itemKey={item} itemData={itemData}/>
                    )
                })}
                
            </Row>
        </div>
    )
}