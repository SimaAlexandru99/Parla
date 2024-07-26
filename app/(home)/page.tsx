'use client'
import React from 'react';

import Loading from "@/components/Loading";
import useCheckFirstLogin from "@/hooks/useCheckFirstLogin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/client/LanguageContext";

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
          <h1 className="text-6xl font-bold ">{t.homepage.title}</h1>
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
      </div>
    </main>
  );
};

export default Home;