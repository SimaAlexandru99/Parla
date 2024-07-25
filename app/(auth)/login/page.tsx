'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from "next/navigation";
import { AlertDestructive } from "@/components/ui/alert-custom";
import { doc, getDoc } from "firebase/firestore";
import Loading from "@/components/Loading";
import { ChevronLeft, Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
    const { t } = useLanguage();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [navLoading, setNavLoading] = useState<boolean>(false);
    const { theme, setTheme } = useTheme();
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

    const [testimonial, setTestimonial] = useState(t.testimonials[0]);

    const handleError = useCallback((error: any) => {
        const errorMessages: { [key: string]: string } = {
            'auth/user-not-found': t.errors.emailNotFound,
            'auth/wrong-password': t.errors.wrongPassword,
            'auth/invalid-credential': t.errors.invalidCredential,
            'auth/invalid-email': t.errors.invalidEmail,
            'auth/user-disabled': t.errors.userDisabled
        };
        setErrorMessage(errorMessages[error.code] || t.errors.generalError);
    }, [t.errors]);

    useEffect(() => {
        if (error) handleError(error);
    }, [error, handleError]);

    const checkIfFirstLogin = useCallback(async (uid: string) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        router.push(userDoc.exists() && userDoc.data().firstLoginCompleted ? '/' : '/get-started');
    }, [router]);

    useEffect(() => {
        if (user) checkIfFirstLogin(user.user.uid);
    }, [user, checkIfFirstLogin]);

    useEffect(() => {
        const timer = setTimeout(() => setPageLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setTestimonial(t.testimonials[Math.floor(Math.random() * t.testimonials.length)]);
    }, [t.testimonials]);

    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

    const validatePassword = (password: string): boolean => password.length >= 6;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setEmailError(null);
        setPasswordError(null);

        if (!validateEmail(email)) {
            setEmailError(t.errors.invalidEmail);
            return;
        }
        if (!validatePassword(password)) {
            setPasswordError(t.errors.invalidPassword);
            return;
        }

        try {
            await signInWithEmailAndPassword(email, password);
        } catch (error) {
            handleError(error);
        }
    };

    const handleNavigation = (url: string) => {
        setNavLoading(true);
        router.push(url);
    };

    if (pageLoading || navLoading) {
        return <Loading />;
    }

    const handleThemeToggle = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <main>
            <div className="relative h-max">
                <div className="mx-auto flex w-full flex-col justify-center px-5 pt-0 md:h-[unset] md:max-w-[80%] lg:h-[100vh] 2xl:max-w-[66%]  lg:px-6 xl:pl-0">
                    <Link className="mt-10 w-fit" href="/">
                        <div className="flex w-fit items-center lg:pl-0 lg:pt-0 xl:pt-0">
                            <ChevronLeft width={20} height={20} />
                            <p className="ml-0 text-sm">{t.buttons.backToHome}</p>
                        </div>
                    </Link>
                    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-auto lg:max-w-[420px]">
                        <div className="mb-5">
                            <p className="text-[32px] font-bold">{t.links.authentication}</p>
                            <p className="mb-2.5 mt-2.5 font-normal">
                                {t.descriptions.enterEmail}
                            </p>
                        </div>
                        <Separator />
                        <div className="mt-10">

                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t.labels.email}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="m@example.com"
                                        required
                                        className="p-5"
                                        disabled={loading || pageLoading}
                                    />
                                    {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">{t.labels.password}</Label>
                                        <Link
                                            href="/forgot-password"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavigation('/forgot-password');
                                            }}
                                            className="ml-auto text-sm underline"
                                        >
                                            {t.links.forgetPassword}
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        className="p-5"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading || pageLoading}
                                    />
                                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                                </div>
                                <Button type="submit" className="w-full p-7" disabled={loading || pageLoading}>
                                    {pageLoading ? t.loading.loadingPage : loading ? t.loading.loadingAuthentication : t.links.authentication}
                                </Button>
                            </form>
                            {errorMessage && (
                                <AlertDestructive message={errorMessage} title="Eroare" />
                            )}
                        </div>
                        <div className="mt-4 text-center text-sm">
                            {t.links.dontHaveAccount}{" "}
                            <Link href="/signup" onClick={(e) => {
                                e.preventDefault();
                                handleNavigation('/signup');
                            }} className="underline">
                                {t.links.register}
                            </Link>
                        </div>
                    </div>
                    <div className="absolute right-0 hidden h-full min-h-[100vh] xl:block xl:w-[50vw] 2xl:w-[44vw]">
                        <div className="absolute flex h-full w-full flex-col items-end justify-center bg-zinc-950 dark:bg-zinc-900">
                            <div className="mb-[160px] mt-8 flex w-full items-center justify-center">
                                <div className="me-2 flex h-[76px] w-[76px] items-center justify-center rounded-md bg-white text-zinc-950 dark:text-zinc-900">
                                    <Zap width={45} height={45} />
                                </div>
                                <h5 className="text-4xl font-bold leading-5 text-white">Horizon AI</h5>
                            </div>
                            <div className="flex w-full flex-col items-center justify-center text-2xl font-bold text-white">
                                <h4 className="mb-5 flex w-[600px] items-center justify-center rounded-md text-center text-2xl font-bold">
                                    {testimonial.text}
                                </h4>
                                <h5 className="text-xl font-medium leading-5 text-zinc-300">{testimonial.author}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="z-[3] flex flex-col items-center justify-between pb-[30px] md:px-0 lg:flex-row">
                        <ul className="flex flex-row">
                            <li className="mr-4 md:mr-[44px]">
                                <Link className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm" target="_blank" href="https://horizon-ui.notion.site/Terms-Conditions-c671e573673746e19d2fc3e4cba0c161">
                                    {t.links.termsAndConditions}
                                </Link>
                            </li>
                            <li className="mr-4 md:mr-[44px]">
                                <Link className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm" target="_blank" href="https://horizon-ui.notion.site/Privacy-Policy-c22ff04f55474ae3b35ec45feca62bad">
                                    {t.links.privacyPolicy}
                                </Link>
                            </li>
                            <li className="mr-4 md:mr-[44px]">
                                <Link className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm" target="_blank" href="https://horizon-ui.notion.site/End-User-License-Agreement-8fb09441ea8c4c08b60c37996195a6d5">
                                    {t.links.license}
                                </Link>
                            </li>
                            <li>
                                <Link className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm" target="_blank" href="https://horizon-ui.notion.site/Refund-Policy-1b0983287b92486cb6b18071b2343ac9">
                                    {t.links.refundPolicy}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <Toggle
                        className="items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 absolute bottom-10 right-10 flex min-h-10 min-w-10 cursor-pointer rounded-full bg-zinc-950 p-0 text-xl text-white hover:bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:dark:bg-white xl:bg-white xl:text-zinc-950 xl:hover:bg-white xl:dark:text-zinc-900"
                        onClick={handleThemeToggle}
                    >
                        {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Toggle>
                </div>

            </div>
        </main>
    );
}
