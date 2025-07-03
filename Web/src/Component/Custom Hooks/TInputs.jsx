import React, { useState } from 'react';

const TInputs = (props) => {
  const { 
    label, 
    inputType = 'text', 
    isSecured, 
    getter, 
    setter, 
    icon,
    containerStyle, 
    inputStyle, 
    iconStyle, 
    multiline = false, 
    editable = true,
    uniqueClass = '' // New prop for uniqueness
  } = props;
  
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(isSecured);

  return (
    <div 
      className={`tinputs-container ${uniqueClass}`}  // Add unique class
      style={{
        ...styles.container, 
        ...(isFocused ? styles.inputFocused : {}), 
        ...containerStyle
      }}
    >
      {multiline ? (
        <textarea
          placeholder={label}
          value={getter}
          onChange={(e) => setter(e.target.value)}
          style={{ ...styles.input, ...inputStyle }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={4}
          cols={50}
          disabled={!editable}
        />
      ) : (
        <input
          type={secureText ? 'password' : inputType}
          placeholder={label}
          value={getter}
          onChange={(e) => setter(e.target.value)}
          style={{ ...styles.input, ...inputStyle }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={!editable}
        />
      )}

      {isSecured ? (
        <button 
          onClick={() => setSecureText(!secureText)} 
          style={styles.iconContainer}
        >
          <img
            src={secureText ? '/assets/icons/close_eye_icon.png' : '/assets/icons/open_eye_icon.png'}
            alt="toggle visibility"
            style={{ ...styles.icon, ...iconStyle }}
          />
        </button>
      ) : icon ? (
        <img src={icon} alt="icon" style={{ ...styles.icon, ...iconStyle }} />
      ) : null}
    </div>
  );
};

const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      borderWidth: '1.5px', // border thickness
      borderColor: '#323232', // default border color (dark gray)
      borderRadius: '6px',
      padding: '10px',
      margin: '10px 0',
      width: '100%',
      marginBottom: '20px',
    },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    borderColor: 'black',
    outline: 'none',
  },
  inputFocused: {
    borderColor: '#007BFF',
    borderWidth: '2px',
  },
  iconContainer: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
  },
  icon: {
    width: '20px',
    height: '20px',
    objectFit: 'contain',
  },
};

export default TInputs;
