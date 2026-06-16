import { describe, it, expect } from 'vitest';
import { validateAuthInput } from './authValidation';

describe('GreenTrack Authentication Input Validation Tests', () => {
  describe('Email Recheck Validation', () => {
    it('should validate correctly formatted emails', () => {
      const result = validateAuthInput({ email: 'user@greentrack.ai' });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject email without @ symbol', () => {
      const result = validateAuthInput({ email: 'invalid-email-format' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Please enter a valid email address');
    });

    it('should reject email without domain suffix', () => {
      const result = validateAuthInput({ email: 'john@doe' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Please enter a valid email address');
    });

    it('should reject empty email inputs', () => {
      const result = validateAuthInput({ email: '' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Please enter your email address');
    });
  });

  describe('Registration Rules & Password Confirmation Recheck', () => {
    it('should validate a correct registration payload', () => {
      const result = validateAuthInput({
        email: 'warrior@earth.org',
        password: 'securepassword123',
        isRegister: true,
        name: 'Eco Champion',
        confirmPassword: 'securepassword123'
      });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject registration when name is missing', () => {
      const result = validateAuthInput({
        email: 'warrior@earth.org',
        password: 'securepassword123',
        isRegister: true,
        name: '',
        confirmPassword: 'securepassword123'
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Please enter your full name');
    });

    it('should reject registration when password is less than 6 characters', () => {
      const result = validateAuthInput({
        email: 'warrior@earth.org',
        password: '12345',
        isRegister: true,
        name: 'Eco Champion',
        confirmPassword: '12345'
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Password must contain at least 6 characters');
    });

    it('should reject registration when confirmpassword does not match original password', () => {
      const result = validateAuthInput({
        email: 'warrior@earth.org',
        password: 'supersecurepassword',
        isRegister: true,
        name: 'Eco Champion',
        confirmPassword: 'differentpassword!'
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Passwords do not match');
    });
  });
});
