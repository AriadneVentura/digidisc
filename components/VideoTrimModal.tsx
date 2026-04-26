"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VideoTrimModalProps {
    file: File;
    onClose: () => void;
    onTrimComplete: ( trimmedFile: File ) => void;
}

const VideoTrimModal = ( { file, onClose, onTrimComplete }: VideoTrimModalProps ) => {
    const videoRef = useRef<HTMLVideoElement>( null );
    const timelineRef = useRef<HTMLDivElement>( null );
    const animFrameRef = useRef<number>( 0 );

    const [ duration, setDuration ] = useState( 0 );
    const [ currentTime, setCurrentTime ] = useState( 0 );
    const [ trimStart, setTrimStart ] = useState( 0 );
    const [ trimEnd, setTrimEnd ] = useState( 0 );
    const [ isPlaying, setIsPlaying ] = useState( false );
    const [ dragging, setDragging ] = useState<"start" | "end" | "playhead" | null>( null );
    const [ ffmpegLoaded, setFfmpegLoaded ] = useState( false );
    const [ isProcessing, setIsProcessing ] = useState( false );
    const [ progress, setProgress ] = useState( 0 );
    const [ previewUrl, setPreviewUrl ] = useState<string>( "" );
    const [ loadError, setLoadError ] = useState( "" );

    // Dynamically import ffmpeg to avoid SSR issues
    const ffmpegRef = useRef<any>( null );

    useEffect( () => {
        const url = URL.createObjectURL( file );
        setPreviewUrl( url );
        return () => URL.revokeObjectURL( url );
    }, [ file ] );

    useEffect( () => {
        const loadFFmpeg = async () => {
            try {
                const { FFmpeg } = await import("@ffmpeg/ffmpeg");
                const { toBlobURL } = await import("@ffmpeg/util");

                const ffmpeg = new FFmpeg();
                ffmpeg.on( "progress", ( { progress }: { progress: number } ) => {
                    setProgress( Math.round( progress * 100 ) );
                } );

                const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                await ffmpeg.load( {
                    coreURL: await toBlobURL( `${ baseURL }/ffmpeg-core.js`, "text/javascript" ),
                    wasmURL: await toBlobURL( `${ baseURL }/ffmpeg-core.wasm`, "application/wasm" ),
                } );

                ffmpegRef.current = ffmpeg;
                setFfmpegLoaded( true );
            } catch ( err ) {
                setLoadError( "Error encountered, please refresh :(" );
                console.error( err );
            }
        };

        loadFFmpeg();
    }, [] );

    const handleVideoLoaded = () => {
        const video = videoRef.current;
        if ( !video ) return;
        setDuration( video.duration );
        setTrimEnd( video.duration );
    };

    // Playback loop, clamp to trim region.
    useEffect( () => {
        const video = videoRef.current;
        if ( !video ) return;

        const tick = () => {
            if ( video.currentTime >= trimEnd ) {
                video.pause();
                video.currentTime = trimStart;
                setIsPlaying( false );
                setCurrentTime( trimStart );
                return;
            }
            setCurrentTime( video.currentTime );
            animFrameRef.current = requestAnimationFrame( tick );
        };

        if ( isPlaying ) {
            if ( video.currentTime < trimStart || video.currentTime >= trimEnd ) {
                video.currentTime = trimStart;
            }
            video.play();
            animFrameRef.current = requestAnimationFrame( tick );
        } else {
            video.pause();
            cancelAnimationFrame( animFrameRef.current );
        }

        return () => cancelAnimationFrame( animFrameRef.current );
    }, [ isPlaying, trimStart, trimEnd ] );

    const toPercent = ( val: number ) => (duration ? (val / duration) * 100 : 0);
    const fromPercent = ( pct: number ) => (pct / 100) * duration;

    const getTimelineX = useCallback( ( clientX: number ): number => {
        const el = timelineRef.current;
        if ( !el ) return 0;
        const rect = el.getBoundingClientRect();
        return Math.max( 0, Math.min( 1, (clientX - rect.left) / rect.width ) ) * 100;
    }, [] );

    const handleMouseDown = ( type: "start" | "end" | "playhead" ) => ( e: React.MouseEvent ) => {
        e.preventDefault();
        setDragging( type );
    };

    useEffect( () => {
        const onMove = ( e: MouseEvent ) => {
            if ( !dragging ) return;
            const pct = getTimelineX( e.clientX );
            const time = fromPercent( pct );

            if ( dragging === "start" ) {
                const clamped = Math.max( 0, Math.min( time, trimEnd - 0.5 ) );
                setTrimStart( clamped );
                if ( videoRef.current ) videoRef.current.currentTime = clamped;
                setCurrentTime( clamped );
            } else if ( dragging === "end" ) {
                const clamped = Math.min( duration, Math.max( time, trimStart + 0.5 ) );
                setTrimEnd( clamped );
            } else if ( dragging === "playhead" ) {
                const clamped = Math.max( trimStart, Math.min( time, trimEnd ) );
                if ( videoRef.current ) videoRef.current.currentTime = clamped;
                setCurrentTime( clamped );
            }
        };

        const onUp = () => setDragging( null );

        window.addEventListener( "mousemove", onMove );
        window.addEventListener( "mouseup", onUp );
        return () => {
            window.removeEventListener( "mousemove", onMove );
            window.removeEventListener( "mouseup", onUp );
        };
    }, [ dragging, trimStart, trimEnd, duration, getTimelineX ] );

    const formatTime = ( s: number ) => {
        const m = Math.floor( s / 60 ).toString().padStart( 2, "0" );
        const sec = (s % 60).toFixed( 1 ).padStart( 4, "0" );
        return `${ m }:${ sec }`;
    };

    const handleTrim = async () => {
        if ( !ffmpegRef.current || !ffmpegLoaded ) return;
        setIsProcessing( true );
        setProgress( 0 );

        try {
            const { fetchFile } = await import("@ffmpeg/util");
            const ffmpeg = ffmpegRef.current;

            const inputName = "input.mp4";
            const outputName = "output.mp4";

            await ffmpeg.writeFile( inputName, await fetchFile( file ) );

            const startStr = trimStart.toFixed( 3 );
            const durationStr = (trimEnd - trimStart).toFixed( 3 );

            // Note: This directly copies, so size wont change, but if people have their clip presets set then
            // should be okay.
            await ffmpeg.exec( [
                "-ss", startStr,
                "-i", inputName,
                "-t", durationStr,
                "-c", "copy",
                "-avoid_negative_ts", "make_zero",
                outputName,
            ] );

            const data = await ffmpeg.readFile( outputName );
            const blob = new Blob( [ data ], { type: "video/mp4" } );
            const trimmedFile = new File(
                [ blob ],
                file.name.replace( /(\.[^.]+)$/, "_trimmed$1" ),
                { type: "video/mp4" }
            );

            onTrimComplete( trimmedFile );
            onClose();
        } catch ( err ) {
            console.error( "Trim failed:", err );
            setLoadError( "Trimming failed." );
        } finally {
            setIsProcessing( false );
        }
    };

    const trimDuration = trimEnd - trimStart;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-3xl bg-white dark:bg-gray-350 text-dark-100 border border-gray-20 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                {/* Header */ }
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-dark-100 dark:text-white font-semibold text-lg tracking-tight">Snip
                            Snip</h2>
                        <p className="dark:text-white/60 text-xs mt-0.5 truncate max-w-xs">{ file.name }</p>
                    </div>
                    <button
                        onClick={ onClose }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/50 transition-colors text-dark/60 hover:text-dark dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Video Preview */ }
                <div className="relative bg-black aspect-video flex items-center justify-center">
                    { previewUrl && (
                        <video
                            ref={ videoRef }
                            src={ previewUrl }
                            className="w-full h-full object-contain"
                            onLoadedMetadata={ handleVideoLoaded }
                            onPlay={ () => setIsPlaying( true ) }
                            onPause={ () => setIsPlaying( false ) }
                        />
                    ) }

                    {/* FFmpeg loading overlay */ }
                    { !ffmpegLoaded && !loadError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
                            <p className="text-white/60 text-sm">Loading…</p>
                        </div>
                    ) }

                    {/* Processing overlay */ }
                    { isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
                            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-pink-100 dark:bg-pink-150 rounded-full transition-all duration-300"
                                    style={ { width: `${ progress }%` } }
                                />
                            </div>
                            <p className="text-white/60 text-sm">Trimming… { progress }%</p>
                        </div>
                    ) }
                </div>

                {/* Controls */ }
                <div className="px-6 py-5 space-y-5">

                    {/* Trim info strip */ }
                    <div className="flex items-center justify-between text-xs font-mono">
                        <span
                            className="px-2 py-1 rounded bg-pink-100/15 dark:bg-pink-150/15 dark:text-pink-10 text-dark-100 border border-pink-100/20 dark:border-pink-150/20">
                            Start: { formatTime( trimStart ) }
                        </span>
                        <span className="text-dark-100 dark:text-white/70">
                            { formatTime( trimDuration ) } selected
                        </span>
                        <span
                            className="px-2 py-1 rounded bg-pink-100/15 dark:bg-pink-150/15 dark:text-pink-10 border text-dark-100 border-pink-100/20 dark:border-pink-150/20">
                            End: { formatTime( trimEnd ) }
                        </span>
                    </div>

                    {/* Timeline */ }
                    <div
                        ref={ timelineRef }
                        className="relative h-12  bg-gray-600/10 dark:bg-white/5 rounded-xl cursor-pointer select-none border border-dark-100 dark:border-white/10"
                    >
                        {/* Dimmed outside trim region */ }
                        <div
                            className="absolute inset-y-0 left-0 bg-black/40 dark:bg-black/50 rounded-l-xl"
                            style={ { width: `${ toPercent( trimStart ) }%` } }
                        />
                        <div
                            className="absolute inset-y-0 right-0 bg-black/50 rounded-r-xl"
                            style={ { width: `${ 100 - toPercent( trimEnd ) }%` } }
                        />

                        {/* Active trim region highlight */ }
                        <div
                            className="absolute inset-y-0 border-y-2 border-white/30"
                            style={ {
                                left: `${ toPercent( trimStart ) }%`,
                                width: `${ toPercent( trimEnd ) - toPercent( trimStart ) }%`,
                            } }
                        />

                        {/* Start handle */ }
                        <div
                            className="absolute top-0 bottom-0 w-4 -translate-x-1/2 flex items-center justify-center cursor-ew-resize group z-10"
                            style={ { left: `${ toPercent( trimStart ) }%` } }
                            onMouseDown={ handleMouseDown( "start" ) }
                        >
                            <div
                                className="w-3 h-full bg-pink-100 dark:bg-pink-150 rounded-sm flex items-center justify-center">
                                <div className="w-0.5 h-4 bg-dark-100 dark:bg-white/60 rounded"/>
                            </div>
                        </div>

                        {/* End handle */ }
                        <div
                            className="absolute top-0 bottom-0 w-4 -translate-x-1/2 flex items-center justify-center cursor-ew-resize group z-10"
                            style={ { left: `${ toPercent( trimEnd ) }%` } }
                            onMouseDown={ handleMouseDown( "end" ) }
                        >
                            <div
                                className="w-3 h-full bg-pink-100 dark:bg-pink-150 rounded-sm flex items-center justify-center">
                                <div className="w-0.5 h-4 bg-dark-100  dark:bg-white/60 rounded"/>
                            </div>
                        </div>

                        {/* Playhead */ }
                        <div
                            className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-dark-100 dark:bg-white cursor-ew-resize z-20"
                            style={ { left: `${ toPercent( currentTime ) }%` } }
                            onMouseDown={ handleMouseDown( "playhead" ) }
                        >
                            <div
                                className="w-3 h-3  bg-dark-100 dark:bg-white rounded-full -translate-x-[5px] -translate-y-1 shadow"/>
                        </div>
                    </div>

                    {/* Playback + action buttons */ }
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Rewind to start */ }
                            <button
                                onClick={ () => {
                                    if ( videoRef.current ) videoRef.current.currentTime = trimStart;
                                    setCurrentTime( trimStart );
                                    setIsPlaying( false );
                                } }
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-100/20 hover:bg-dark-100/30 text-dark-100 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white transition-colors text-sm"
                                title="Go to start"
                            >
                                ⏮
                            </button>

                            {/* Play / Pause */ }
                            <button
                                onClick={ () => setIsPlaying( ( p ) => !p ) }
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-100/70 dark:bg-white text-white dark:text-black hover:bg-dark-100/80  dark:hover:bg-white/90 transition-colors font-bold text-sm shadow"
                            >
                                { isPlaying ? "⏸" : "▶" }
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={ handleTrim }
                                disabled={ !ffmpegLoaded || isProcessing }
                                className="px-5 py-2 text-sm font-medium bg-pink-100 dark:bg-pink-150 hover:bg-pink-350 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl transition-colors shadow"
                            >
                                { isProcessing ? "Skinnyfying…" : "Snip" }
                            </button>
                        </div>
                    </div>

                    { loadError && (
                        <p className="dark:text-red-400 text-red-950 text-xs text-center bg-red-800/20 dark:bg-red-500/10 border border-red-900/50 dark:border-red-500/20 rounded-lg px-3 py-2">
                            { loadError }
                        </p>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default VideoTrimModal;
