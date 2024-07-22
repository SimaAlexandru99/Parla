'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectComponentProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string }[];
    loading: boolean;
    id: string;
    name: string;
    placeholder: string;
}

export function SelectComponent({ value, onChange, options, loading, id, name, placeholder }: SelectComponentProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full" id={id} name={name}>
                <SelectValue placeholder={loading ? "Se încarcă..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {loading ? (
                        <SelectItem value="" disabled>
                            Se încarcă...
                        </SelectItem>
                    ) : (
                        options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.value}
                            </SelectItem>
                        ))
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
