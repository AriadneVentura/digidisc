import { ChangeEvent, useRef, useState } from "react";

/**
 *  Custom hook that keeps track of what the file is doing.
 * @param maxSize The maxsize accepted for the file upload.
 */
export const useFileInput = ( maxSize: number ) => {
    const [ file, setFile ] = useState<File | null>( null );
    const [ previewUrl, setPreviewUrl ] = useState( "" );
    const [ duration, setDuration ] = useState( 0 );
    const inputRef = useRef<HTMLInputElement>( null );

    // Deals with file upload logic, called when file is uploaded (duh)
    const handleFileChange = ( e: ChangeEvent<HTMLInputElement> ) => {
        // Is there a selected file?
        if ( e.target.files?.[0] ) {

            const selectedFile = e.target.files[0];
            if ( selectedFile.size > maxSize ) return;

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
                    // isFinite checks if video has an end.
                    if ( isFinite( video.duration ) && video.duration > 0 ) {
                        setDuration( Math.round( video.duration ) );
                    } else {
                        setDuration( 0 );
                    }

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

    return { file, previewUrl, duration, inputRef, handleFileChange, resetFile };
}