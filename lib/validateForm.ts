import validatePassword from "./validatePassword";

const validateForm = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): string | null => {
  if (firstName.length < 3)
    return "Prenumele trebuie să aibă minim 3 caractere.";
  if (lastName.length < 3) return "Numele trebuie să aibă minim 3 caractere.";
  if (!email.endsWith("@optimacall.ro"))
    return "Adresa de email trebuie să fie @optimacall.ro";
  const passwordError = validatePassword(password);
  return passwordError || null;
};

export default validateForm;
