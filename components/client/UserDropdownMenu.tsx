'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/client/UserContext';
import { useThemeToggle } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { User, Moon, Sun, LogOut, UserRound } from "lucide-react";
import UserProfileWrapper from '@/components/server/UserProfileWrapper';
import { useLanguage } from '@/contexts/client/LanguageContext';
import Loading from "@/components/Loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UserDropdownMenu = () => {
  const { firstName, lastName, email, profileIcon, handleLogout } = useUser();
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useThemeToggle();
  const { t } = useLanguage();

  useEffect(() => {
    if (!profileIcon) {
      setAvatarLoaded(true);
    }
  }, [profileIcon]);

  const isLoggedIn = !!email;

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    } else if (firstName) {
      return firstName[0];
    } else if (lastName) {
      return lastName[0];
    }
    return "";
  };

  const handleLogoutAndRedirect = useCallback(async () => {
    setIsLoggingOut(true);
    await handleLogout();
    window.location.href = '/';
  }, [handleLogout]);

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'User';

  if (isLoggingOut) {
    return <Loading />;
  }

  return (
    <>
      <DropdownMenu>
        {isLoggedIn ? (
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profileIcon ?? undefined}
                  alt={fullName}
                  onLoad={() => setAvatarLoaded(true)}
                  style={{ display: avatarLoaded ? 'block' : 'none' }}
                />
                {!avatarLoaded && (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        ) : (
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/login">
                  <Avatar className="cursor-pointer">
                    <AvatarFallback>
                      <UserRound className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent align="end">
                <p>{t.headers.login || 'Sign In'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {isLoggedIn && (
          <DropdownMenuContent className="w-60 p-2 mt-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="space-y-2">
              <DropdownMenuItem
                onClick={() => setProfileOpen(true)}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground py-2"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t.dropdown.profile}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground py-2"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {theme === 'light' ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    <span>{theme === 'light' ? t.headers.dark : t.headers.light}</span>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                    aria-label="Toggle theme"
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogoutAndRedirect}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground py-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.dropdown.logOut}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      <UserProfileWrapper isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default UserDropdownMenu;