import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ilike, sql } from "drizzle-orm";
import { DEFAULT_RECORDING_CONFIG, DEFAULT_VIDEO_CONFIG } from "@/constants";
import { videos } from "@/src/db/schema";

// For tailwind to add dynamic styles - combines class names together and removes duplicates.
export function cn( ...inputs: ClassValue[] ) {
    return twMerge( clsx( inputs ) );
}

// Updates URL search parameters and returns the new full URL.
export const updateURLParams = (
    currentParams: URLSearchParams,
    updates: Record<string, string | null | undefined>,
    basePath: string = "/"
): string => {
    const params = new URLSearchParams( currentParams.toString() );

    // Process each parameter update
    Object.entries( updates ).forEach( ( [ name, value ] ) => {
        if ( value ) {
            params.set( name, value );
        } else {
            params.delete( name );
        }
    } );

    return `${ basePath }?${ params.toString() }`;
};

// Access the env and if it doesn't exist, it throws an error, otherwise returns the value.
export const getEnv = ( key: string ): string => {
    const value = process.env[key];
    if ( !value ) throw new Error( `Missing required env: ${ key }` );
    return value;
};


// Makes an API request to Bunny with the correct headers and returns the result.
// API fetch helper with required Bunny CDN options
export const apiFetch = async <T = Record<string, unknown>>(
    url: string,
    options: Omit<ApiFetchOptions, "bunnyType"> & {
        bunnyType: "stream" | "storage";
    }
): Promise<T> => {
    const {
        method = "GET",
        headers = {},
        body,
        expectJson = true,
        bunnyType,
    } = options;

    // Streaming or storing the videos.
    const key = getEnv(
        bunnyType === "stream"
            ? "BUNNY_STREAM_ACCESS_KEY"
            : "BUNNY_STORAGE_ACCESS_KEY"
    );

    // Passes necessary headers
    const requestHeaders = {
        ...headers,
        AccessKey: key,
        ...(bunnyType === "stream" && {
            accept: "application/json",
            ...(body && { "content-type": "application/json" }),
        }),
    };

    const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        ...(body && { body: JSON.stringify( body ) }),
    };

    const response = await fetch( url, requestOptions );

    if ( !response.ok ) {
        throw new Error( `API error ${ response.text() }` );
    }

    if ( method === "DELETE" || !expectJson ) {
        return true as T;
    }

    return await response.json();
};

// API calls will be wrapped with this error handling functions so that there is no code duplication,
// and the call returns an error rather than crashing.
export const withErrorHandling = <T, A extends unknown[]>(
    fn: ( ...args: A ) => Promise<T>
) => {
    return async ( ...args: A ): Promise<T> => {
        try {
            return await fn( ...args );
        } catch ( error ) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            return errorMessage as unknown as T;
        }
    };
};

// Returns the correct database sort order based on the selected filter.
export const getOrderByClause = ( filter?: string ) => {
    switch ( filter ) {
        case "Most Viewed":
            return sql`${ videos.views }
            DESC`;
        case "Least Viewed":
            return sql`${ videos.views }
            ASC`
        case "Oldest First":
            return sql`${ videos.createdAt }
            ASC`;
        case "Most Liked":
            return sql`${ videos.likes }
            DESC`;
        case "Most Recent":
        default:
            return sql`${ videos.createdAt }
            DESC`;
    }
};

// Creates a list of page numbers to show in pagination.
export const generatePagination = ( currentPage: number, totalPages: number ) => {
    if ( totalPages <= 7 ) {
        return Array.from( { length: totalPages }, ( _, i ) => i + 1 );
    }
    if ( currentPage <= 3 ) {
        return [ 1, 2, 3, 4, 5, "...", totalPages ];
    }
    if ( currentPage >= totalPages - 2 ) {
        return [
            1,
            "...",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }
    return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
    ];
};

// Gets the screen stream and optional microphone stream for recording.
export const getMediaStreams = async (
    withMic: boolean
): Promise<MediaStreams> => {
    // Use the navigator JS object to access the media devices.
    const displayStream = await navigator.mediaDevices.getDisplayMedia( {
        video: DEFAULT_VIDEO_CONFIG,
        audio: true,
    } );

    const hasDisplayAudio = displayStream.getAudioTracks().length > 0;
    let micStream: MediaStream | null = null;

    if ( withMic ) {
        micStream = await navigator.mediaDevices.getUserMedia( { audio: true } );
        micStream
            .getAudioTracks()
            .forEach( ( track: MediaStreamTrack ) => (track.enabled = true) );
    }

    return { displayStream, micStream, hasDisplayAudio };
};

// Mixes screen audio and microphone audio into one stream.
export const createAudioMixer = (
    ctx: AudioContext,
    displayStream: MediaStream,
    micStream: MediaStream | null,
    hasDisplayAudio: boolean
) => {
    if ( !hasDisplayAudio && !micStream ) return null;

    // Create a new audio output stream
    const destination = ctx.createMediaStreamDestination();
    const mix = ( stream: MediaStream, gainValue: number ) => {
        const source = ctx.createMediaStreamSource( stream );
        // Gain is volume control
        const gain = ctx.createGain();
        gain.gain.value = gainValue;
        // connect all together
        source.connect( gain ).connect( destination );
    };

    // Screen audio should be slightly quiter than microphone.
    if ( hasDisplayAudio ) mix( displayStream, 0.7 );
    if ( micStream ) mix( micStream, 1.5 );

    return destination;
};

// Creates a MediaRecorder with default settings if possible.
export const setupMediaRecorder = ( stream: MediaStream ) => {
    try {
        return new MediaRecorder( stream, DEFAULT_RECORDING_CONFIG );
    } catch {
        return new MediaRecorder( stream );
    }
};

// Loads a video file and returns its length in seconds.
export const getVideoDuration = ( url: string ): Promise<number | null> =>
    new Promise( ( resolve ) => {
        const video = document.createElement( "video" );
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            const duration =
                isFinite( video.duration ) && video.duration > 0
                    ? Math.round( video.duration )
                    : null;
            URL.revokeObjectURL( video.src );
            resolve( duration );
        };
        video.onerror = () => {
            URL.revokeObjectURL( video.src );
            resolve( null );
        };
        video.src = url;
    } );

// Creates and sets up a recorder with the given event handlers.
export const setupRecording = (
    stream: MediaStream,
    handlers: RecordingHandlers
): MediaRecorder => {
    const recorder = new MediaRecorder( stream, DEFAULT_RECORDING_CONFIG );
    recorder.ondataavailable = handlers.onDataAvailable;
    recorder.onstop = handlers.onStop;
    return recorder;
};

// Stops the recorder and turns off all media tracks.
export const cleanupRecording = (
    recorder: MediaRecorder | null,
    stream: MediaStream | null,
    originalStreams: MediaStream[] = []
) => {
    if ( recorder?.state !== "inactive" ) {
        recorder?.stop();
    }

    stream?.getTracks().forEach( ( track: MediaStreamTrack ) => track.stop() );
    originalStreams.forEach( ( s ) =>
        s.getTracks().forEach( ( track: MediaStreamTrack ) => track.stop() )
    );
};

// Combines recorded chunks into a single video file and creates a URL for it.
export const createRecordingBlob = (
    chunks: Blob[]
): { blob: Blob; url: string } => {
    // Combine all the little video pieces into one video file.
    const blob = new Blob( chunks, { type: "video/webm" } );
    const url = URL.createObjectURL( blob );
    return { blob, url };
};

// Calculates how many seconds have passed since recording started.
export const calculateRecordingDuration = ( startTime: number | null ): number =>
    startTime ? Math.round( (Date.now() - startTime) / 1000 ) : 0;

// Converts a transcript string into structured time and text entries. E.G
// [
//     { time: "00:00:01", text: "Hello everyone" },
//     { time: "00:00:05", text: "Welcome to the video" }
// ]
export function parseTranscript( transcript: string ): TranscriptEntry[] {
    // cleanup headers
    const lines = transcript.replace( /^WEBVTT\s*/, "" ).split( "\n" );
    const result: TranscriptEntry[] = [];
    let tempText: string[] = [];
    let startTime: string | null = null;

    for ( const line of lines ) {
        const trimmedLine = line.trim();
        // If it matches a time pattern its a new subtitle block
        const timeMatch = trimmedLine.match(
            /(\d{2}:\d{2}:\d{2})\.\d{3}\s-->\s(\d{2}:\d{2}:\d{2})\.\d{3}/
        );

        if ( timeMatch ) {
            if ( tempText.length > 0 && startTime ) {
                result.push( { time: startTime, text: tempText.join( " " ) } );
                tempText = [];
            }
            startTime = timeMatch[1] ?? null;
        } else if ( trimmedLine ) {
            tempText.push( trimmedLine );
        }

        if ( tempText.length >= 3 && startTime ) {
            result.push( { time: startTime, text: tempText.join( " " ) } );
            tempText = [];
            startTime = null;
        }
    }

    if ( tempText.length > 0 && startTime ) {
        result.push( { time: startTime, text: tempText.join( " " ) } );
    }

    return result;
}

// Returns how many days ago a date was in simple text.
export function daysAgo( inputDate: Date ): string {
    const input = new Date( inputDate );
    const now = new Date();

    const diffTime = now.getTime() - input.getTime();
    const diffDays = Math.floor( diffTime / (1000 * 60 * 60 * 24) );

    if ( diffDays <= 0 ) {
        return "Today";
    } else if ( diffDays === 1 ) {
        return "1 day ago";
    } else {
        return `${ diffDays } days ago`;
    }
}

// Creates an iframe link for embedding a video.
export const createIframeLink = ( videoId: string ) =>
    `https://iframe.mediadelivery.net/embed/${ getEnv( "BUNNY_LIBRARY_ID" ) }/${ videoId }?autoplay=true&preload=true`;

// Checks if a video title matches the search text.
export const doesTitleMatch = ( videos: any, searchQuery: string ) =>
    ilike(
        sql`REPLACE
        (REPLACE(REPLACE(LOWER(
        ${ videos.title }
        ),
        '-',
        ''
        ),
        '.',
        ''
        ),
        ' ',
        ''
        )`,
        `%${ searchQuery.replace( /[-. ]/g, "" ).toLowerCase() }%`
    );

// Generates an image file from a video file.
export const generateRandomThumbnail = async (
    file: File
): Promise<File | null> => {
    return new Promise( ( resolve ) => {
        const videoEl = document.createElement( "video" );

        // Load the video file
        videoEl.src = URL.createObjectURL( file );

        // Mute and avoid from going full screen on mobile.
        videoEl.muted = true;
        videoEl.playsInline = true;

        // wait for metadata and pick a random timestamp.
        videoEl.addEventListener( "loadedmetadata", () => {
            const duration = videoEl.duration;

            // avoid first & last 10%
            videoEl.currentTime = Math.random() * (duration * 0.8) + duration * 0.1;
        } );

        videoEl.addEventListener( "seeked", () => {
            // Canvas is how video becomes an image
            const canvas = document.createElement( "canvas" );
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;

            // Canvas needs drawing context to render
            const ctx = canvas.getContext( "2d" );
            if ( !ctx ) return resolve( null );

            // copies current frame of the video into the canvas
            ctx.drawImage( videoEl, 0, 0 );

            // converts canvas pixels into image file.
            canvas.toBlob( ( blob ) => {
                    if ( !blob ) return resolve( null );

                    const thumbnailFile = new File(
                        [ blob ],
                        "randomised_thumbnail.jpg",
                        {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        }
                    );

                    // cleanup
                    URL.revokeObjectURL( videoEl.src );
                    resolve( thumbnailFile );
                },
                "image/jpeg",
                // compress slightly
                0.9
            );
        } );
    } );
};

const TOTAL_GIFS = 541;

export function getRandomGifs( count: number ): string[] {
    const allGifs = Array.from(
        { length: TOTAL_GIFS },
        ( _, i ) => `/assets/all_gifs/${ i + 1 }.gif`
    );

    const shuffled = [ ...allGifs ].sort( () => Math.random() - 0.5 );
    return shuffled.slice( 0, count );
}