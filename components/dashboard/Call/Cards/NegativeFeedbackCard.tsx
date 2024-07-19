import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NegativeFeedbackCardProps {
    handleFeedbackClick: (type: string, index: string) => void;
    handleButtonClick: (button: string) => void;
    handleFeedbackSubmit: () => void;
    setActiveFeedbackCard: React.Dispatch<React.SetStateAction<string | null>>;
    activeFeedbackCard: string | null;
    selectedButton: string;
    index: string;
    t: any; // Add this line to pass the translation object
}

const NegativeFeedbackCard = ({
    index,
    handleFeedbackClick,
    handleButtonClick,
    handleFeedbackSubmit,
    setActiveFeedbackCard,
    activeFeedbackCard,
    selectedButton,
    t, // Destructure the translation object here
}: NegativeFeedbackCardProps) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState<string>("");

    const isSubmitDisabled = !selectedOption || !inputValue.trim();

    const onValueChange = (value: string) => {
        setSelectedOption(value);
        handleButtonClick(value);
    };

    return (
        <Card className="mt-4 p-4  border rounded ">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">{t.feedback_headline}</h4>
                <Button variant="outline" size="icon" onClick={() => setActiveFeedbackCard(null)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="mt-4">
                <Select onValueChange={onValueChange}>
                    <SelectTrigger aria-label="Select feedback">
                        <SelectValue placeholder="Select feedback" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="offensive">{t.feedback_buttons.offensive}</SelectItem>
                        <SelectItem value="incorrect">{t.feedback_buttons.incorrect}</SelectItem>
                        <SelectItem value="other">{t.feedback_buttons.other}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="mt-4">
                <Input 
                    placeholder={t.placeholders.additionalFeedback} 
                    className="w-full" 
                    aria-label="Additional feedback" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            <p className="mt-2 text-xs text-gray-500">
                {t.feedback_note} <a href="#" className="text-blue-500">{t.learn_more}</a>
            </p>
            <div className="mt-4">
                <Button 
                    onClick={handleFeedbackSubmit} 
                    aria-label="Submit feedback" 
                    disabled={isSubmitDisabled}
                >
                    {t.buttons.submit}
                </Button>
            </div>
        </Card>
    );
};

export default NegativeFeedbackCard;
