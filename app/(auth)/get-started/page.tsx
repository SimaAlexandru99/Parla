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
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea component
import { useLanguage } from "@/contexts/LanguageContext";

const saveUserData = async (userId: string, data: any) => {
    try {
        await setDoc(doc(db, "users", userId), data, { merge: true });
    } catch (error) {
        throw new Error("Eroare la salvarea datelor utilizatorului");
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
                };

                await saveUserData(user.uid, userData);
                setSuccess(true);
            }
        } catch (error) {
            console.error("Eroare la trimiterea datelor:", error);
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
        <div className="w-full h-screen flex items-center justify-center">
            <Card className="mx-auto w-[450px] p-4">
                <CardHeader className='gap-4'>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMessage && (
                        <AlertDestructive message={errorMessage} title="Eroare" />
                    )}
                    {userLoading || partnersLoading ? (
                        <div className="flex items-center">
                            <ReloadIcon className="animate-spin mr-2" />
                            <p>{t.loading.loadingPage}</p>
                        </div>
                    ) : success ? (
                        <div className="grid gap-4">
                            <Button onClick={() => router.push('/')}>{t.buttons.goToHome}</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-4">
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
                                        className="date-input"
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
                                        <ScrollArea className="max-h-100">
                                            <div className="grid grid-cols-2 gap-2">
                                                {profileIcons.map((icon, index) => (
                                                    <div
                                                        key={index}
                                                        className={`rounded-full border p-2 cursor-pointer ${profileIcon === icon ? 'border-blue-500' : 'border-gray-300'}`}
                                                        onClick={() => setProfileIcon(icon)}
                                                    >
                                                        <Image
                                                            src={icon}
                                                            alt={`Profile Icon ${index + 1}`}
                                                            width={200}
                                                            height={200}
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
                    {userError && <p className="text-red-500">{userError}</p>}
                    {partnersError && <p className="text-red-500">{partnersError}</p>}
                </CardContent>
                {!success && (
                    <CardFooter className="flex justify-between">
                        {step > 1 && (
                            <Button onClick={handleBack} variant="outline">{t.buttons.back}</Button>
                        )}
                        {step < 7 ? (
                            <Button onClick={handleNext}>{t.buttons.next}</Button>
                        ) : (
                            <Button type="submit" onClick={handleSubmit} disabled={submitting}>
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
            </Card>
        </div>
    );
};

export default GetStarted;
