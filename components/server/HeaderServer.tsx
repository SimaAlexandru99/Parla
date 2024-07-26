// components/server/HeaderServer.tsx
import { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HeaderServer({ children }: { children: ReactNode }) {
  return (
    <header className="bg-black text-white px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Image src="/parla-logo.png" alt="Parla" width={100} height={30} />
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="text-white">AI Labs</Button>
        <Button variant="ghost" className="text-white">License</Button>
        <Button variant="ghost" className="text-white">Pricing</Button>
        {children}
      </div>
    </header>
  );
}