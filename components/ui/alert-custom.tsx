'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, RocketIcon } from "@radix-ui/react-icons";

interface AlertProps {
  title: string;
  message: string;
}

export function AlertDestructive({ title, message }: AlertProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert variant="destructive" className="bg-white">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

export function AlertInformative({ title, message }: AlertProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert>
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}