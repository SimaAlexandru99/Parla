'use client'
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
interface DialogEntry {
    id: string;
    message: string;
    response: string;
}

interface DialogContextType {
    dialog: DialogEntry[];
    addMessage: (message: string, response: string) => string;
    updateMessage: (id: string, response: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = (): DialogContextType => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

interface DialogProviderProps {
    children: ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
    const [dialog, setDialog] = useState<DialogEntry[]>([]);

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

    useEffect(() => {
        try {
            localStorage.setItem('dialog', JSON.stringify(dialog));
        } catch (error) {
            console.error('Failed to store dialog in localStorage', error);
        }
    }, [dialog]);

    const addMessage = (message: string, response: string) => {
        const id = `${Date.now()}`;
        setDialog(prev => [...prev, { id, message, response }]);
        return id;
    };

    const updateMessage = (id: string, response: string) => {
        setDialog(prev =>
            prev.map(entry => (entry.id === id ? { ...entry, response } : entry))
        );
    };

    return (
        <DialogContext.Provider value={{ dialog, addMessage, updateMessage }}>
            {children}
        </DialogContext.Provider>
    );
};
