'use client'
import React, { useState, useCallback, ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { Settings, PanelLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/client/LanguageContext";
import { navItems } from "@/lib/navItems";
import Image from "next/image";
import { assets } from "@/constants/assets";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ButtonWithTooltipProps extends ButtonProps {
  children: ReactNode;
  tooltip: string | null;
}

const ButtonWithTooltip = ({ children, tooltip, ...props }: ButtonWithTooltipProps) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props}>{children}</Button>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent side="right" sideOffset={10}>
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    useTheme();
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNavigation = useCallback((path: string) => {
        router.push(path);
    }, [router]);

    const items = navItems(t);

    return (
        <aside
            className={`hidden md:flex relative left-0 top-0 h-screen bg-background transition-all duration-300 ease-in-out ${
                isExpanded ? 'w-64' : 'w-18'
            }`}
            style={{
                transitionProperty: 'width, transform',
                transitionTimingFunction: 'ease-in-out',
                transitionDuration: '300ms'
            }}
        >
            <div className="flex flex-col h-full w-full">
                <nav className="flex flex-col items-center w-full gap-4 px-4 py-4">
                    <Image
                        src={assets.logo}
                        alt="NextMind Logo"
                        width={45}
                        height={45}
                        className="logo-transition"
                        style={{
                            transition: 'transform 300ms ease-in-out',
                        }}
                    />
                    {items.map((item, index) => (
                        <ButtonWithTooltip
                            key={index}
                            size="icon"
                            variant="ghost"
                            className={`w-full justify-start px-2 py-2 rounded-full ${
                                pathname === item.href
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            } ${isExpanded ? 'flex' : 'flex items-center justify-center'}`}
                            onClick={() => handleNavigation(item.href)}
                            aria-label={item.tooltip}
                            tooltip={!isExpanded ? item.tooltip : null}
                        >
                            <item.icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
                            {isExpanded && <span>{item.tooltip}</span>}
                        </ButtonWithTooltip>
                    ))}
                </nav>
                <nav className="mt-auto flex flex-col gap-2 px-4 py-4">
                    <ButtonWithTooltip
                        variant="ghost"
                        className={`w-full justify-start px-2 py-2 rounded-full text-foreground hover:bg-accent hover:text-accent-foreground ${
                            isExpanded ? 'flex' : 'flex items-center justify-center'
                        }`}
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                        tooltip={!isExpanded ? (isExpanded ? "Collapse" : "Expand") : null}
                    >
                        <PanelLeft className={`h-5 w-5 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''} ${isExpanded ? 'mr-3' : ''}`} />
                        {isExpanded && <span>{isExpanded ? "Collapse" : "Expand"}</span>}
                    </ButtonWithTooltip>
                    <ButtonWithTooltip
                        variant="ghost"
                        className={`w-full justify-start px-2 py-2 rounded-full text-foreground hover:bg-accent hover:text-accent-foreground ${
                            isExpanded ? 'flex' : 'flex items-center justify-center'
                        }`}
                        aria-label={t.headers.settings}
                        tooltip={!isExpanded ? t.headers.settings : null}
                    >
                        <Settings className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
                        {isExpanded && <span>{t.headers.settings}</span>}
                    </ButtonWithTooltip>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;