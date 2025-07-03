import { RenderSignatureArea } from "./RenderSignatureArea";

export const SectionStatus = (props) => {
  const {
    title,
    openSignatureModal,
    user,
    state,
    handleUploadSignature,
    handleImageSource,
    handleSectionSave,
    sectionKey,
    sectionData,
    validationResult, // Add validation result prop
  } = props;

  // Create a wrapper function that passes the section key
  const handleSave = () => {
    console.log(`Saving section ${sectionKey}`);
    // Call the original handler with section key
    handleSectionSave(sectionKey);
  };

  return (
    <div className="section-content-wrapper">
      <RenderSignatureArea
        title={title}
        field={sectionKey}
        data={sectionData}
        openSignatureModal={openSignatureModal}
        user={user}
        state={state}
        handleUploadSignature={handleUploadSignature}
        handleImageSource={handleImageSource}
        handleSectionSave={handleSave} // Use our wrapper function
        validationResult={validationResult} // Pass validation result
      />
    </div>
  );
};