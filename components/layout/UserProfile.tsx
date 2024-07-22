import React, { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useFetchProjects from "@/hooks/useFetchProjects"; // Update the import path as necessary
import useFetchDepartments from "@/hooks/useFetchDepartments"; // Update the import path as necessary
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Update the import path as necessary
import SuccessDialog from "@/components/layout/SuccessDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvatarSkeleton } from "@/components/common/cards"; 

interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserProfile = ({ isOpen, onClose }: UserProfileProps) => {
    const { uid, firstName, role, lastName, email, company, project, department, partner, profileIcon, loading } = useUser();
    const { t } = useLanguage();

    const [editFirstName, setEditFirstName] = useState(firstName);
    const [editLastName, setEditLastName] = useState(lastName);
    const [editEmail, setEditEmail] = useState(email);
    const [editProject, setEditProject] = useState(project);
    const [editDepartment, setEditDepartment] = useState(department);
    const [editCompany, setEditCompany] = useState(company);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const { projects, loadingProjects, error: projectsError } = useFetchProjects(partner, company);
    const { departments, loadingDepartments, error: departmentsError } = useFetchDepartments(partner, editProject, company);

    useEffect(() => {
        setEditProject(project);
    }, [project]);

    useEffect(() => {
        setEditDepartment(department);
    }, [department]);

    useEffect(() => {
        if (!isOpen) {
            // Reset states when the sheet is closed
            setEditFirstName(firstName);
            setEditLastName(lastName);
            setEditEmail(email);
            setEditProject(project);
            setEditDepartment(department);
            setEditCompany(company);
        }
    }, [isOpen, firstName, lastName, email, project, department, company]);

    const handleSaveChanges = useCallback(async () => {
        if (!uid) {
            console.error("User ID is null");
            return;
        }

        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, {
                firstName: editFirstName,
                lastName: editLastName,
                email: editEmail,
                project: editProject,
                department: editDepartment,
                company: editCompany,
            });
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Error updating user profile: ", error);
        }
    }, [uid, editFirstName, editLastName, editEmail, editProject, editDepartment, editCompany]);


    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="flex flex-col max-h-full">
                    <SheetHeader>
                        <SheetTitle>{t.userProfile.title}</SheetTitle>
                        <SheetDescription>
                            {t.userProfile.description}
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-grow">
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col items-center space-y-4">
                                {!avatarLoaded && profileIcon && <AvatarSkeleton />}
                                <Avatar
                                    className={`w-24 h-24 ${!avatarLoaded && profileIcon ? 'hidden' : ''}`}
                                    onLoad={() => setAvatarLoaded(true)}
                                >
                                    {profileIcon ? (
                                        <AvatarImage
                                            src={profileIcon}
                                            alt={t.userProfile.avatarFallback}
                                            onLoad={() => setAvatarLoaded(true)}
                                        />
                                    ) : (
                                        <AvatarFallback>
                                            <span className="text-xl">{firstName?.charAt(0)}{lastName?.charAt(0)}</span>
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="w-full">
                                    <Label htmlFor="edit-last-name">{t.labels.lastName}</Label>
                                    <Input
                                        id="edit-last-name"
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="edit-first-name">{t.labels.firstName}</Label>
                                    <Input
                                        id="edit-first-name"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="edit-email">{t.labels.email}</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="edit-project">{t.labels.project}</Label>
                                    <Select
                                        value={editProject}
                                        onValueChange={setEditProject}
                                        disabled={role === 'user' || loadingProjects}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.userProfile.placeholders.project} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingProjects ? (
                                                <SelectItem value="loading" disabled>{t.userProfile.loading.loadingProjects}</SelectItem>
                                            ) : (
                                                projects.map((proj) => (
                                                    <SelectItem key={proj.value} value={proj.value}>
                                                        {proj.value}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {projectsError && <div className="text-red-500 mt-2">{t.userProfile.errors.projectsError}</div>}
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="edit-department">{t.labels.department}</Label>
                                    <Select
                                        value={editDepartment}
                                        onValueChange={setEditDepartment}
                                        disabled={role === 'user' || loadingDepartments}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.userProfile.placeholders.department} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingDepartments ? (
                                                <SelectItem value="loading" disabled>{t.userProfile.loading.loadingDepartments}</SelectItem>
                                            ) : (
                                                departments.map((dept) => (
                                                    <SelectItem key={dept.value} value={dept.value}>
                                                        {dept.value}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {departmentsError && <div className="text-red-500 mt-2">{t.userProfile.errors.departmentsError}</div>}
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="edit-company">{t.labels.company}</Label>
                                    <Input
                                        id="edit-company"
                                        value={editCompany}
                                        disabled
                                        onChange={(e) => setEditCompany(e.target.value)}
                                        className="w-full mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button onClick={handleSaveChanges}>{t.buttons.saveChanges}</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <SuccessDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={t.dialog.title}
                description={t.dialog.description}
            />
        </>
    );
};

export default UserProfile;
