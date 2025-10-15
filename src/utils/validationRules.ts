import { validateEmail, validatePassword } from './index';

export const registerValidationRules = {
  firstName: (value: string) => 
    !value.trim() ? "Te rugăm sa introduci numele." : null,
  
  lastName: (value: string) => 
    !value.trim() ? "Te rugăm sa introduci numele de familie." : null,
  
  email: (value: string) => 
    !validateEmail(value) ? "Adresa de email nu este validă." : null,
  
  password: (value: string) => {
    const validation = validatePassword(value);
    if (!validation.minLength) {
      return "Parola trebuie să conțină minim 6 caractere.";
    }
    if (!validation.hasSpecialChar) {
      return "Parola trebuie să conțină cel puțin un caracter special.";
    }
    return null;
  },
  
  confirmPassword: (value: string, allValues: any) => 
    value !== allValues.password ? "Parolele nu se potrivesc." : null,
  
  phoneNumber: (value: string) => 
    value && !/^[0-9+\-\s()]+$/.test(value) ? "Numărul de telefon nu este valid." : null
};