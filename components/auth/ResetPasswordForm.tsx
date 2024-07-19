import { useState } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDestructive } from '@/components/ui/alert-custom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const ResetPasswordForm = ({ actionCode }: { actionCode: string }) => {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setErrorMessage('Parolele nu se potrivesc.');
            return;
        }

        try {
            await confirmPasswordReset(auth, actionCode, newPassword);
            setIsSuccess(true);
            router.push('/');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Resetare Parolă</CardTitle>
                <CardDescription>Introduceți noua parolă pentru a reseta parola contului dvs.</CardDescription>
            </CardHeader>
            <CardContent>
                {isSuccess ? (
                    <div>Parola a fost resetată cu succes.</div>
                ) : (
                    <form className="space-y-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="new-password">Parolă nouă</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Parolă nouă"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="confirm-password">Confirmă parola</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirmă parola"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {errorMessage && <AlertDestructive message={errorMessage} title="Eroare" />}
                    </form>
                )}
            </CardContent>
            {!isSuccess && (
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push('/')}>Anulează</Button>
                    <Button onClick={handleResetPassword}>Resetează parola</Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default ResetPasswordForm;
