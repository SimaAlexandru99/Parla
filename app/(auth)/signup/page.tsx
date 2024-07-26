'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { sendEmailVerification } from "firebase/auth";
import { EyeOpenIcon, EyeClosedIcon, ReloadIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import { AlertDestructive } from "@/components/ui/alert-custom";
import validateForm from '@/lib/validateForm';
import fetchCompanyByDomain from '@/hooks/usefetchCompanyByDomain';
import createUserProfile from '@/lib/createUserProfile';
import handleAuthError from '@/lib/handleAuthError';
import { useLanguage } from "@/contexts/client/LanguageContext";

const SignUp = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);

  // Create refs for each input
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Keep track of the last focused input
  const [lastFocusedInput, setLastFocusedInput] = useState<string | null>(null);

  // Effect to refocus the last focused input after re-render
  useEffect(() => {
    if (lastFocusedInput) {
      const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
        firstName: firstNameRef,
        lastName: lastNameRef,
        email: emailRef,
        password: passwordRef,
      };
      refMap[lastFocusedInput]?.current?.focus();
    }
  }, [form, lastFocusedInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [id]: value
    }));
    setLastFocusedInput(id);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Sign up form submitted");

    const validationError = validateForm(form.firstName, form.lastName, form.email, form.password);
    if (validationError) {
      setErrorMessage(validationError);
      setIsSubmitting(false);
      console.log("Validation error:", validationError);
      return;
    }

    try {
      const domain = form.email.split('@')[1];
      const company = await fetchCompanyByDomain(domain);
      console.log("Fetched company:", company);

      if (!company) {
        setErrorMessage("Company not found for the provided email domain.");
        setIsSubmitting(false);
        console.log("Company not found for domain:", domain);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(form.email, form.password);
      if (userCredential && userCredential.user) {
        const defaultProfileIcon = process.env.NEXT_PUBLIC_DEFAULT_PROFILE_ICON_URL || "https://example.com/default-profile-icon.png";
        await createUserProfile(userCredential.user, form.firstName, form.lastName, company.name, defaultProfileIcon);
        await sendEmailVerification(userCredential.user);
        redirectToVerificationPage(userCredential.user.email);
      }
    } catch (error: any) {
      handleAuthError(error, setErrorMessage);
      console.log("Error during sign up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectToVerificationPage = (email: string | null) => {
    if (email) {
      resetForm();
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      setErrorMessage(t.errors.generalError);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    setErrorMessage('');
  };

  const FormInput = ({ id, label, type = "text", value, onChange, inputRef }: { id: string, label: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, inputRef: React.RefObject<HTMLInputElement> }) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        ref={inputRef}
        onFocus={() => setLastFocusedInput(id)}
      />
    </div>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        {t.buttons.back}
      </Button>
      {errorMessage && (
        <AlertDestructive message={errorMessage} title="Eroare" />
      )}
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t.titles.register}</CardTitle>
          <CardDescription>
            {t.descriptions.register}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput id="firstName" label={t.labels.firstName} value={form.firstName} onChange={handleInputChange} inputRef={firstNameRef} />
              <FormInput id="lastName" label={t.labels.lastName} value={form.lastName} onChange={handleInputChange} inputRef={lastNameRef} />
            </div>
            <FormInput id="email" label={t.labels.email} type="email" value={form.email} onChange={handleInputChange} inputRef={emailRef} />
            <div className="grid gap-2 relative">
              <Label htmlFor="password">{t.labels.password}</Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  ref={passwordRef}
                  onFocus={() => setLastFocusedInput('password')}
                />
                <button
                  type="button"
                  className="absolute right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeClosedIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeOpenIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {isSubmitting ? (
              <Button disabled className="w-full">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                {t.loading.loadingPage}
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                {t.buttons.register}
              </Button>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            {t.links.alreadyHaveAccount}{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;