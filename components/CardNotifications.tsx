import { useState, useEffect } from "react";
import { Plus, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BellIcon, CheckIcon } from "@radix-ui/react-icons";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const notifications = [
    {
        title: "Your call has been confirmed.",
        description: "1 hour ago",
        link: "/call-confirmed"
    },
    {
        title: "You have a new message!",
        description: "1 hour ago",
        link: "/new-message"
    },
    {
        title: "Your subscription is expiring soon!",
        description: "2 hours ago",
        link: "/subscription-expiring"
    },
];

export default function CardNotifications() {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        if (Notification.permission === 'granted') {
            setIsPushEnabled(true);
        }
    }, []);

    const handlePopoverOpenChange = (open: boolean) => {
        setIsPopoverOpen(open);
    };

    const handlePushToggle = async () => {
        if (isPushEnabled) {
            setIsPushEnabled(false);
            alert('To fully disable notifications, please reset the notification permissions in your browser settings.');
        } else {
            if (Notification.permission === 'default') {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        setIsPushEnabled(true);
                    }
                } catch (error) {
                    console.error('Notification permission request failed', error);
                }
            } else if (Notification.permission === 'granted') {
                setIsPushEnabled(true);
            }
        }
    };

    return (
        <div className="z-50">
            <Popover onOpenChange={handlePopoverOpenChange} open={isPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="transition-colors rounded-full">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="grid gap-4 w-[380px] p-6 z-[999]">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">Notifications</h4>
                        <Button variant="ghost" size="icon" onClick={() => setIsPopoverOpen(false)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                    <p className="text-sm">You have {notifications.length} unread messages.</p>
                    {!isPushEnabled && (
                        <div className="flex items-center space-x-4 rounded-md border p-4">
                            <BellIcon />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Push Notifications</p>
                                <p className="text-sm text-muted-foreground">Send notifications to device.</p>
                            </div>
                            <Switch checked={isPushEnabled} onCheckedChange={handlePushToggle} />
                        </div>
                    )}

                    <div>
                        {notifications.map((notification, index) => (
                            <Button
                                key={index}
                                variant="ghost"
                                onClick={() => window.location.href = notification.link}
                                className={`mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 text-left  p-2 rounded-md transition-colors duration-200 w-full h-30`}
                            >
                                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                    <Button className="w-full" onClick={() => setIsPopoverOpen(false)}>
                        <CheckIcon className="mr-2 h-4 w-4" /> Mark all as read
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
