import React, { useState, useCallback, RefObject } from 'react';
import ReactPlayer from 'react-player';
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
    url: string;
    playerRef: RefObject<ReactPlayer>;
    onTimeUpdate: (time: number) => void;
}

const AudioPlayer = ({ url, playerRef, onTimeUpdate }: AudioPlayerProps) => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const handlePlayPause = useCallback(() => setPlaying(prev => !prev), []);

    const handleProgress = useCallback((state: { played: number, playedSeconds: number }) => {
        setProgress(state.played);
        onTimeUpdate(state.playedSeconds);
    }, [onTimeUpdate]);

    const handleDuration = useCallback((duration: number) => {
        setDuration(duration);
    }, []);

    const handleSeek = useCallback((newValue: number[]) => {
        if (playerRef.current) {
            playerRef.current.seekTo(newValue[0], 'fraction');
        }
    }, [playerRef]);

    const handleSkip = useCallback((direction: 'forward' | 'backward') => {
        if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            const newTime = direction === 'forward' ? currentTime + 10 : currentTime - 10;
            playerRef.current.seekTo(newTime, 'seconds');
        }
    }, [playerRef]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="flex flex-col space-y-2 w-full bg-primary p-4 rounded-lg">
            <ReactPlayer
                ref={playerRef}
                url={url}
                playing={playing}
                onProgress={handleProgress}
                onDuration={handleDuration}
                width="0"
                height="0"
            />
            <div className="relative w-full h-1 bg-primary-foreground/20 rounded-full">
                <Slider
                    value={[progress]}
                    max={1}
                    step={0.01}
                    onValueChange={handleSeek}
                    className="absolute top-0 left-0 w-full h-full"
                />
                <div
                    className="absolute top-0 left-0 h-full bg-primary-foreground rounded-full"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
            <div className="flex justify-between items-center text-primary-foreground">
                <span>{formatTime(progress * duration)}</span>
                <span>{formatTime(duration)}</span>
            </div>
            <div className="flex justify-center items-center mt-2 space-x-4">
                <button className="text-primary-foreground" onClick={() => handleSkip('backward')}>
                    <SkipBack size={24} />
                </button>
                <button
                    onClick={handlePlayPause}
                    className="bg-muted text-primary rounded-full p-3 flex items-center justify-center w-12 h-12"
                >
                    {playing ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button className="text-primary-foreground" onClick={() => handleSkip('forward')}>
                    <SkipForward size={24} />
                </button>
            </div>
        </div>
    );
};

export default React.memo(AudioPlayer);