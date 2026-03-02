import { useEffect, useRef, useState } from "react";
import {
    calculateRecordingDuration,
    cleanupRecording,
    createAudioMixer,
    createRecordingBlob,
    getMediaStreams,
    setupRecording,
} from "@/lib/utils";

export const useScreenRecording = () => {
    const [ state, setState ] = useState<BunnyRecordingState>( {
        isRecording: false,
        // The video that has been recorded up to this point.
        recordedBlob: null,
        recordedVideoUrl: "",
        recordingDuration: 0,
    } );

    // Use refs cause dont want re-renders while recording changes/updates.
    const mediaRecorderRef = useRef<MediaRecorder | null>( null );
    // Combined media (video & stream), kept track so after recording stops the UI can still access it.
    const streamRef = useRef<ExtendedMediaStream | null>( null );
    // All the video pieces as they arrive
    const chunksRef = useRef<Blob[]>( [] );
    // Audio mixing engine, requires manual cleanup so needs ref to it
    const audioContextRef = useRef<AudioContext | null>( null );
    // Timestamp for when recording started
    const startTimeRef = useRef<number | null>( null );

    // When the video changes clean up
    useEffect( () => {
        // return () => {} means to run when cleaning up
        return () => {
            stopRecording();
            // let browser free memory of url
            if ( state.recordedVideoUrl ) URL.revokeObjectURL( state.recordedVideoUrl );
            // close audio engine only if its not closed
            if ( audioContextRef.current?.state !== "closed" ) {
                audioContextRef.current?.close().catch( console.error );
            }

            audioContextRef.current = null;
        };
    }, [ state.recordedVideoUrl ] );

    const handleRecordingStop = () => {
        const { blob, url } = createRecordingBlob( chunksRef.current );
        const duration = calculateRecordingDuration( startTimeRef.current );

        setState( ( prev ) => ({
            ...prev,
            recordedBlob: blob,
            recordedVideoUrl: url,
            recordingDuration: duration,
            isRecording: false,
        }) );
    };

    // async because it waits for browser permissions (screen & mic)
    const startRecording = async ( withMic = true ) => {
        try {
            // Stop previous recording.
            stopRecording();

            // displayStream - screen recording
            // micStream - microphone (if enabled)
            // hasDisplayAudio - whether screen recording has audio
            const { displayStream, micStream, hasDisplayAudio } = await getMediaStreams( withMic );
            // Combine the above into one stream
            const combinedStream = new MediaStream() as ExtendedMediaStream;

            displayStream
                .getVideoTracks()
                .forEach( ( track: MediaStreamTrack ) => combinedStream.addTrack( track ) );

            // To mix screen and mic audio together so audios don't conflict
            audioContextRef.current = new AudioContext();
            const audioDestination = createAudioMixer(
                audioContextRef.current,
                // In case there is system audio (spotify etc)
                displayStream,
                micStream,
                hasDisplayAudio
            );

            audioDestination?.stream
                .getAudioTracks()
                .forEach( ( track: MediaStreamTrack ) => combinedStream.addTrack( track ) );

            // Store original streams
            combinedStream._originalStreams = [
                displayStream,
                ...(micStream ? [ micStream ] : []),
            ];
            streamRef.current = combinedStream;

            // Receives a chunk of video data and pushes it into chunksRef.
            mediaRecorderRef.current = setupRecording( combinedStream, {
                // Every time mediaRecorder produces a chunk of video data then store it.
                onDataAvailable: ( e ) => e.data.size && chunksRef.current.push( e.data ),
                onStop: handleRecordingStop,
            } );

            // Clear old video data.
            chunksRef.current = [];
            startTimeRef.current = Date.now();
            // Starts the recording, and saves the data in 1s chunks.
            mediaRecorderRef.current.start( 1000 );
            setState( ( prev ) => ({ ...prev, isRecording: true }) );
            return true;
        } catch ( error ) {
            console.error( "Recording error:", error );
            return false;
        }
    };

    const stopRecording = () => {
        cleanupRecording(
            mediaRecorderRef.current,
            streamRef.current,
            streamRef.current?._originalStreams
        );
        streamRef.current = null;
        setState( ( prev ) => ({ ...prev, isRecording: false }) );
    };

    const resetRecording = () => {
        stopRecording();
        if ( state.recordedVideoUrl ) URL.revokeObjectURL( state.recordedVideoUrl );
        setState( {
            isRecording: false,
            recordedBlob: null,
            recordedVideoUrl: "",
            recordingDuration: 0,
        } );
        startTimeRef.current = null;
    };

    return {
        ...state,
        startRecording,
        stopRecording,
        resetRecording,
    };
};