import { Space_Grotesk as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { UserProvider } from "@/contexts/client/UserContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/contexts/client/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Parla - AI CRM Solution',
    template: '%s | Parla'
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-favicon.png',
  },
  description: 'AI powered journey planner for our clients',
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function HomeLayout({
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
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
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
