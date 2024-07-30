'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { auth, db } from '@/lib/firebase/config';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SelectComponent } from '@/components/SelectComponent';
import { ReloadIcon } from '@radix-ui/react-icons';
import { AlertDestructive } from "@/components/ui/alert-custom";
import useFetchUserData from '@/hooks/useFetchUserData';
import useFetchProjects from '@/hooks/useFetchProjects';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import useFetchTeamLeaders from '@/hooks/useFetchTeamLeaders';
import useFetchPartners from '@/hooks/useFetchPartners';
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/client/LanguageContext";

const saveUserData = async (userId: string, data: any) => {
    try {
        await setDoc(doc(db, "users", userId), data, { merge: true });
    } catch (error) {
        throw new Error("Error saving user data");
    }
};

const GetStarted = () => {
    const { userData, loading: userLoading, error: userError } = useFetchUserData();
    const [partner, setPartner] = useState<string>(userData?.partner || '');
    const [department, setDepartment] = useState<string>(userData?.department || '');
    const [dob, setDob] = useState<string>(userData?.dob || '');
    const [project, setSelectedProject] = useState<string>('');
    const [teamLeader, setTeamLeader] = useState<string>('');
    const [profileIcons, setProfileIcons] = useState<string[]>([]);
    const [profileIcon, setProfileIcon] = useState<string>('');
    const [iconsLoading, setIconsLoading] = useState<boolean>(true);
    const router = useRouter();
    const [step, setStep] = useState<number>(1);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { t } = useLanguage();

    const { partners, loading: partnersLoading, error: partnersError } = useFetchPartners(userData?.company || '');
    const { projects, loadingProjects, error: projectsError } = useFetchProjects(partner, userData?.company || '');
    const { departments, loadingDepartments, error: departmentsError } = useFetchDepartments(partner, project, userData?.company || '');
    const { teamLeaders, loadingTeamLeaders, error: teamLeadersError } = useFetchTeamLeaders(department, project, partner, userData?.company || '');

    useEffect(() => {
        const fetchAvatars = async () => {
            const storage = getStorage();
            const avatarsRef = ref(storage, 'avatars/');
            const avatarsList = await listAll(avatarsRef);
            const urls = await Promise.all(avatarsList.items.map(item => getDownloadURL(item)));
            setProfileIcons(urls);
            setIconsLoading(false);
        };
        fetchAvatars();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const user = auth.currentUser;
            if (user) {
                const userData = {
                    partner,
                    project,
                    department,
                    teamLeader,
                    dob,
                    profileIcon,
                    firstLoginCompleted: true,
                    role: "user"
                };

                await saveUserData(user.uid, userData);
                setSuccess(true);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            setErrorMessage("Failed to save user data. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setErrorMessage('');
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const isAdult = (dob: string): boolean => {
        const today = new Date();
        const birthDate = new Date(dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        const dayDifference = today.getDate() - birthDate.getDate();

        if (age > 18) return true;
        if (age === 18 && (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0))) return true;
        return false;
    };

    const validateCurrentStep = () => {
        switch (step) {
            case 2:
                if (!partner) {
                    setErrorMessage(t.errors.selectPartner);
                    return false;
                }
                return true;
            case 3:
                if (!project) {
                    setErrorMessage(t.errors.selectProject);
                    return false;
                }
                return true;
            case 4:
                if (!department) {
                    setErrorMessage(t.errors.selectDepartment);
                    return false;
                }
                return true;
            case 5:
                if (!teamLeader) {
                    setErrorMessage(t.errors.selectTeamLeader);
                    return false;
                }
                return true;
            case 6:
                if (!dob) {
                    setErrorMessage(t.errors.enterDob);
                    return false;
                } else if (!isAdult(dob)) {
                    setErrorMessage("You must be at least 18 years old.");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const getTitleAndDescription = () => {
        if (success) {
            return {
                title: t.titles.success,
                description: t.descriptions.success,
            };
        }

        switch (step) {
            case 1:
                return {
                    title: t.titles.welcome,
                    description: t.descriptions.welcome,
                };
            case 2:
                return {
                    title: t.titles.choosePartner,
                    description: t.descriptions.choosePartner,
                };
            case 3:
                return {
                    title: t.titles.chooseProject,
                    description: t.descriptions.chooseProject,
                };
            case 4:
                return {
                    title: t.titles.chooseDepartment,
                    description: t.descriptions.chooseDepartment,
                };
            case 5:
                return {
                    title: t.titles.chooseTeamLeader,
                    description: t.descriptions.chooseTeamLeader,
                };
            case 6:
                return {
                    title: t.titles.enterDob,
                    description: t.descriptions.enterDob,
                };
            case 7:
                return {
                    title: t.titles.chooseProfileIcon,
                    description: t.descriptions.chooseProfileIcon,
                };
            default:
                return {
                    title: t.titles.default,
                    description: t.descriptions.default,
                };
        }
    };

    const { title, description } = getTitleAndDescription();

    return (
        <div className="flex min-h-screen bg-teal-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-teal-800/30 via-teal-900/60 to-teal-950 pointer-events-none"></div>

            <Card className="m-auto w-full max-w-6xl bg-zinc-900 rounded-3xl overflow-hidden flex flex-col md:flex-row relative z-10">
                <div className="w-full md:w-1/2 p-6 md:p-12 text-white">
                    <CardHeader>
                        <Image src="/logo.png" alt="Parla Logo" width={50} height={50} />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-xl mb-6 md:mb-8">{title}</CardTitle>
                        <CardDescription className="mb-6">{description}</CardDescription>
                        {errorMessage && (
                            <AlertDestructive message={errorMessage} title="Error" />
                        )}
                        {userLoading || partnersLoading ? (
                            <div className="flex items-center">
                                <ReloadIcon className="animate-spin mr-2" />
                                <p>{t.loading.loadingPage}</p>
                            </div>
                        ) : success ? (
                            <div className="grid gap-4">
                                <Button onClick={() => router.push('/')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    {t.buttons.goToHome}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                                {step === 2 && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="partner">{t.labels.partner}</Label>
                                        <SelectComponent
                                            value={partner}
                                            onChange={setPartner}
                                            options={partners}
                                            loading={partnersLoading}
                                            id="partner"
                                            name="partner"
                                            placeholder={t.placeholders.partner}
                                        />
                                    </div>
                                )}
                                {step === 3 && partner && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="selectedProject">{t.labels.project}</Label>
                                        <SelectComponent
                                            value={project}
                                            onChange={setSelectedProject}
                                            options={projects}
                                            loading={loadingProjects}
                                            id="selectedProject"
                                            name="selectedProject"
                                            placeholder={t.placeholders.project}
                                        />
                                    </div>
                                )}
                                {step === 4 && partner && project && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="department">{t.labels.department}</Label>
                                        <SelectComponent
                                            value={department}
                                            onChange={setDepartment}
                                            options={departments}
                                            loading={loadingDepartments}
                                            id="department"
                                            name="department"
                                            placeholder={t.placeholders.department}
                                        />
                                    </div>
                                )}
                                {step === 5 && department && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="teamLeader">{t.labels.teamLeader}</Label>
                                        <SelectComponent
                                            value={teamLeader}
                                            onChange={setTeamLeader}
                                            options={teamLeaders}
                                            loading={loadingTeamLeaders}
                                            id="teamLeader"
                                            name="teamLeader"
                                            placeholder={t.placeholders.teamLeader}
                                        />
                                    </div>
                                )}
                                {step === 6 && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="dob">{t.placeholders.dob}</Label>
                                        <Input
                                            id="dob"
                                            name="dob"
                                            type="date"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            className="bg-zinc-800 text-white border-zinc-700"
                                            required
                                        />
                                    </div>
                                )}
                                {step === 7 && (
                                    <div className="grid gap-2">
                                        {iconsLoading ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {Array(4).fill(0).map((_, index) => (
                                                    <Skeleton key={index} className="w-[100px] h-[100px] rounded-full" />
                                                ))}
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-[200px]">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {profileIcons.map((icon, index) => (
                                                        <div
                                                            key={index}
                                                            className={`rounded-full border p-2 cursor-pointer ${profileIcon === icon ? 'border-accent' : 'border-zinc-700'}`}
                                                            onClick={() => setProfileIcon(icon)}
                                                        >
                                                            <Image
                                                                src={icon}
                                                                alt={`Profile Icon ${index + 1}`}
                                                                width={100}
                                                                height={100}
                                                                className="w-full h-auto rounded-full"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}
                        {userError && <p className="text-red-500 mt-4">{userError}</p>}
                        {partnersError && <p className="text-red-500 mt-4">{partnersError}</p>}
                    </CardContent>
                    {!success && (
                        <CardFooter className="flex justify-between mt-6">
                            {step > 1 && (
                                <Button onClick={handleBack} variant="outline" className="bg-zinc-800 text-white border-zinc-700">
                                    {t.buttons.back}
                                </Button>
                            )}
                            {step < 7 ? (
                                <Button onClick={handleNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    {t.buttons.next}
                                </Button>
                            ) : (
                                <Button type="submit" onClick={handleSubmit} disabled={submitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    {submitting ? (
                                        <div className="flex items-center">
                                            <ReloadIcon className="animate-spin mr-2" />
                                            <span>{t.buttons.submitting}</span>
                                        </div>
                                    ) : (
                                        t.buttons.finalize
                                    )}
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </div>

                <div className="w-full md:w-1/2 bg-accent p-6 md:p-12 flex flex-col justify-between relative">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-accent-foreground">
                            {t.signinPage.cardTitle}
                        </h2>
                        <p className="text-lg md:text-xl mb-4 md:mb-6 text-accent-foreground/80">
                            {t.signinPage.cardDescription}
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-accent-foreground/20 rounded-bl-full"></div>
                </div>
            </Card>
        </div>
    );
};

export default GetStarted;