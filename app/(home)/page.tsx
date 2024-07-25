'use client'

import React from 'react';
import Image from 'next/image';
import Loading from "@/components/Loading";
import useCheckFirstLogin from "@/hooks/useCheckFirstLogin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Home = () => {
  const { loading, error, checkingLogin } = useCheckFirstLogin();
  const { t, isLanguageLoaded } = useLanguage();

  if (!isLanguageLoaded || loading || checkingLogin) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="flex flex-col min-h-screen ">
      <div className="mx-auto px-4">
        <section className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-6xl font-bold text-primary">{t.homepage.title}</h1>
          <p className="text-xl text-primary">{t.homepage.subtitle}</p>
          <div className="flex w-full items-center justify-center space-x-4 py-4">
            <Link href="/login">
              <Button className="w-full md:w-auto">{t.homepage.start}</Button>
            </Link>
            <Link href="/">
              <Button className="w-full md:w-auto" variant="outline">{t.homepage.learnMore}</Button>
            </Link>
          </div>
        </section>
        <section className="py-16">
          <h2 className="text-4xl font-bold text-center mb-8">What&apos;s in Next.js?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Built-in Optimizations</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Improve the speed of your web apps with built-in optimizations.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Dynamic HTML Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Instantly stream HTML from the server for faster page loads.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">React Server Components</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Use React Server Components for enhanced rendering capabilities.</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8">Get started in seconds</h2>
            <p className="mb-8">Deploy Next.js to Vercel and jumpstart your development with pre-built solutions.</p>
            <Link href="https://vercel.com/new">
              <Button className="w-full md:w-auto">Deploy a Template on Vercel</Button>
            </Link>
          </div>
        </section>
        <section className="py-16">
          <h2 className="text-4xl font-bold text-center mb-8">The framework of choice when it matters</h2>
        </section>
        <footer className="bg-black text-gray-300 py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="hover:text-white">Docs</Link></li>
                <li><Link href="/learn" className="hover:text-white">Learn</Link></li>
                <li><Link href="/showcase" className="hover:text-white">Showcase</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/next-conf" className="hover:text-white">Next.js Conf</Link></li>
                <li><Link href="/previews" className="hover:text-white">Previews</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">More</h3>
              <ul className="space-y-2">
                <li><Link href="/commerce" className="hover:text-white">Next.js Commerce</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Sales</Link></li>
                <li><Link href="https://github.com/vercel" className="hover:text-white">GitHub</Link></li>
                <li><Link href="/releases" className="hover:text-white">Releases</Link></li>
                <li><Link href="/telemetry" className="hover:text-white">Telemetry</Link></li>
                <li><Link href="/governance" className="hover:text-white">Governance</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">About Vercel</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white">Next.js + Vercel</Link></li>
                <li><Link href="/open-source" className="hover:text-white">Open Source Software</Link></li>
                <li><Link href="https://github.com/vercel" className="hover:text-white">GitHub</Link></li>
                <li><Link href="https://twitter.com/vercel" className="hover:text-white">X</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-white mb-4">Subscribe to our newsletter</h3>
              <p className="mb-4">Stay updated on new releases and features, guides, and case studies.</p>
              <form className="flex flex-col gap-2">
                <Input type="email" placeholder="you@domain.com" className="bg-gray-800 border-gray-700 text-white" />
                <Button type="submit" className="bg-white text-black hover:bg-gray-200">Subscribe</Button>
              </form>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2024 Vercel, Inc.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">

            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Home;