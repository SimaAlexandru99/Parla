'use client'

import React from "react";
import { useUser } from "@/contexts/client/UserContext";
import UserProfileClient from "@/components/client/UserProfileClient";

interface UserProfileWrapperProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserProfileWrapper({ isOpen, onClose }: UserProfileWrapperProps) {
    const userData = useUser();

    if (userData.loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserProfileClient 
            initialData={userData} 
            isOpen={isOpen} 
            onClose={onClose}
        />
    );
}