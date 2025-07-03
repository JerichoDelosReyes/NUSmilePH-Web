import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./OTPInput.css"; // We'll create this file next

const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef([]);

  // Initialize refs array when component mounts
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus on the first input when the component mounts
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  // Handle input change
  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Allow only one digit per input
    if (/^\d{0,1}$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // If input is filled, move to the next input
      if (value && index < length - 1) {
        setActiveInput(index + 1);
        inputRefs.current[index + 1].focus();
      }
      
      // Check if OTP is complete (all fields filled)
      const otpValue = newOtp.join("");
      if (otpValue.length === length && onComplete) {
        onComplete(otpValue);
      }
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    const pasteData = e.clipboardData.getData("text/plain").trim();
    
    // Check if pasted content is a valid OTP (all digits)
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      
      // Fill the OTP fields with pasted data
      for (let i = 0; i < Math.min(length, pasteData.length); i++) {
        newOtp[i] = pasteData[i];
      }
      
      setOtp(newOtp);
      
      // Move focus to the next empty field or the last field
      const nextEmptyIndex = newOtp.findIndex(val => val === "");
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      setActiveInput(focusIndex);
      inputRefs.current[focusIndex]?.focus();
      
      // If OTP is complete after paste, call onComplete
      const otpValue = newOtp.join("");
      if (otpValue.length === length && onComplete) {
        onComplete(otpValue);
      }
    }
  };

  // Handle backspace and arrow keys for navigation
  const handleKeyDown = (e, index) => {
    if (disabled) return;
    
    // Navigate between inputs with arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1].focus();
    } else if (e.key === "Backspace") {
      // If current field is empty and backspace is pressed, go to previous field
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setActiveInput(index - 1);
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "Delete") {
      // Clear current field on Delete key
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  // Handle input focus
  const handleFocus = (index) => {
    setActiveInput(index);
  };

  // Handle click on an input
  const handleClick = (index) => {
    setActiveInput(index);
    inputRefs.current[index].focus();
  };

  return (
    <div className="otp-container" onPaste={handlePaste}>
      {Array(length)
        .fill("")
        .map((_, index) => (
          <div 
            key={index} 
            className={`otp-input-wrapper ${otp[index] ? "filled" : ""}`}
          >
            <input
              type="text"
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={otp[index]}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => handleFocus(index)}
              onClick={() => handleClick(index)}
              className={`otp-input ${activeInput === index ? "active" : ""}`}
              disabled={disabled}
              maxLength={1}
              autoComplete="off"
              inputMode="numeric"
              aria-label={`Digit ${index + 1} of verification code`}
            />
          </div>
        ))}
    </div>
  );
};

OTPInput.propTypes = {
  length: PropTypes.number,
  onComplete: PropTypes.func,
  disabled: PropTypes.bool
};

export default OTPInput;