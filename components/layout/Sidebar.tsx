// Sidebar.tsx
'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";
import ThemeLogo from "@/components/theme/ThemeLogo";
import { Settings, Home, ShoppingCart, Package, Users2, LineChart } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { navItems } from "@/lib/navItems";
import Link from "next/link";

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
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 py-4">
                <Link href="#" className="flex flex-col items-center gap-4 px-2 py-4">
                    <ThemeLogo width={20} height={20} />
                </Link>

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
