import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { assets } from '@/constants/assets';
import { useTheme } from 'next-themes';

interface CallSummaryCardProps {
    loading: boolean;
    visible: boolean;
    call_summary: string;
    t: {
        call_page: {
            callSummary: string;
        };
    };
}

const CallSummaryCard = ({ loading, visible, call_summary, t }: CallSummaryCardProps) => {
    const { theme } = useTheme();

    return (
        <Card className="flex flex-col gap-3 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    {t.call_page.callSummary}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-start pt-4">
                <div className="flex items-start mr-4 w-6 h-6">
                    {loading ? (
                        <div className="animate-spin-slow">
                            <Image
                                src={assets.gemini}
                                alt="Gemini"
                                width={25}
                                height={25}
                            />
                        </div>
                    ) : (
                        <Image
                            src={assets.gemini}
                            alt="Gemini"
                            width={25}
                            height={25}
                            className={`${visible ? 'transition-all ease-in duration-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        />
                    )}
                </div>
                <div className="flex-1">
                    {loading ? (
                        <Skeleton className="h-24 w-full" />
                    ) : (
                        <div className={`${visible ? 'transition-all ease-in duration-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <ReactMarkdown className="prose dark:prose-invert">{call_summary}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CallSummaryCard;