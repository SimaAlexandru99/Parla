'use client'
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Globe } from "lucide-react";
import UserDropdownMenu from "@/components/client/UserDropdownMenu";
import { useUser } from "@/contexts/client/UserContext";
import CardNotifications from "@/components/CardNotifications";
import { navItems as getNavItems } from "@/lib/navItems";
import { useLanguage } from "@/contexts/client/LanguageContext";
import { CommandDialogCustom } from "@/components/CommandDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsHeaderClient() {
    const router = useRouter();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { loading } = useUser();
    const [isClientLoaded, setIsClientLoaded] = useState(false);

    const navItems = useMemo(() => getNavItems(t), [t]);

    const handleLinkClick = useCallback((href: string) => {
        router.push(href);
        setIsSheetOpen(false);
    }, [router]);

    useEffect(() => {
        const timer = setTimeout(() => setIsClientLoaded(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading || !isClientLoaded) {
        return (
            <header className="sticky top-0 bg-background flex w-full drop-shadow-1 dark:drop-shadow-none">
                <div className="flex items-center gap-4 w-full justify-between p-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-40 h-10 rounded-md" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-32 h-10 rounded-md" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 bg-background flex w-full drop-shadow-1 dark:drop-shadow-none">
            <div className="flex items-center gap-4 w-full justify-between p-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64">
                            <nav className="grid gap-4 py-4">
                                {navItems.map((item, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        className="justify-start"
                                        onClick={() => handleLinkClick(item.href)}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.text}
                                    </Button>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <CommandDialogCustom />
                </div>
                <div className="flex items-center gap-4">
                    <CardNotifications />
                    <UserDropdownMenu />
                </div>
            </div>
        </header>
    );
}