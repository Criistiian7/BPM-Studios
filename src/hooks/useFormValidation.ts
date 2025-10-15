import { useState } from 'react';

type ValidationRule<T> = (value: T, allValues?: any) => string | null;
type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field: keyof T): string | null => {
    const rule = rules[field];
    if (!rule) return null;
    
    return rule(values[field], values);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(rules).forEach((field) => {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>));

    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const getFieldError = (field: keyof T) => {
    return touched[field] ? errors[field] : undefined;
  };

  return { 
    values, 
    errors, 
    touched,
    setValue, 
    setFieldTouched,
    validate, 
    reset,
    getFieldError,
    isValid: Object.keys(errors).length === 0
  };
};