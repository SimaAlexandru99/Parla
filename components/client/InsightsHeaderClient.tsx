'use client'

import React, { useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Globe } from "lucide-react";
import UserDropdownMenu from "@/components/UserDropdownMenu";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "next-themes";
import CardNotifications from "@/components/CardNotifications";
import { navItems as getNavItems } from "@/lib/navItems";
import { useLanguage } from "@/contexts/LanguageContext";
import { CommandDialogCustom } from "@/components/CommandDialog";

const HeaderClient = () => {
    const { company, profileIcon, firstName, lastName, project, email, handleLogout } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const navItems = useMemo(() => getNavItems(t), [t]);

    const currentNavItem = useMemo(
        () => navItems.find(item => item.href === pathname),
        [navItems, pathname]
    );

    const handleLinkClick = useCallback((href: string) => {
        router.push(href);
        setIsSheetOpen(false);
    }, [router]);

    return (
        <header className="sticky top-0 z-[998] bg-background flex w-full drop-shadow-1  dark:drop-shadow-none">
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
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[130px]" aria-label="Select language">
                            <Globe className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={t.headers.language} />
                        </SelectTrigger>
                        <SelectContent className="z-[999]"> 
                            <SelectItem value="ro">{t.headers.languageSelect.ro}</SelectItem>
                            <SelectItem value="en">{t.headers.languageSelect.en}</SelectItem>
                        </SelectContent>
                    </Select>
                    <CardNotifications />
                    <UserDropdownMenu
                        firstName={firstName}
                        lastName={lastName}
                        email={email}
                        avatarSrc={profileIcon}
                        onLogout={handleLogout}
                        theme={theme}
                        setTheme={setTheme}
                    />
                </div>
            </div>
        </header>
    );
};

export default HeaderClient;