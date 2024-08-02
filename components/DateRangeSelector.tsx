"use client"
import { useState, useEffect } from 'react';
import { enUS, ro } from 'date-fns/locale'; // Import the locales you need
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns";
import { useLanguage } from "@/contexts/client/LanguageContext"; // Assuming you have a language context

interface DateRangeSelectorProps {
    onApply: (period: string, startDate: Date | null, endDate: Date | null) => void;
}

const DateRangeSelector = ({ onApply }: DateRangeSelectorProps) => {
    const { t, language } = useLanguage(); // Use language context
    const periods = t.dateRangeSelector.periods;
    const [selectedPeriod, setSelectedPeriod] = useState(periods[1]); // Set default to 'Last 30 days'
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    // Determine the locale based on the current language
    const locale = language === 'ro' ? ro : enUS;

    useEffect(() => {
        onApply(selectedPeriod, startDate, endDate);
    }, [selectedPeriod, startDate, endDate, onApply]);

    useEffect(() => {
        // Update selectedPeriod when the language changes to keep it in sync
        if (periods.includes(selectedPeriod)) {
            setSelectedPeriod(periods[periods.indexOf(selectedPeriod)]);
        } else {
            setSelectedPeriod(periods[1]);
        }
    }, [periods, selectedPeriod]);

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        const now = new Date();
        if (period !== t.dateRangeSelector.periods[3]) { // 'Custom'
            switch (period) {
                case t.dateRangeSelector.periods[0]: // 'Last 7 days'
                    setStartDate(new Date(now.setDate(now.getDate() - 7)));
                    setEndDate(new Date());
                    break;
                case t.dateRangeSelector.periods[1]: // 'Last 30 days'
                    setStartDate(new Date(now.setDate(now.getDate() - 30)));
                    setEndDate(new Date());
                    break;
                case t.dateRangeSelector.periods[2]: // 'Last 90 days'
                    setStartDate(new Date(now.setDate(now.getDate() - 90)));
                    setEndDate(new Date());
                    break;
                default:
                    break;
            }
        }
    };

    const handleStartDateChange = (date: Date | undefined) => {
        setStartDate(date ?? null);
        setSelectedPeriod(t.dateRangeSelector.periods[3]); // 'Custom'
    };

    const handleEndDateChange = (date: Date | undefined) => {
        setEndDate(date ?? null);
        setSelectedPeriod(t.dateRangeSelector.periods[3]); // 'Custom'
    };

    return (
        <Card className="flex flex-col md:flex-row items-center p-4 rounded-md  space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex flex-col md:flex-row md:items-center w-full md:space-x-4">
                <div className="flex flex-col space-y-2 md:space-y-0 w-full">
                    <label className="block text-sm font-medium mb-1">{t.dateRangeSelector.selectPeriodLabel}</label>
                    <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder={t.dateRangeSelector.selectPeriodLabel} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {periods.map((period, index) => (
                                    <SelectItem key={index} value={period}>
                                        {period}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col space-y-2 md:space-y-0 w-full">
                    <label className="block text-sm font-medium mb-1">{t.dateRangeSelector.startDateLabel}</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-12 pl-3 text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                {startDate ? (
                                    format(startDate, "PPP", { locale })
                                ) : (
                                    <span>{t.dateRangeSelector.pickDate}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate ?? undefined}
                                onSelect={handleStartDateChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={locale}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-col space-y-2 md:space-y-0 w-full">
                    <label className="block text-sm font-medium mb-1">{t.dateRangeSelector.endDateLabel}</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-12 pl-3 text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                )}
                            >
                                {endDate ? (
                                    format(endDate, "PPP", { locale })
                                ) : (
                                    <span>{t.dateRangeSelector.pickDate}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate ?? undefined}
                                onSelect={handleEndDateChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={locale}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </Card>
    );
};

export default DateRangeSelector;
