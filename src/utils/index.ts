export { slugify } from './slugify';
export { registerValidationRules } from './validationRules';

export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('ro-RO', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date(date));
};

export const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat('ro-RO', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 6,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isValid: password.length >= 6 && /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};