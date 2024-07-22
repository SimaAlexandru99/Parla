import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import UserProfile from '@/components/layout/user-profile';

interface UserDropdownMenuProps {
  firstName?: string;
  lastName?: string;
  email: string;
  avatarSrc?: string;
  onLogout: () => void;
  theme?: string;
  setTheme: (theme: string) => void;
}

const UserDropdownMenu = ({
  firstName,
  lastName,
  email,
  avatarSrc,
  onLogout,
  theme,
  setTheme
}: UserDropdownMenuProps) => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'User';

  const handleLogoutAndRedirect = useCallback(() => {
    onLogout();
    router.push('/');
  }, [onLogout, router]);

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    } else if (firstName) {
      return firstName[0];
    } else if (lastName) {
      return lastName[0];
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarSrc} alt={fullName} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
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
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground py-2"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
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
                  <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  aria-label="Toggle theme"
                >
                  <span
                    className="block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                  />
                </Switch>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogoutAndRedirect}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground py-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserProfile isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default UserDropdownMenu;