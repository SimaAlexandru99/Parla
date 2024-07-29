'use client'
import React, { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/client/LanguageContext";
import { signinTestimonials } from '@/constants/testimonials';
import Link from 'next/link';

interface SignInFormData {
    email: string;
    password: string;
}

const SignIn = () => {
    const [signInWithEmailAndPassword, user, loading, firebaseError] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, watch } = useForm<SignInFormData>();
    const { toast } = useToast();
    const [isFormValid, setIsFormValid] = useState(false);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);

    const watchEmail = watch("email");
    const watchPassword = watch("password");

    useEffect(() => {
        setIsFormValid(!!watchEmail && !!watchPassword);
    }, [watchEmail, watchPassword]);

    const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
        try {
            const result = await signInWithEmailAndPassword(data.email, data.password);
            if (result) {
                router.push('/');  // Navigate to home page on successful login
            } else {
                toast({
                    variant: "destructive",
                    title: t.errors.signInError,
                    description: t.errors.invalidCredential,
                });
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            toast({
                variant: "destructive",
                title: t.errors.signInError,
                description: t.errors.generalError,
            });
        }
    };

    useEffect(() => {
        if (firebaseError) {
            let errorMessage = t.errors.generalError;
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                    errorMessage = t.errors.emailNotFound;
                    break;
                case 'auth/wrong-password':
                    errorMessage = t.errors.wrongPassword;
                    break;
                case 'auth/invalid-email':
                    errorMessage = t.errors.invalidEmail;
                    break;
                case 'auth/user-disabled':
                    errorMessage = t.errors.userDisabled;
                    break;
            }
            toast({
                variant: "destructive",
                title: t.errors.authenticationError,
                description: errorMessage,
            });
        }
    }, [firebaseError, toast, t]);

    const changeTestimonial = (direction: 'next' | 'prev') => {
        setCurrentTestimonialIndex(prevIndex => {
            if (direction === 'next') {
                return (prevIndex + 1) % signinTestimonials.length;
            } else {
                return prevIndex === 0 ? signinTestimonials.length - 1 : prevIndex - 1;
            }
        });
    };

    return (
        <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>

            <Card className="m-auto w-full max-w-6xl bg-zinc-900 rounded-3xl overflow-hidden flex flex-col md:flex-row relative z-10">
                <div className="w-full md:w-1/2 p-6 md:p-12 text-white">
                    <CardHeader>
                        <Image src="/logo.png" alt="Parla Logo" width={50} height={50} />
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-xl mb-6 md:mb-8">{t.signinPage.title}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                            <div>
                                <Label htmlFor="email">{t.signinPage.emailLabel}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t.signinPage.emailPlaceholder}
                                    {...register("email", {
                                        required: t.errors.emailRequired,
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: t.errors.invalidEmail
                                        }
                                    })}
                                    className="bg-zinc-800 text-white border-zinc-700"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="password">{t.signinPage.passwordLabel}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t.signinPage.passwordPlaceholder}
                                        {...register("password", {
                                            required: t.errors.passwordRequired,
                                            minLength: {
                                                value: 6,
                                                message: t.errors.invalidPassword
                                            }
                                        })}
                                        className="bg-zinc-800 text-white border-zinc-700"
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
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                <Link href="/forgot-password" className="text-sm text-right block mt-2 text-zinc-400">{t.signinPage.forgotPassword}</Link>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                                disabled={loading || !isFormValid}
                            >
                                {loading ? t.signinPage.signingInButton : t.signinPage.signInButton}
                            </Button>
                        </form>
                        <p className="text-center mt-6 md:mt-8 text-zinc-400">
                            {t.signinPage.dontHaveAccount}{" "}
                            <Link href="/signup" className="underline">{t.signinPage.createAccount}</Link>
                        </p>
                    </CardContent>
                </div>

                <div className="w-full md:w-1/2 bg-accent p-6 md:p-12 flex flex-col justify-between relative">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-accent-foreground">{t.signinPage.testimonialTitle}</h2>
                        <blockquote className="text-lg md:text-xl mb-4 md:mb-6 relative text-accent-foreground">
                            <span className="text-4xl md:text-6xl absolute -top-4 md:-top-6 -left-2 md:-left-4">&ldquo;</span>
                            &ldquo;{signinTestimonials[currentTestimonialIndex].quote}&rdquo;
                        </blockquote>
                        <p className="font-bold text-accent-foreground">{signinTestimonials[currentTestimonialIndex].author}</p>
                        <p className="text-accent-foreground/80">{signinTestimonials[currentTestimonialIndex].title}</p>
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
                            <CardTitle className="text-lg md:text-xl">{t.signinPage.cardTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                {t.signinPage.cardDescription}
                            </p>
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
            </Card>
        </div>
    );
};

export default SignIn;