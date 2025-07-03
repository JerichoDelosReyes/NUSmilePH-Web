// First, let's update your SignUpReducer to support validation

export const INITIAL_STATE = {
    firstName: '',
    surname: '',
    email: '',
    idNumber: '',
    yearLevel: '',
    dob: '',
    department: '',
    program: '',
    profile: null,
    contact_no: '',
    permanent_address: '',
    emergency_person: '',
    emergency_contact_no: '',
    emergency_address: '',
    password: '',
    confirmPass: '',
    role: '',
    showPassword: false,
    showConfirmPass: false,
    otp: '',
    modalOpen: false,
    // Add validation errors object
    errors: {
        firstName: '',
        surname: '',
        email: '',
        idNumber: '',
        contact_no: '',
        emergency_contact_no: '',
        password: '',
        confirmPass: ''
    },
    formValid: false
};

export const signUpReducer = (state, action) => {
    switch(action.type) {
        case 'HANDLE_INPUT':
            const { name, value, files } = action.payload;
            let updatedState = {
                ...state,
                [name]: files ? files[0] : value
            };
            
            // Validate the field that changed
            return validateField(updatedState, name);
            
        case 'HANDLE_GENERATED_USER':
            // When generating a fake user, validate all fields
            const newState = {
                ...state,
                ...action.payload
            };
            return validateAllFields(newState);
            
        case 'HANDLE_SHOW_PASSWORD':
            return {
                ...state,
                showPassword: action.payload.value
            };
            
        case 'HANDLE_SHOW_CONFIRM_PASSWORD':
            return {
                ...state,
                showConfirmPass: action.payload.value
            };
            
        case 'HANDLE_MODAL':
            return {
                ...state,
                modalOpen: action.payload
            };
            
        default:
            return state;
    }
};

// Validate a single field and update errors
const validateField = (state, fieldName) => {
    const { firstName, surname, email, idNumber, contact_no, emergency_contact_no, password, confirmPass } = state;
    const errors = { ...state.errors };
    
    switch(fieldName) {
        case 'firstName':
            errors.firstName = firstName.trim() ? 
                /^[A-Za-z\s]+$/.test(firstName) ? '' : 'First name should contain only letters' 
                : 'First name is required';
            break;
            
        case 'surname':
            errors.surname = surname.trim() ? 
                /^[A-Za-z\s]+$/.test(surname) ? '' : 'Last name should contain only letters' 
                : 'Last name is required';
            break;
            
        case 'email':
            errors.email = email.trim() ? 
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Invalid email format' 
                : 'Email is required';
            break;
            
        case 'idNumber':
            errors.idNumber = idNumber.trim() ? 
                /^\d{10}$/.test(idNumber) ? '' : 'Student number must be 10 digits' 
                : 'Student number is required';
            break;
            
        case 'contact_no':
            errors.contact_no = contact_no.trim() ? 
                /^[0-9()+\-\s]+$/.test(contact_no) ? '' : 'Invalid contact number format' 
                : 'Contact number is required';
            break;
            
        case 'emergency_contact_no':
            errors.emergency_contact_no = emergency_contact_no.trim() ? 
                /^[0-9()+\-\s]+$/.test(emergency_contact_no) ? '' : 'Invalid emergency contact format' 
                : 'Emergency contact number is required';
            break;
            
        case 'password':
            errors.password = password.trim() ? 
                password.length >= 8 ? 
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password) ? 
                        '' : 'Password must contain uppercase, lowercase, number, and special character' 
                    : 'Password must be at least 8 characters' 
                : 'Password is required';
                
            // When password changes, also validate confirmPass if it exists
            if (confirmPass) {
                errors.confirmPass = confirmPass === password ? '' : 'Passwords do not match';
            }
            break;
            
        case 'confirmPass':
            errors.confirmPass = confirmPass.trim() ? 
                confirmPass === password ? '' : 'Passwords do not match' 
                : 'Please confirm your password';
            break;
            
        default:
            break;
    }
    
    // Check if form is valid (no errors)
    const formValid = Object.values(errors).every(error => error === '');
    
    return {
        ...state,
        errors,
        formValid
    };
};

// Validate all fields at once (used when generating fake user)
const validateAllFields = (state) => {
    let validatedState = state;
    const fieldsToValidate = ['firstName', 'surname', 'email', 'idNumber', 'contact_no', 
                              'emergency_contact_no', 'password', 'confirmPass'];
    
    fieldsToValidate.forEach(field => {
        validatedState = validateField(validatedState, field);
    });
    
    return validatedState;
};