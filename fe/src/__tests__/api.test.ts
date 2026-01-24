import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from '@/lib/api';

describe('extractErrorMessage', () => {
  it('extracts message from response.data.message', () => {
    const error = {
      response: {
        data: {
          message: 'Email already exists',
        },
      },
    };
    expect(extractErrorMessage(error)).toBe('Email already exists');
  });

  it('extracts error from response.data.error', () => {
    const error = {
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    };
    expect(extractErrorMessage(error)).toBe('Invalid credentials');
  });

  it('handles string response data', () => {
    const error = {
      response: {
        data: 'Server error occurred',
      },
    };
    expect(extractErrorMessage(error)).toBe('Server error occurred');
  });

  it('joins array of errors', () => {
    const error = {
      response: {
        data: {
          errors: ['Name is required', 'Email is invalid'],
        },
      },
    };
    expect(extractErrorMessage(error)).toBe('Name is required, Email is invalid');
  });

  it('falls back to error.message', () => {
    const error = {
      message: 'Network error',
    };
    expect(extractErrorMessage(error)).toBe('Network error');
  });

  it('returns default message when no error info available', () => {
    const error = {};
    expect(extractErrorMessage(error)).toBe('An unexpected error occurred');
  });

  it('handles null/undefined error', () => {
    expect(extractErrorMessage(null)).toBe('An unexpected error occurred');
    expect(extractErrorMessage(undefined)).toBe('An unexpected error occurred');
  });
});
