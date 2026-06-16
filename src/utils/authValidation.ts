export interface AuthValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates the authentication inputs for registration and login
 * Checking formatting rules, email structure, password constraints, and match rechecks.
 */
export function validateAuthInput(inputs: {
  email: string;
  password?: string;
  isRegister?: boolean;
  name?: string;
  confirmPassword?: string;
}): AuthValidationResult {
  const email = inputs.email ? inputs.email.trim() : '';
  const password = inputs.password || '';
  const isRegister = !!inputs.isRegister;
  const name = inputs.name ? inputs.name.trim() : '';
  const confirmPassword = inputs.confirmPassword || '';

  // 1. Check email structure (Mail structure recheck)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return {
      isValid: false,
      error: 'Please enter your email address.'
    };
  }
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. user@greentrack.ai).'
    };
  }

  // 2. Extra validations if registering a new profile
  if (isRegister) {
    if (!name) {
      return {
        isValid: false,
        error: 'Please enter your full name to generate a green profile.'
      };
    }
    if (password.length < 6) {
      return {
        isValid: false,
        error: 'Password must contain at least 6 characters.'
      };
    }
    if (password !== confirmPassword) {
      return {
        isValid: false,
        error: 'Passwords do not match. Please verify your secure password recheck matches original password.'
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
}
