// File: app/(crm)/layout.tsx
import { Work_Sans as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DialogProvider } from "@/contexts/DialogContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/sidebar/sidebar";
import Header from "@/components/layout/header/header";
import Chat from "@/components/layout/chat/chat";
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: {
    default: 'NextMind - AI powered journey planner for our clients',
    template: '%s | NextMind'
  },
  description: 'AI powered journey planner for our clients',
}


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function NextMindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-muted/40 font-sans antialiased",
        fontSans.variable
      )}>
        <LanguageProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <DialogProvider>
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header />
                    <main>
                      {children}
                    </main>
                  </div>
                </div>
                <Toaster />
                <Chat />
                <Analytics />
                <SpeedInsights />
              </DialogProvider>
            </ThemeProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
