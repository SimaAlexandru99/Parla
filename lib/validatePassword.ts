// lib/validatePassword.ts
const validatePassword = (password: string): string | null => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    if (password.length < minLength) {
      return `Parola trebuie să aibă minim ${minLength} caractere.`;
    }
    if (!hasUpperCase) {
      return 'Parola trebuie să conțină cel puțin o literă mare.';
    }
    if (!hasLowerCase) {
      return 'Parola trebuie să conțină cel puțin o literă mică.';
    }
    if (!hasNumber) {
      return 'Parola trebuie să conțină cel puțin un număr.';
    }
    if (!hasSpecialChar) {
      return 'Parola trebuie să conțină cel puțin un caracter special.';
    }
  
    return null;
  };
  
  export default validatePassword;
  