import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface CallDetailsCardProps {
    callDetails: {
        first_name: string;
        last_name: string;
        project: string;
        day_processed?: Date | string;
        phone_number: string;
        duration: number;
        total_talk_duration: {
            SPEAKER_00: number;
            SPEAKER_01: number;
        };
        crosstalk_duration: number;
        total_dead_air_duration: {
            SPEAKER_00: number;
            SPEAKER_01: number;
        };
    };
    t: {
        call_page: {
            callDetailsHeader: string;
            agent: string;
            project: string;
            dayProcessed: string;
            phoneNumber: string;
            callDuration: string;
            agentTalkDuration: string;
            clientTalkDuration: string;
            crosstalk: string;
            totalDeadAir: string;
            agentDeadAir: string;
        };
    };
    formatTime: (seconds: number) => string;
}

const CallDetailsCard = ({ callDetails, t, formatTime }: CallDetailsCardProps) => {
    const { theme } = useTheme();
    const {
        first_name,
        last_name,
        project,
        day_processed,
        phone_number,
        duration,
        total_talk_duration,
        crosstalk_duration,
        total_dead_air_duration,
    } = callDetails;

    const detailItems = [
        { label: t.call_page.agent, value: `${first_name} ${last_name}` },
        { label: t.call_page.project, value: project },
        { label: t.call_page.dayProcessed, value: day_processed instanceof Date ? day_processed.toLocaleDateString() : day_processed || 'N/A' },
        { label: t.call_page.phoneNumber, value: phone_number },
        { label: t.call_page.callDuration, value: formatTime(duration) },
        { label: t.call_page.agentTalkDuration, value: formatTime(total_talk_duration.SPEAKER_00) },
        { label: t.call_page.clientTalkDuration, value: formatTime(total_talk_duration.SPEAKER_01) },
        { label: t.call_page.crosstalk, value: formatTime(crosstalk_duration) },
        { label: t.call_page.totalDeadAir, value: formatTime(total_dead_air_duration.SPEAKER_00 + total_dead_air_duration.SPEAKER_01) },
        { label: t.call_page.agentDeadAir, value: formatTime(total_dead_air_duration.SPEAKER_00) },
    ];

    return (
        <Card className="flex flex-col gap-3 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-secondary/10 pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    {t.call_page.callDetailsHeader}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {detailItems.map((item, index) => (
                    <div key={index} className="flex flex-col">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default CallDetailsCard;