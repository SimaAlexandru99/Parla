'use client'

import React, { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import useFetchProjects from "@/hooks/useFetchProjects";
import useFetchDepartments from "@/hooks/useFetchDepartments";
import { useUser } from "@/contexts/client/UserContext";

interface UserProfileProps {
    initialData: ReturnType<typeof useUser>;
    isOpen: boolean;
    onClose: () => void;
}

// Helper function to ensure we always return a string
const ensureString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (value === null || value === undefined) return '';
    return String(value);
};

export default function UserProfileClient({ initialData, isOpen, onClose }: UserProfileProps) {
    const [editData, setEditData] = useState(initialData);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const { setUserContext } = useUser();

    const { projects, loadingProjects } = useFetchProjects(editData.partner || '', editData.company || '');
    const { departments, loadingDepartments } = useFetchDepartments(editData.partner || '', editData.project || '', editData.company || '');

    useEffect(() => {
        setEditData(initialData);
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            if (!editData.uid) throw new Error("User ID is null");
            
            const userDocRef = doc(db, "users", editData.uid);
            await updateDoc(userDocRef, {
                firstName: editData.firstName,
                lastName: editData.lastName,
                email: editData.email,
                project: editData.project,
                department: editData.department,
            });
            setUserContext(editData);
            onClose();
        } catch (error) {
            console.error("Error updating user profile: ", error);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex flex-col max-h-full">
                <SheetHeader>
                    <SheetTitle>User Profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-grow">
                    <div className="grid gap-4 py-4 mx-2">
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar
                                className={`w-24 h-24 ${!avatarLoaded && editData.profileIcon ? 'hidden' : ''}`}
                                onLoad={() => setAvatarLoaded(true)}
                            >
                                <AvatarImage
                                    src={editData.profileIcon || ''}
                                    alt="Profile"
                                    onLoad={() => setAvatarLoaded(true)}
                                />
                                <AvatarFallback>
                                    <span className="text-xl">{editData.firstName?.charAt(0)}{editData.lastName?.charAt(0)}</span>
                                </AvatarFallback>
                            </Avatar>
                            {/* Add input fields for firstName, lastName, email */}
                            {['firstName', 'lastName', 'email'].map((field) => (
                                <div key={field} className="w-full">
                                    <Label htmlFor={`edit-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                                    <Input
                                        id={`edit-${field}`}
                                        name={field}
                                        value={ensureString(editData[field as keyof typeof editData])}
                                        onChange={handleInputChange}
                                        className="w-full mt-1"
                                    />
                                </div>
                            ))}
                            {/* Add Select components for project and department */}
                            {['project', 'department'].map((field) => (
                                <div key={field} className="w-full">
                                    <Label htmlFor={`edit-${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                                    <Select
                                        value={ensureString(editData[field as keyof typeof editData])}
                                        onValueChange={handleSelectChange(field)}
                                        disabled={editData.role === 'user' || (field === 'project' ? loadingProjects : loadingDepartments)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Select ${field}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field === 'project'
                                                ? projects.map((proj) => (
                                                    <SelectItem key={proj.value} value={proj.value}>
                                                        {proj.value}
                                                    </SelectItem>
                                                ))
                                                : departments.map((dept) => (
                                                    <SelectItem key={dept.value} value={dept.value}>
                                                        {dept.value}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                            {/* Add disabled Input for company */}
                            <div className="w-full">
                                <Label htmlFor="edit-company">Company</Label>
                                <Input
                                    id="edit-company"
                                    name="company"
                                    value={ensureString(editData.company)}
                                    disabled
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button className="bg-accent hover:bg-accent/90 text-black font-medium" onClick={handleSaveChanges}>Save Changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}