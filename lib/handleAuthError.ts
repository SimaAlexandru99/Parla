const handleAuthError = (
  error: any,
  setErrorMessage: (message: string) => void
) => {
  const message =
    error.code === "auth/email-already-in-use"
      ? "Adresa de email este deja în uz."
      : "A apărut o eroare la crearea contului.";
  setErrorMessage(message);
  console.error(error);
};

export default handleAuthError;
