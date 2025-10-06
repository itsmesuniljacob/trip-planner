import { z } from 'zod';

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    // Handle unexpected errors
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'An unexpected validation error occurred',
        code: 'UNKNOWN_ERROR'
      }]
    };
  }
}

// Safe validation function that returns partial data on error
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<Partial<T>> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Try to extract valid fields
      const partialData: Partial<T> = {};
      const validationErrors: ValidationError[] = [];
      
      // Parse each field individually to get partial valid data
      if (typeof data === 'object' && data !== null) {
        const dataObj = data as Record<string, unknown>;
        
        for (const [key, value] of Object.entries(dataObj)) {
          try {
            // This is a simplified approach - in practice you'd need more sophisticated partial validation
            (partialData as any)[key] = value;
          } catch {
            // Skip invalid fields
          }
        }
      }
      
      error.issues.forEach((err: any) => {
        validationErrors.push({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        });
      });
      
      return {
        success: false,
        data: partialData,
        errors: validationErrors
      };
    }
    
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'An unexpected validation error occurred',
        code: 'UNKNOWN_ERROR'
      }]
    };
  }
}

// Validation helper for arrays
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[]
): ValidationResult<T[]> {
  if (!Array.isArray(data)) {
    return {
      success: false,
      errors: [{
        field: 'root',
        message: 'Expected an array',
        code: 'INVALID_TYPE'
      }]
    };
  }
  
  const validatedItems: T[] = [];
  const errors: ValidationError[] = [];
  
  data.forEach((item, index) => {
    const result = validateData(schema, item);
    if (result.success && result.data) {
      validatedItems.push(result.data);
    } else if (result.errors) {
      result.errors.forEach(error => {
        errors.push({
          ...error,
          field: `[${index}].${error.field}`
        });
      });
    }
  });
  
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }
  
  return {
    success: true,
    data: validatedItems
  };
}

// Custom validation helpers
export const ValidationHelpers = {
  // Check if a string is a valid UUID
  isValidUUID: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },
  
  // Check if a phone number is in international format
  isValidInternationalPhone: (value: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(value);
  },
  
  // Check if a currency code is valid ISO 4217
  isValidCurrencyCode: (value: string): boolean => {
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(value);
  },
  
  // Check if a date is in the future
  isFutureDate: (date: Date): boolean => {
    return date > new Date();
  },
  
  // Check if end date is after start date
  isValidDateRange: (startDate: Date, endDate: Date): boolean => {
    return endDate >= startDate;
  },
  
  // Check if a match score is valid (0-1)
  isValidMatchScore: (score: number): boolean => {
    return score >= 0 && score <= 1;
  }
};