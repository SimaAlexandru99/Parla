import { Space_Grotesk as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { UserProvider } from "@/contexts/client/UserContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/contexts/client/LanguageContext";
import Header from "@/components/Header";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';


export const metadata: Metadata = {
  title: 'Parla - AI CRM Solution',
  description: 'Parla is an AI CRM solution that helps you manage your customer relationships with ease.',
  keywords: ['CRM', 'AI', 'customer relationship management', 'Parla'],
  icons: {
    icon: '/favicon.jpg',
    apple: '/apple-favicon.jpg',
  },
  openGraph: {
    title: 'Parla - AI CRM Solution',
    description: 'Manage your customer relationships with ease using Parla AI CRM.',
    url: 'https://www.parla-ai.com',
    siteName: 'Parla AI CRM',
    images: [
      {
        url: 'https://www.parla-ai.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parla - AI CRM Solution',
    description: 'Manage your customer relationships with ease using Parla AI CRM.',
    images: ['https://www.parla-ai.com/twitter-image.jpg'],
  },
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-muted/40 font-sans antialiased flex flex-col",
        fontSans.variable
      )}>
        <LanguageProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
            >
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
