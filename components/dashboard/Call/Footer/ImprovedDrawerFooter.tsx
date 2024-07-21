import React, { useState, useEffect, useRef } from 'react';
import { DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import ReactPlayer from 'react-player';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
    import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

    interface AudioPlayerProps {
        url: string;
        playerRef: React.RefObject<ReactPlayer>;
    }

    const AudioPlayer = ({ url, playerRef }: AudioPlayerProps) => {
        const [playing, setPlaying] = useState(false);
        const [progress, setProgress] = useState(0);
        const [duration, setDuration] = useState(0);

        const handlePlayPause = () => setPlaying(!playing);
        const handleProgress = (state: { played: number }) => setProgress(state.played);
        const handleDuration = (duration: number) => setDuration(duration);
        const handleSeek = (newValue: number[]) => {
            if (playerRef.current) {
                playerRef.current.seekTo(newValue[0], 'fraction');
            }
        };

        const handleSkip = (direction: 'forward' | 'backward') => {
            if (playerRef.current) {
                const currentTime = playerRef.current.getCurrentTime();
                const newTime = direction === 'forward' ? currentTime + 10 : currentTime - 10;
                playerRef.current.seekTo(newTime, 'seconds');
            }
        };

        const formatTime = (time: number) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

    return (
        <div className="w-full space-y-2">
            <ReactPlayer
                ref={playerRef}
                url={url}
                playing={playing}
                onProgress={handleProgress}
                onDuration={handleDuration}
                width="0"
                height="0"
            />
            <div className="flex justify-center items-center space-x-4">
                <Button variant="ghost" size="icon" className='rounded-full' onClick={() => handleSkip('backward')}>
                    <SkipBack className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className='rounded-full' onClick={handlePlayPause}>
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className='rounded-full' onClick={() => handleSkip('forward')}>
                    <SkipForward className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm">{formatTime(progress * duration)}</span>
                <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={1}
                    step={0.01}
                    className="flex-grow"
                />
                <span className="text-sm">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

interface ImprovedDrawerFooterProps {
    file_path: string;
    playerRef: React.RefObject<ReactPlayer>;
    t: {
        call_page: {
            close: string;
        };
    };
}

const ImprovedDrawerFooter = ({ file_path, playerRef, t }: ImprovedDrawerFooterProps) => {
    return (
        <DrawerFooter className="space-y-4 border-t pt-4">
            <AudioPlayer url={file_path} playerRef={playerRef} />
            <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                    {t.call_page.close}
                </Button>
            </DrawerClose>
        </DrawerFooter>
    );
};

export default ImprovedDrawerFooter;