'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { formatDuration } from '@/lib/constants/media';
import type { MediaItem } from '@/lib/constants/media';

interface AudioPlayerProps {
    tracks: MediaItem[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentTrack = tracks[currentTrackIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;

        const bounds = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - bounds.left;
        const percentage = clickX / bounds.width;
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    };

    const playNext = () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(false);
    };

    const playPrevious = () => {
        const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
        setCurrentTrackIndex(prevIndex);
        setIsPlaying(false);
    };

    const handleEnded = () => {
        playNext();
    };

    if (tracks.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Chưa có audio nào</p>
            </div>
        );
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div>
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={currentTrack?.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            {/* Player UI */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                {/* Current Track Info */}
                <div className="mb-6">
                    <h3 className="text-xl font-playfair font-bold text-gray-900">{currentTrack?.title}</h3>
                    {currentTrack?.description && (
                        <p className="text-sm text-gray-600 mt-1">{currentTrack.description}</p>
                    )}
                </div>

                {/* Progress Bar */}
                <div
                    className="relative h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
                    onClick={handleProgressClick}
                >
                    <div
                        className="absolute h-full bg-gold-primary rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-sm text-gray-600 mb-6">
                    <span>{formatDuration(Math.floor(currentTime))}</span>
                    <span>{formatDuration(Math.floor(duration))}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Previous */}
                        <button
                            onClick={playPrevious}
                            disabled={tracks.length <= 1}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SkipBack className="h-5 w-5 text-gray-700" />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-4 bg-gold-primary hover:bg-gold-dark rounded-full transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 text-white" />
                            ) : (
                                <Play className="h-6 w-6 text-white fill-white" />
                            )}
                        </button>

                        {/* Next */}
                        <button
                            onClick={playNext}
                            disabled={tracks.length <= 1}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SkipForward className="h-5 w-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            {isMuted || volume === 0 ? (
                                <VolumeX className="h-5 w-5 text-gray-700" />
                            ) : (
                                <Volume2 className="h-5 w-5 text-gray-700" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24 accent-gold-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Playlist */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-4">Danh sách phát</h4>
                {tracks.map((track, index) => (
                    <button
                        key={track.id}
                        onClick={() => {
                            setCurrentTrackIndex(index);
                            setIsPlaying(false);
                        }}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${index === currentTrackIndex
                                ? 'bg-gold-primary/10 border border-gold-primary'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{track.title}</p>
                                {track.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{track.description}</p>
                                )}
                            </div>
                            {track.duration && (
                                <span className="text-sm text-gray-500 ml-4">{formatDuration(track.duration)}</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
