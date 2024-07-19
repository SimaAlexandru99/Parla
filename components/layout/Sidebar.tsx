'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";
import ThemeLogo from "@/components/theme/ThemeLogo";
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
        <aside className="hidden md:flex h-screen flex-col items-center inset-y-0 left-0 z-10 w-20 bg-background">
            <div className="mt-10 mb-8">
                <ThemeLogo width={25} height={25} />
            </div>
            <nav className="flex flex-col items-center gap-6 px-2 py-8 flex-grow">
                {items.map((item, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={(() => {
                                        const isActive = pathname === item.href;
                                        return `transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95 rounded-full ${isActive
                                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                                : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))]'
                                            }`;
                                    })()}
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