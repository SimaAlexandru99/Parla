'use client'
import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import validateForm from '@/lib/validateForm';
import fetchCompanyByDomain from '@/hooks/usefetchCompanyByDomain';
import createUserProfile from '@/lib/createUserProfile';
import handleAuthError from '@/lib/handleAuthError';
import { useLanguage } from "@/contexts/client/LanguageContext";
import { sendEmailVerification } from "firebase/auth";
import { signupTestimonials } from '@/constants/testimonials';
import { Checkbox } from "@/components/ui/checkbox";

const SignUp = () => {
  const { t } = useLanguage();
  const [createUserWithEmailAndPassword, user, loading, firebaseError] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isFormValid, setIsFormValid] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isPasswordValid = Object.values(passwordRequirements).filter(Boolean).length >= 3;
    setIsFormValid(!!form.firstName && !!form.lastName && !!form.email && isPasswordValid && agreedToTerms);
  }, [form, passwordRequirements, agreedToTerms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [id]: value
    }));

    if (id === 'password') {
      setPasswordRequirements({
        length: value.length >= 9 && value.length <= 64,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Sign up form submitted");

    const validationError = validateForm(form.firstName, form.lastName, form.email, form.password);
    if (validationError) {
      toast({
        variant: "destructive",
        title: t.errors.validationError,
        description: validationError,
      });
      return;
    }

    try {
      const domain = form.email.split('@')[1];
      const company = await fetchCompanyByDomain(domain);

      if (!company) {
        toast({
          variant: "destructive",
          title: t.errors.companyNotFound,
          description: t.errors.companyNotFoundDescription,
        });
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(form.email, form.password);
      if (userCredential && userCredential.user) {
        const defaultProfileIcon = process.env.NEXT_PUBLIC_DEFAULT_PROFILE_ICON_URL || "https://example.com/default-profile-icon.png";
        await createUserProfile(userCredential.user, form.firstName, form.lastName, company.name, defaultProfileIcon);
        await sendEmailVerification(userCredential.user);
        router.push(`/verify-email?email=${encodeURIComponent(userCredential.user.email!)}`);
      }
    } catch (error: any) {
      handleAuthError(error, (message) => {
        toast({
          variant: "destructive",
          title: t.errors.signUpError,
          description: message,
        });
      });
    }
  };

  const changeTestimonial = (direction: 'next' | 'prev') => {
    setCurrentTestimonialIndex(prevIndex => {
      if (direction === 'next') {
        return (prevIndex + 1) % signupTestimonials.length;
      } else {
        return prevIndex === 0 ? signupTestimonials.length - 1 : prevIndex - 1;
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>

      <Card className="m-auto w-full max-w-6xl bg-zinc-900 rounded-3xl overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Left side - Testimonial */}
        <div className="w-full md:w-1/2 bg-accent p-6 md:p-12 flex flex-col justify-between relative">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-accent-foreground">{t.signupPage.testimonialTitle}</h2>
            <blockquote className="text-lg md:text-xl mb-4 md:mb-6 relative text-accent-foreground">
              <span className="text-4xl md:text-6xl absolute -top-4 md:-top-6 -left-2 md:-left-4">&ldquo;</span>
              &ldquo;{signupTestimonials[currentTestimonialIndex].quote}&rdquo;
            </blockquote>
            <p className="font-bold text-accent-foreground">{signupTestimonials[currentTestimonialIndex].author}</p>
            <p className="text-accent-foreground/80">{signupTestimonials[currentTestimonialIndex].title}</p>
            <div className="flex space-x-2 my-4 md:mb-8">
            <Button
              variant="secondary"
              size="icon"
              className="bg-zinc-800 text-white"
              onClick={() => changeTestimonial('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-zinc-800 text-white"
              onClick={() => changeTestimonial('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          </div>

          <Card className="rounded-2xl p-4 md:p-6 pr-8 md:pr-12 relative">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">{t.signupPage.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t.signupPage.cardDescription}</p>
            </CardContent>
            <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
              <Image
                src="/gemini.svg"
                alt="Gemini"
                width={25}
                height={25}
                className="transition-all ease-in duration-500 opacity-100 translate-y-0"
              />
            </div>
          </Card>
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-accent-foreground/20 rounded-bl-full"></div>
        </div>

        {/* Right side - Sign-up form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 text-white">
          <CardHeader>
            <Image src="/logo.png" alt="Parla Logo" width={50} height={50} />
          </CardHeader>
          <CardContent>
            <h2 className="text-xl mb-6 md:mb-8">{t.signupPage.title}</h2>
            <form onSubmit={handleSignUp} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.signupPage.firstName}</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    ref={firstNameRef}
                    className="bg-zinc-800 text-white border-zinc-700"
                    placeholder={t.signupPage.firstNamePlaceholder}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.signupPage.lastName}</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    ref={lastNameRef}
                    className="bg-zinc-800 text-white border-zinc-700"
                    placeholder={t.signupPage.lastNamePlaceholder}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t.signupPage.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  ref={emailRef}
                  className="bg-zinc-800 text-white border-zinc-700"
                  placeholder={t.signupPage.emailPlaceholder}
                />
              </div>
              <div>
                <Label htmlFor="password">{t.signupPage.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleInputChange}
                    ref={passwordRef}
                    className="bg-zinc-800 text-white border-zinc-700"
                    placeholder={t.signupPage.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-sm">
                  <p>Password must:</p>
                  <ul className="list-disc pl-5">
                    <li className={passwordRequirements.length ? 'text-green-500' : 'text-red-500'}>
                      Be between 9 and 64 characters
                    </li>
                    <li className={
                      (passwordRequirements.uppercase ? 'text-green-500' : 'text-red-500') + 
                      (passwordRequirements.lowercase ? ' text-green-500' : ' text-red-500') + 
                      (passwordRequirements.number ? ' text-green-500' : ' text-red-500') + 
                      (passwordRequirements.special ? ' text-green-500' : ' text-red-500')
                    }>
                      Include at least two of the following:
                      <ul className="list-disc pl-5">
                        <li className={passwordRequirements.uppercase ? 'text-green-500' : 'text-red-500'}>An uppercase character</li>
                        <li className={passwordRequirements.lowercase ? 'text-green-500' : 'text-red-500'}>A lowercase character</li>
                        <li className={passwordRequirements.number ? 'text-green-500' : 'text-red-500'}>A number</li>
                        <li className={passwordRequirements.special ? 'text-green-500' : 'text-red-500'}>A special character</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to Parla&apos;s Privacy Policy and Terms of Service
                </label>
              </div>
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading || !isFormValid}
              >
                {loading ? t.signupPage.signingUpButton : t.signupPage.signUpButton}
              </Button>
            </form>
            <p className="text-center mt-6 md:mt-8 text-zinc-400">
              {t.signupPage.alreadyHaveAccount}{" "}
              <Link href="/signin" className="underline">
                {t.signupPage.loginLink}
              </Link>
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;