import { ChangeEvent, useRef, useState } from "react";

/**
 *  Custom hook that keeps track of what the file is doing.
 * @param maxSize The maxsize accepted for the file upload.
 * @param maxDuration The max duration for the clip.
 * @param maxAcceptedDuration The max duration upload permits.
 */
export const useFileInput = ( maxSize?: number, maxDuration?: number, maxAcceptedDuration?: number ) => {
    const [ file, setFile ] = useState<File | null>( null );
    const [ previewUrl, setPreviewUrl ] = useState( "" );
    const [ duration, setDuration ] = useState( 0 );
    const inputRef = useRef<HTMLInputElement>( null );
    const [ error, setError ] = useState<string | null>( null );
    const [ trimWarning, setTrimWarning ] = useState<string | null>( null );


    // Deals with file upload logic, called when file is uploaded (duh)
    const handleFileChange = ( e: ChangeEvent<HTMLInputElement> ) => {
        // Is there a selected file?
        if ( e.target.files?.[0] ) {

            const selectedFile = e.target.files[0];
            if ( maxSize && selectedFile.size > maxSize ) {
                setError( `Clip is too bulbous :( max is 500MB. Try lowering the resolution or give it a haircut!` );

                // Reset the input so user can re-select
                if ( inputRef.current ) {
                    inputRef.current.value = "";
                }

                return;
            }
            setError( null );

            // This means that we want to call the browser to let it know we don't want to keep the reference to the file
            // any longer cause we have access to the actual file.
            if ( previewUrl ) URL.revokeObjectURL( previewUrl );

            setFile( selectedFile );

            // Pass the uploaded selected file.
            const objectUrl = URL.createObjectURL( selectedFile );
            setPreviewUrl( objectUrl );

            if ( selectedFile.type.startsWith( "video" ) ) {
                // Get access to the video.
                const video = document.createElement( "video" );
                // Preload the metadata of the video.
                video.preload = "metadata";

                // Listener
                video.onloadedmetadata = () => {
                    // We've saved the video to the state so dont the src anymore.
                    URL.revokeObjectURL( video.src );
                    const videoLength = Math.round( video.duration );
                    // isFinite checks if video has an end.
                    if ( !isFinite( videoLength ) || videoLength <= 0 ) {
                        setError( "Invalid clip" );
                        resetFile();
                        return;
                    }

                    // max 60s atm
                    if ( maxDuration && videoLength > maxDuration ) {
                        setError( `Clip must be ${ maxDuration } seconds or under in length to upload :(` );
                        resetFile();
                        return;
                    }


                    // max 30s for upload atm : )
                    if ( maxAcceptedDuration && videoLength >= maxAcceptedDuration ) {
                        setTrimWarning( `Fyi clip must be max ${ maxDuration } seconds to post it, trim it! :)` );
                    } else {
                        setTrimWarning( null );
                    }

                    setError( null );
                    setDuration( videoLength );

                    // We've saved the video to the state so dont the src anymore.
                    URL.revokeObjectURL( video.src );
                }

                video.src = objectUrl;
            }


        }
    }

    // Deals with file reset logic.
    const resetFile = () => {
        if ( previewUrl ) URL.revokeObjectURL( previewUrl );

        setFile( null );

        setPreviewUrl( "" );

        setDuration( 0 );

        if ( inputRef.current ) {
            inputRef.current.value = ""
        }
    }

    return { file, previewUrl, duration, inputRef, handleFileChange, resetFile, error, trimWarning };
}