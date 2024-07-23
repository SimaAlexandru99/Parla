'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonIcon } from '@radix-ui/react-icons';
import { Menu } from "lucide-react";
import UserDropdownMenu from "@/components/user-dropdown";
import { useUser } from "@/contexts/UserContext";
import Loading from "@/components/loading";
import ThemeLogo from '@/components/theme-logo';
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes"; // Add this import
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Header = () => {
    const { uid, firstName, lastName, email, project, company, profileIcon, role, handleLogout, loading } = useUser();
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (!profileIcon) {
            setAvatarLoaded(true);
        }
    }, [profileIcon]);

    if (loading) {
        return <Loading />;
    }

    // Determine the navigation destination based on the user's role
    const getDestinationLink = () => {
        return '/next-mind/dashboard';
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[80px] lg:px-6">
            <Link href="/">
                <ThemeLogo width={40} height={40} />
            </Link>
            <div className="flex-grow flex justify-between items-center">
                <nav className="hidden md:flex gap-2">
                    <Link href="/discover">
                        <Button variant="ghost" className="w-full text-left">
                            {t.links.discover}
                        </Button>
                    </Link>
                    <Link href="/support">
                        <Button variant="ghost" className="w-full text-left">
                            {t.links.support}
                        </Button>
                    </Link>
                </nav>
                <div className="hidden md:flex gap-6 items-center">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder={t.headers.language} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ro">{t.headers.languageSelect.ro}</SelectItem>
                            <SelectItem value="en">{t.headers.languageSelect.en}</SelectItem>
                        </SelectContent>
                    </Select>
                    {uid ? (
                        <UserDropdownMenu
                            firstName={firstName}
                            lastName={lastName}
                            email={email}
                            avatarSrc={profileIcon}
                            onLogout={handleLogout}
                            theme={theme}
                            setTheme={setTheme}
                        />
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/login">
                                        <Avatar className="w-10 h-10">
                                            {!avatarLoaded && <Skeleton className="w-8 h-8 rounded-full" />}
                                            {!profileIcon && (
                                                <AvatarFallback>
                                                    <PersonIcon className="w-5 h-5 person-icon-light dark:person-icon-dark" />
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t.headers.login}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <Link href={uid ? getDestinationLink() : "/signup"}>
                        <Button className="flex h-10">
                            {uid ? t.headers.dashboard : t.headers.register}
                        </Button>
                    </Link>
                </div>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden ml-auto"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center mb-4">
                            <Link href="/">
                                <ThemeLogo width={60} height={60} />
                            </Link>
                        </div>
                        <SheetHeader>
                            <Link href={uid ? getDestinationLink() : "/signup"}>
                                <Button className="flex h-12 w-full">
                                    {uid ? t.headers.dashboard : t.headers.register}
                                </Button>
                            </Link>
                        </SheetHeader>
                        <nav className="flex-grow w-full">
                            <div className="flex flex-col gap-2 p-4">
                                <Link href="/discover">
                                    <Button variant="ghost" className="w-full text-left">
                                        {t.links.discover}
                                    </Button>
                                </Link>
                                <Link href="/support">
                                    <Button variant="ghost" className="w-full text-left">
                                        {t.links.support}
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <div className="flex flex-col mb-4 w-full">
                                {uid ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <Avatar className="w-12 h-12">
                                                {!avatarLoaded && <Skeleton className="w-12 h-12 rounded-full" />}
                                                {profileIcon && (
                                                    <AvatarImage
                                                        src={profileIcon}
                                                        alt="Avatar utilizator"
                                                        onLoad={() => setAvatarLoaded(true)}
                                                        style={{ display: avatarLoaded ? 'block' : 'none' }}
                                                    />
                                                )}
                                                {!profileIcon && !avatarLoaded && (
                                                    <AvatarFallback>
                                                        <PersonIcon className="w-6 h-6 person-icon-light dark:person-icon-dark" />
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="ml-4">
                                                <div className="text-lg font-medium">{firstName} {lastName}</div>
                                                <div className="text-sm text-muted-foreground">{project}</div>
                                            </div>
                                        </div>
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
                                ) : (
                                    <div className="flex items-center gap-4 w-full">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="/login">
                                                        <Avatar className="w-12 h-12">
                                                            {!avatarLoaded && <Skeleton className="w-12 h-12 rounded-full" />}
                                                            {!profileIcon && (
                                                                <AvatarFallback>
                                                                    <PersonIcon className="w-6 h-6 person-icon-light dark:person-icon-dark" />
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {t.headers.login}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Link href="/login">
                                            <Button className="flex h-12 w-full">
                                                {t.headers.login}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mt-4">
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t.headers.language} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ro">{t.headers.languageSelect.ro}</SelectItem>
                                            <SelectItem value="en">{t.headers.languageSelect.en}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </header>
    );
};

export default Header;
