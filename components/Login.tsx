'use client'

import React, { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

const errorMessages = {
    emailNotFound: "The email address was not found. Please register or try again.",
    enterDob: "Please enter your date of birth.",
    generalError: "An error occurred. Please try again.",
    invalidCredential: "Invalid credentials. Please check your email and password and try again.",
    invalidEmail: "The email address is incorrectly formatted.",
    invalidPassword: "Password must be at least 6 characters long.",
    selectDepartment: "Please select a department.",
    selectPartner: "Please select a partner.",
    selectProject: "Please select a project.",
    selectTeamLeader: "Please select a team leader.",
    userDisabled: "This user has been disabled.",
    wrongPassword: "Incorrect password. Please try again.",
};

interface SignInFormData {
    email: string;
    password: string;
}

const testimonials = [
    {
        quote: "Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.",
        author: "Mas Parjono",
        title: "UI Designer at Google"
    },
    {
        quote: "This platform revolutionized my job search. I found my ideal position within weeks!",
        author: "Sarah Johnson",
        title: "Software Engineer at Amazon"
    },
    {
        quote: "The user-friendly interface and powerful search tools make job hunting a breeze.",
        author: "Alex Chen",
        title: "Data Analyst at Microsoft"
    }
];

const SignIn = () => {
    const [signInWithEmailAndPassword, user, loading, firebaseError] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, watch } = useForm<SignInFormData>();
    const { toast } = useToast();
    const [isFormValid, setIsFormValid] = useState(false);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

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
                    title: "Sign In Error",
                    description: errorMessages.invalidCredential,
                });
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            toast({
                variant: "destructive",
                title: "Sign In Error",
                description: errorMessages.generalError,
            });
        }
    };

    useEffect(() => {
        if (firebaseError) {
            let errorMessage = errorMessages.generalError;
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                    errorMessage = errorMessages.emailNotFound;
                    break;
                case 'auth/wrong-password':
                    errorMessage = errorMessages.wrongPassword;
                    break;
                case 'auth/invalid-email':
                    errorMessage = errorMessages.invalidEmail;
                    break;
                case 'auth/user-disabled':
                    errorMessage = errorMessages.userDisabled;
                    break;
            }
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: errorMessage,
            });
        }
    }, [firebaseError, toast]);

    const changeTestimonial = (direction: 'next' | 'prev') => {
        setCurrentTestimonialIndex(prevIndex => {
            if (direction === 'next') {
                return (prevIndex + 1) % testimonials.length;
            } else {
                return prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
            }
        });
    };

    return (
        <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
            {/* Dimmed light effect */}
            <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>

            <Card className="m-auto w-full max-w-6xl bg-zinc-900 rounded-3xl overflow-hidden flex flex-col md:flex-row relative z-10">
                {/* Left side - Sign-in form */}
                <div className="w-full md:w-1/2 p-6 md:p-12 text-white">
                    <CardHeader>
                        <Image src="/logo.png" alt="Parla Logo" width={50} height={50} />
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-xl mb-6 md:mb-8">Please Enter your Account details</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: errorMessages.invalidEmail
                                        }
                                    })}
                                    className="bg-zinc-800 text-white border-zinc-700"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: errorMessages.invalidPassword
                                        }
                                    })}
                                    className="bg-zinc-800 text-white border-zinc-700"
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                <a href="#" className="text-sm text-right block mt-2 text-zinc-400">Forgot Password</a>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                                disabled={loading || !isFormValid}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                        <p className="text-center mt-6 md:mt-8 text-zinc-400">
                            <a href="#" className="underline">Create an account</a>
                        </p>
                    </CardContent>
                </div>

                {/* Right side - Testimonial */}
                <div className="w-full md:w-1/2 bg-accent p-6 md:p-12 flex flex-col justify-between relative">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-accent-foreground">What&apos;s our<br />Jobseekers Said.</h2>
                        <blockquote className="text-lg md:text-xl mb-4 md:mb-6 relative text-accent-foreground">
                            <span className="text-4xl md:text-6xl absolute -top-4 md:-top-6 -left-2 md:-left-4">&ldquo;</span>
                            &ldquo;{testimonials[currentTestimonialIndex].quote}&rdquo;
                        </blockquote>
                        <p className="font-bold text-accent-foreground">{testimonials[currentTestimonialIndex].author}</p>
                        <p className="text-accent-foreground/80">{testimonials[currentTestimonialIndex].title}</p>
                    </div>
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
                    <Card className="rounded-2xl p-4 md:p-6 pr-8 md:pr-12 relative">
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">Get your right job and right place apply now</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                Be among the first founders to experience the easiest way to start run a business.
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