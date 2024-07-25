// components/VerifyEmail.tsx
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeLogo from '@/components/theme/ThemeLogo';

const VerifyEmail = () => {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[450px] h-[400px] flex flex-col items-center justify-center">
                <CardHeader className="text-center items-center">
                    <Link href="/" className="mb-16">
                        <ThemeLogo width={60} height={60} />
                    </Link>
                    <CardTitle className="text-2xl ">Success!</CardTitle>
                    <CardDescription className="mt-4 text-md">
                        Ți-ai verificat cu succes contul de NextMind <br /> Du-te înapoi în aplicația NextMind.
                        <br />
                        <br />
                        Poți închide această pagină.
                    </CardDescription>

                </CardHeader>
                <CardContent className="mt-4"></CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;
