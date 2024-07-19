import { Inter as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { assets } from '@/constants/assets'; // Adjust the import path as needed
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/HeaderDashboard";

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
              <div className="flex min-h-screen w-full">
                <Sidebar />
                <div className="flex flex-col flex-grow w-full">
                  <Header/>
                  <main className="flex-grow overflow-y-auto">
                    {children}
                  </main>
                  <footer className="py-4 md:py-6">
                    <div className="container md:h-24 max-w-none ">
                      <p className="text-sm leading-loose text-muted-foreground">
                        Built by{" "}
                        <Link
                          href="https://twitter.com/shadcn"
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline underline-offset-4"
                        >
                          NextJourney
                        </Link>
                        .
                      </p>
                    </div>
                  </footer>
                </div>
              </div>
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
