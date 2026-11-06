'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Volume2, VolumeX, Fullscreen, Clock, Gauge, PictureInPicture } from 'lucide-react'

const VideoModal = ({ isOpen, setIsOpen, videoUrl }) => {
    const videoRef = useRef(null)
    const containerRef = useRef(null)
    const controlsTimeout = useRef(null)
    const [videoState, setVideoState] = useState({
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        playbackRate: 1,
        isFullscreen: false,
        isControlsVisible: true,
        isBuffering: false,
        isPiP: false,
        brightness: 100,
        contrast: 100
    })

    // Unified state updater
    const updateVideoState = (newState) => {
        setVideoState(prev => ({ ...prev, ...newState }))
    }

    // Video control functions
    const togglePlay = () => {
        videoRef.current[videoState.isPlaying ? 'pause' : 'play']()
        updateVideoState({ isPlaying: !videoState.isPlaying })
    }

    const handleTimeUpdate = () => {
        updateVideoState({
            currentTime: videoRef.current.currentTime,
            duration: videoRef.current.duration
        })
    }

    const handleProgressClick = (e) => {
        const rect = e.target.getBoundingClientRect()
        const pos = (e.clientX - rect.left) / rect.width
        videoRef.current.currentTime = pos * videoState.duration
    }

    const handleVolumeChange = (value) => {
        const volume = parseFloat(value)
        videoRef.current.volume = volume
        videoRef.current.muted = volume === 0
        updateVideoState({ volume, isMuted: volume === 0 })
    }

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
                updateVideoState({ isPiP: false })
            } else {
                await videoRef.current.requestPictureInPicture()
                updateVideoState({ isPiP: true })
            }
        } catch (error) {
            console.error('PiP error:', error)
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen()
                .then(() => updateVideoState({ isFullscreen: true }))
                .catch(err => console.error('Fullscreen error:', err))
        } else {
            document.exitFullscreen()
                .then(() => updateVideoState({ isFullscreen: false }))
                .catch(err => console.error('Fullscreen error:', err))
        }
    }

    // Advanced visual controls
    const handleVisualControl = (type, value) => {
        videoRef.current.style.filter = `
            brightness(${type === 'brightness' ? value : videoState.brightness}%)
            contrast(${type === 'contrast' ? value : videoState.contrast}%)
        `
        updateVideoState({ [type]: value })
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            const { key, ctrlKey, shiftKey } = e
            const seekTime = shiftKey ? 10 : 5

            switch (key.toLowerCase()) {
                case ' ':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'arrowright':
                    videoRef.current.currentTime += seekTime
                    break
                case 'arrowleft':
                    videoRef.current.currentTime -= seekTime
                    break
                case 'arrowup':
                    handleVolumeChange(Math.min(videoState.volume + 0.1, 1))
                    break
                case 'arrowdown':
                    handleVolumeChange(Math.max(videoState.volume - 0.1, 0))
                    break
                case 'f':
                    toggleFullscreen()
                    break
                case 'i':
                    togglePiP()
                    break
                case 'm':
                    handleVolumeChange(videoState.isMuted ? 0.5 : 0)
                    break
                case 'escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen()
                    }
                    break
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [videoState])

    // Time formatting
    const formatTime = (time) => {
        const hours = Math.floor(time / 3600)
        const minutes = Math.floor((time % 3600) / 60)
        const seconds = Math.floor(time % 60)
        return `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // Controls visibility timeout
    const resetControlsTimeout = () => {
        clearTimeout(controlsTimeout.current)
        controlsTimeout.current = setTimeout(() => {
            updateVideoState({ isControlsVisible: false })
        }, 3000)
    }

    // Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            updateVideoState({ isFullscreen: !!document.fullscreenElement })
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    dir='ltr'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
                    ref={containerRef}
                    onMouseMove={() => {
                        updateVideoState({ isControlsVisible: true })
                        resetControlsTimeout()
                    }}
                    onMouseLeave={() => updateVideoState({ isControlsVisible: false })}
                    onDoubleClick={toggleFullscreen}
                >
                    <div className="relative w-full max-w-6xl aspect-video group">
                        {/* Video element */}
                        <video
                            ref={videoRef}
                            autoPlay
                            controls={false}
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => updateVideoState({ isPlaying: true })}
                            onPause={() => updateVideoState({ isPlaying: false })}
                            onWaiting={() => updateVideoState({ isBuffering: true })}
                            onCanPlay={() => updateVideoState({ isBuffering: false })}
                            className="w-full h-full rounded-xl shadow-2xl"
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>

                        {/* Loading spinner */}
                        <AnimatePresence>
                            {videoState.isBuffering && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                                >
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Custom controls */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: videoState.isControlsVisible ? 1 : 0 }}
                            className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                        >
                            {/* Top controls */}
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>

                                    <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full">
                                        <Gauge className="w-5 h-5 text-white" />
                                        <select
                                            value={videoState.playbackRate}
                                            onChange={(e) => {
                                                videoRef.current.playbackRate = e.target.value
                                                updateVideoState({ playbackRate: e.target.value })
                                            }}
                                            className="bg-transparent text-white outline-none"
                                        >
                                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                                <option key={speed} value={speed}>
                                                    {speed}x
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
                                        <input
                                            type="range"
                                            min="50"
                                            max="150"
                                            value={videoState.brightness}
                                            onChange={(e) => handleVisualControl('brightness', e.target.value)}
                                            className="w-24 accent-emerald-500"
                                        />
                                        <span className="text-white text-sm">Brightness</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
                                        <input
                                            type="range"
                                            min="50"
                                            max="150"
                                            value={videoState.contrast}
                                            onChange={(e) => handleVisualControl('contrast', e.target.value)}
                                            className="w-24 accent-emerald-500"
                                        />
                                        <span className="text-white text-sm">Contrast</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom controls */}
                            <div className="space-y-4">
                                {/* Progress bar */}
                                <div
                                    className="h-2 bg-white/20 rounded-full cursor-pointer group/progress"
                                    onClick={handleProgressClick}
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative"
                                        style={{ width: `${(videoState.currentTime / videoState.duration) * 100}%` }}
                                    >
                                        <motion.div
                                            className="w-3 h-3 bg-emerald-500 rounded-full absolute -right-1.5 -top-0.5 shadow-lg"
                                            whileHover={{ scale: 1.5 }}
                                        />
                                        <div className="absolute right-0 bottom-full mb-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                                            {formatTime(videoState.currentTime)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {/* Left controls */}
                                    <div className="flex items-center gap-4">
                                        <motion.button
                                            onClick={togglePlay}
                                            className="p-2 hover:bg-white/10 rounded-full"
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {videoState.isPlaying ? (
                                                <Pause className="w-7 h-7 text-white fill-white" />
                                            ) : (
                                                <Play className="w-7 h-7 text-white fill-white" />
                                            )}
                                        </motion.button>

                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                onClick={() => handleVolumeChange(videoState.isMuted ? 0.5 : 0)}
                                                className="p-1.5 hover:bg-white/10 rounded-full"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                {videoState.isMuted ? (
                                                    <VolumeX className="w-5 h-5 text-white" />
                                                ) : (
                                                    <Volume2 className="w-5 h-5 text-white" />
                                                )}
                                            </motion.button>

                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: videoState.isMuted ? 0 : 100 }}
                                                className="overflow-hidden"
                                            >
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={videoState.volume}
                                                    onChange={(e) => handleVolumeChange(e.target.value)}
                                                    className="w-24 h-1 accent-emerald-500"
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="flex items-center gap-2 text-white text-sm">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right controls */}
                                    <div className="flex items-center gap-4">
                                        <motion.button
                                            onClick={togglePiP}
                                            className="p-1.5 hover:bg-white/10 rounded-full"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <PictureInPicture className="w-5 h-5 text-white" />
                                        </motion.button>

                                        <motion.button
                                            onClick={toggleFullscreen}
                                            className="p-1.5 hover:bg-white/10 rounded-full"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Fullscreen className="w-5 h-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default VideoModal