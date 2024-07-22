import { Inter as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { assets } from '@/constants/assets';
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DialogProvider } from "@/contexts/DialogContext"; // Add this import
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "./next-mind/components/header"
import Chat from "@/components/layout/chat";

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
      <head>
        <title>NextMind - AI powered journey planner for our clients</title>
        <link rel="icon" href="favicon.ico" />
        <link rel="apple-touch-icon" href="favicon.ico" />
      </head>
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
              <DialogProvider> {/* Add DialogProvider here */}
                <div className="flex min-h-screen w-full flex-col bg-muted/40">
                  <Sidebar />
                  <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <Header />
                    <main className="flex-grow overflow-y-auto">
                      {children}
                    </main>
                  </div>
                </div>
                <Toaster />
                <Chat />
                <Analytics />
                <SpeedInsights />
              </DialogProvider> {/* Close DialogProvider here */}
            </ThemeProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}