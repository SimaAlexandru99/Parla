import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
}

const SuccessDialog = ({ isOpen, onClose, title, description }: SuccessDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onClose}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(SuccessDialog);
