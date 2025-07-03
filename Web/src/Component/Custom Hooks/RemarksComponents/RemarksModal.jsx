import { Modal } from "react-bootstrap";
import SignatureScreen from "../SignatureScreen";
export const RemarksModal = (props)=>{
    const {state, dispatch, title} = props;
    return(
        <Modal 
        show={state.modalVisible} 
        onHide={() => dispatch({ type: 'HANDLE_MODAL', payload: { visible: false } })} 
        centered
        size="lg"
        className="signature-modal"
      >
        <Modal.Header closeButton className="py-2">
          <Modal.Title className="fs-5">
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2 p-sm-3">
          <SignatureScreen
            onSave={(sig) => {
              state.currentSignatureField === 'clinicalChairSignature' ?
              dispatch({ 
                type: 'HANDLE_CHAIR_SIGNATURE', 
                payload: sig
              }) :
              dispatch({ 
                type: 'HANDLE_SIGNATURE', 
                payload: { 
                  field: state.currentSignatureField,
                  signature: sig 
                } 
              });
              dispatch({ type: 'HANDLE_MODAL', payload: { visible: false } });
            }}
          />
        </Modal.Body>
      </Modal>
    )
}