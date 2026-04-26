"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SelectFrameModalProps {
    file: File;
    onClose: () => void;
    onFrameSelection: ( frame: Blob ) => void;
}

const THUMBNAIL_COUNT = 10;

const SelectFrameModal = ( { file, onClose, onFrameSelection }: SelectFrameModalProps ) => {
    const videoRef = useRef<HTMLVideoElement>( null );
    const canvasRef = useRef<HTMLCanvasElement>( null );
    const scrubberRef = useRef<HTMLDivElement>( null );

    const [ previewUrl, setPreviewUrl ] = useState( "" );
    const [ duration, setDuration ] = useState( 0 );
    const [ currentTime, setCurrentTime ] = useState( 0 );
    const [ dragging, setDragging ] = useState( false );
    const [ thumbnails, setThumbnails ] = useState<string[]>( [] );
    const [ generatingThumbs, setGeneratingThumbs ] = useState( false );
    const [ capturedFrame, setCapturedFrame ] = useState<string | null>( null );
    const [ isPlaying, setIsPlaying ] = useState( false );
    const animFrameRef = useRef<number>( 0 );

    useEffect( () => {
        const url = URL.createObjectURL( file );
        setPreviewUrl( url );
        return () => URL.revokeObjectURL( url );
    }, [ file ] );

    const generateThumbnails = useCallback( async ( videoDuration: number ) => {
        const video = document.createElement( "video" );
        video.src = previewUrl;
        video.crossOrigin = "anonymous";
        video.muted = true;

        await new Promise<void>( ( res ) => {
            video.onloadedmetadata = () => res();
        } );

        const canvas = document.createElement( "canvas" );
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext( "2d" )!;
        const thumbs: string[] = [];

        setGeneratingThumbs( true );

        for ( let i = 0; i < THUMBNAIL_COUNT; i++ ) {
            const time = (i / (THUMBNAIL_COUNT - 1)) * videoDuration;
            video.currentTime = time;
            await new Promise<void>( ( res ) => {
                video.onseeked = () => {
                    ctx.drawImage( video, 0, 0, 160, 90 );
                    thumbs.push( canvas.toDataURL( "image/jpeg", 0.6 ) );
                    res();
                };
            } );
        }

        setThumbnails( thumbs );
        setGeneratingThumbs( false );
    }, [ previewUrl ] );

    const handleVideoLoaded = () => {
        const video = videoRef.current;
        if ( !video ) return;
        setDuration( video.duration );
        generateThumbnails( video.duration );
    };

    // Playback loop — stops playing when it reaches the end
    useEffect( () => {
        const video = videoRef.current;
        if ( !video ) return;

        const tick = () => {
            if ( video.currentTime >= duration ) {
                video.pause();
                setIsPlaying( false );
                return;
            }
            setCurrentTime( video.currentTime );
            animFrameRef.current = requestAnimationFrame( tick );
        };

        if ( isPlaying ) {
            video.play();
            animFrameRef.current = requestAnimationFrame( tick );
        } else {
            video.pause();
            cancelAnimationFrame( animFrameRef.current );
        }

        return () => cancelAnimationFrame( animFrameRef.current );
    }, [ isPlaying, duration ] );

    const toPercent = ( val: number ) => (duration ? (val / duration) * 100 : 0);

    const getScrubberX = useCallback( ( clientX: number ): number => {
        const el = scrubberRef.current;
        if ( !el ) return 0;
        const rect = el.getBoundingClientRect();
        return Math.max( 0, Math.min( 1, (clientX - rect.left) / rect.width ) );
    }, [] );

    const seekTo = useCallback( ( ratio: number ) => {
        const time = ratio * duration;
        if ( videoRef.current ) videoRef.current.currentTime = time;
        setCurrentTime( time );
        setIsPlaying( false );
    }, [ duration ] );

    useEffect( () => {
        const onMove = ( e: MouseEvent ) => {
            if ( !dragging ) return;
            seekTo( getScrubberX( e.clientX ) );
        };
        const onUp = () => setDragging( false );

        window.addEventListener( "mousemove", onMove );
        window.addEventListener( "mouseup", onUp );
        return () => {
            window.removeEventListener( "mousemove", onMove );
            window.removeEventListener( "mouseup", onUp );
        };
    }, [ dragging, getScrubberX, seekTo ] );

    const captureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if ( !video || !canvas ) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext( "2d" )!;
        ctx.drawImage( video, 0, 0, canvas.width, canvas.height );

        setCapturedFrame( canvas.toDataURL( "image/jpeg", 0.95 ) );
    };

    const confirmFrame = () => {
        const canvas = canvasRef.current;
        if ( !canvas ) return;

        canvas.toBlob( ( blob ) => {
            if ( blob ) {
                onFrameSelection( blob );
                onClose();
            }
        }, "image/jpeg", 0.95 );
    };

    // TODO ask if capture and confirm is preferred in one go, if so is capture necessary ?
    // const captureAndConfirm = () => {
    //     captureFrame();
    //     confirmFrame();
    // }

    const formatTime = ( s: number ) => {
        const m = Math.floor( s / 60 ).toString().padStart( 2, "0" );
        const sec = Math.floor( s % 60 ).toString().padStart( 2, "0" );
        const ms = Math.floor( (s % 1) * 100 ).toString().padStart( 2, "0" );
        return `${ m }:${ sec }.${ ms }`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <canvas ref={ canvasRef } className="hidden"/>

            <div
                className="relative w-full max-w-3xl bg-white dark:bg-gray-350 text-dark-100 border border-gray-20 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                {/* Header */ }
                <div
                    className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
                    <div>
                        <h2 className="text-dark-100 dark:text-white font-semibold text-lg tracking-tight">Pick ur
                            Poison</h2>
                        <p className="text-dark-100/60 dark:text-white/60 text-xs mt-0.5 truncate max-w-xs">{ file.name }</p>
                    </div>
                    <button
                        onClick={ onClose }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors text-dark-100/60 hover:text-dark-100 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Full-width video preview — matches trim modal height */ }
                <div className="relative bg-black aspect-video flex items-center justify-center">
                    { previewUrl && (
                        <video
                            ref={ videoRef }
                            src={ previewUrl }
                            className="w-full h-full object-contain"
                            onLoadedMetadata={ handleVideoLoaded }
                            onPlay={ () => setIsPlaying( true ) }
                            onPause={ () => setIsPlaying( false ) }
                            muted
                        />
                    ) }

                    {/* Timecode */ }
                    <div
                        className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white/80 text-[10px] font-mono tracking-wider">
                        { formatTime( currentTime ) }
                    </div>

                    {/* Captured frame thumbnail in corner */ }
                    { capturedFrame && (
                        <div className="absolute bottom-3 right-3 flex items-end gap-2">
                            <div
                                className="relative w-48 aspect-video rounded-xl overflow-hidden border-2 border-pink-100 dark:border-pink-150 shadow-2xl">
                                <img
                                    src={ capturedFrame }
                                    alt="Captured frame"
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-150 flex items-center justify-center shadow">
                                    <span className="text-white text-[9px] font-bold">✓</span>
                                </div>
                                <div
                                    className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white/80 text-[9px] uppercase tracking-widest">
                                    Selected
                                </div>
                            </div>
                        </div>
                    ) }
                </div>

                {/* Controls */ }
                <div className="px-6 py-5 space-y-5">

                    {/* Timecode strip */ }
                    <div className="flex items-center justify-between text-xs font-mono">
                        <span
                            className="px-2 py-1 rounded bg-pink-100/15 dark:bg-pink-150/15 dark:text-pink-10 text-dark-100 border border-pink-100/20 dark:border-pink-150/20">
                            { formatTime( currentTime ) }
                        </span>
                        <span
                            className="px-2 py-1 rounded bg-pink-100/15 dark:bg-pink-150/15 dark:text-pink-10 text-dark-100 border border-pink-100/20 dark:border-pink-150/20">
                            { formatTime( duration ) }
                        </span>
                    </div>

                    {/* Filmstrip scrubber */ }
                    <div
                        ref={ scrubberRef }
                        className="relative h-12 bg-gray-600/90 dark:bg-white/5 rounded-xl overflow-hidden cursor-crosshair select-none border border-dark-100 dark:border-white/10"
                        onMouseDown={ ( e ) => {
                            setDragging( true );
                            seekTo( getScrubberX( e.clientX ) );
                        } }
                        onClick={ ( e ) => seekTo( getScrubberX( e.clientX ) ) }
                    >
                        {/* Thumbnail filmstrip */ }
                        <div className="absolute inset-0 flex">
                            { generatingThumbs || thumbnails.length === 0
                                ? Array.from( { length: THUMBNAIL_COUNT } ).map( ( _, i ) => (
                                    <div
                                        key={ i }
                                        className="flex-1 h-full bg-white/5 animate-pulse"
                                        style={ { animationDelay: `${ i * 80 }ms` } }
                                    />
                                ) )
                                : thumbnails.map( ( src, i ) => (
                                    <img
                                        key={ i }
                                        src={ src }
                                        alt=""
                                        className="flex-1 h-full object-cover"
                                        draggable={ false }
                                    />
                                ) )
                            }
                        </div>

                        {/* Edge gradients */ }
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={ {
                                background: "linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.4) 100%)"
                            } }
                        />

                        {/* Playhead */ }
                        <div
                            className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white pointer-events-none z-10"
                            style={ { left: `${ toPercent( currentTime ) }%` } }
                        >
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md"/>
                        </div>
                    </div>

                    {/* Frame step buttons + actions */ }
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={ () => {
                                    if ( videoRef.current ) videoRef.current.currentTime = 0;
                                    setCurrentTime( 0 );
                                    setIsPlaying( false );
                                } }
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-100/20 hover:bg-dark-100/30 text-dark-100 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white transition-colors text-sm"
                                title="Jump to start"
                            >
                                ⏮
                            </button>
                            <button
                                onClick={ () => {
                                    const t = Math.max( 0, currentTime - 0.2 );
                                    if ( videoRef.current ) videoRef.current.currentTime = t;
                                    setCurrentTime( t );
                                    setIsPlaying( false );
                                } }
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-100/20 hover:bg-dark-100/30 text-dark-100 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white transition-colors text-sm"
                                title="Step back 0.2s"
                            >
                                ‹
                            </button>

                            {/* Play / Pause */ }
                            <button
                                onClick={ () => setIsPlaying( ( p ) => !p ) }
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-100/70 dark:bg-white text-white dark:text-black hover:bg-dark-100/80 dark:hover:bg-white/90 transition-colors font-bold text-sm shadow"
                            >
                                { isPlaying ? "⏸" : "▶" }
                            </button>

                            <button
                                onClick={ () => {
                                    const t = Math.min( duration, currentTime + 0.2 );
                                    if ( videoRef.current ) videoRef.current.currentTime = t;
                                    setCurrentTime( t );
                                    setIsPlaying( false );
                                } }
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-100/20 hover:bg-dark-100/30 text-dark-100 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white transition-colors text-sm"
                                title="Step forward 0.2s"
                            >
                                ›
                            </button>
                            <button
                                onClick={ () => {
                                    if ( videoRef.current ) videoRef.current.currentTime = duration;
                                    setCurrentTime( duration );
                                    setIsPlaying( false );
                                } }
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-100/20 hover:bg-dark-100/30 text-dark-100 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white transition-colors text-sm"
                                title="Jump to end"
                            >
                                ⏭
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={ captureFrame }
                                className="px-4 py-2 text-sm font-medium bg-dark-100/20 hover:bg-dark-100/30 dark:bg-white/10 dark:hover:bg-white/15 text-dark-100 dark:text-white rounded-xl transition-colors"
                            >
                                Capture
                            </button>
                            <button
                                onClick={ confirmFrame }
                                className="px-5 py-2 text-sm font-medium bg-pink-100 dark:bg-pink-150 hover:bg-pink-350 disabled:bg-pink-100/50 dark:disabled:bg-pink-150/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow"
                            >
                                Use Frame
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectFrameModal;
