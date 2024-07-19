'use client'
import { ReloadIcon } from '@radix-ui/react-icons';
import { useLanguage } from "@/contexts/LanguageContext";

const Loading = () => {
    const { t, isLanguageLoaded } = useLanguage();

    if (!isLanguageLoaded) {
        return null; // or a fallback while language is loading
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <ReloadIcon className="h-10 w-10 animate-spin mx-auto mb-4" />
                <p>{t.loading.loadingPage}</p>
            </div>
        </div>
    );
};

export default Loading;
