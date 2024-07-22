// Sidebar.tsx
'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { navItems } from "@/lib/navItems";

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { theme } = useTheme();
    const { t } = useLanguage();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const items = navItems(t);

    return (
        <aside className="absolute left-0 top-0 z-[9999] flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 -translate-x-full">
            <nav className="flex flex-col items-center gap-4 px-2 py-4">
                {items.map((item, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95 rounded-full ${pathname === item.href
                                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                        : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))]'
                                        }`}
                                    onClick={() => handleNavigation(item.href)}
                                    aria-label={item.tooltip}
                                >
                                    <item.icon className="h-5 w-5 transition-transform duration-200" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="text-[hsl(var(--foreground))]">{item.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95 rounded-full text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))]"
                                aria-label={t.headers.settings}
                            >
                                <Settings className="h-5 w-5 transition-transform duration-200" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p className="text-[hsl(var(--foreground))]">{t.headers.settings}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    );
};

export default React.memo(Sidebar);
