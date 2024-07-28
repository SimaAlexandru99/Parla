'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Interface for a dialog entry
interface DialogEntry {
    id: string;
    message: string;
    response: string;
}

// Interface for the context type
interface DialogContextType {
    dialog: DialogEntry[];
    addMessage: (message: string, response: string) => string;
    updateMessage: (id: string, response: string) => void;
}

// Create context with default undefined value
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Custom hook to use the dialog context
export const useDialog = (): DialogContextType => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

// Props interface for the DialogProvider
interface DialogProviderProps {
    children: ReactNode;
}

// DialogProvider component to manage dialog state and context
export const DialogProvider = ({ children }: DialogProviderProps) => {
    const [dialog, setDialog] = useState<DialogEntry[]>([]);

    // Load dialog from localStorage when component mounts
    useEffect(() => {
        try {
            const storedDialog = localStorage.getItem('dialog');
            if (storedDialog) {
                setDialog(JSON.parse(storedDialog));
            }
        } catch (error) {
            console.error('Failed to retrieve dialog from localStorage', error);
        }
    }, []);

    // Save dialog to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('dialog', JSON.stringify(dialog));
        } catch (error) {
            console.error('Failed to store dialog in localStorage', error);
        }
    }, [dialog]);

    // Add a new message to the dialog
    const addMessage = (message: string, response: string) => {
        const id = `${Date.now()}`;
        setDialog(prev => [...prev, { id, message, response }]);
        return id;
    };

    // Update an existing message's response
    const updateMessage = (id: string, response: string) => {
        setDialog(prev =>
            prev.map(entry => (entry.id === id ? { ...entry, response } : entry))
        );
    };

    // Provide the dialog context to child components
    return (
        <DialogContext.Provider value={{ dialog, addMessage, updateMessage }}>
            {children}
        </DialogContext.Provider>
    );
};
