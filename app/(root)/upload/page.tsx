'use client'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { MAX_DURATION, MAX_THUMBNAIL_SIZE, MAX_UPLOAD_DURATION, MAX_VIDEO_SIZE } from "@/constants";
import { getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails } from "@/lib/actions/video";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { generateRandomThumbnail } from "@/lib/utils";
import VideoTrimModal from "@/components/VideoTrimModal";
import SelectFrameModal from "@/components/SelectFrame";
import ClearNavigationCursor from "@/components/ClearNavigationCursor";
import { GameSearchInput } from "@/components/GameSearchInput";

const uploadFileToBunny = (
    file: File,
    uploadUrl: string,
    accessKey: string,
    onProgress?: ( percent: number ) => void
): Promise<void> => {
    return new Promise( ( resolve, reject ) => {
        // XMLHttpRequest tracks progress over fetch!!
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener( "progress", ( event ) => {
            if ( event.lengthComputable && onProgress ) {
                const percent = Math.round( (event.loaded / event.total) * 100 );
                onProgress( percent );
            }
        } );

        xhr.addEventListener( "load", () => {
            if ( xhr.status >= 200 && xhr.status < 300 ) {
                resolve();
            } else {
                reject( new Error( `Upload failed with status ${ xhr.status }` ) );
            }
        } );

        xhr.addEventListener( "error", () => reject( new Error( "Upload failed" ) ) );
        xhr.addEventListener( "abort", () => reject( new Error( "Upload aborted" ) ) );

        xhr.open( "PUT", uploadUrl );
        xhr.setRequestHeader( "AccessKey", accessKey );
        xhr.setRequestHeader( "Content-Type", file.type );
        xhr.send( file );
    } );
};


const Page = () => {
    const router = useRouter();
    const [ isSubmitting, setIsSubmitting ] = useState( false );
    const [ error, setError ] = useState( "" );
    const [ videoDuration, setVideoDuration ] = useState( 0 );
    const [ showVideoSelect, setShowVideoSelect ] = useState( false );
    const [ showFrameSelect, setShowFrameSelect ] = useState( false );
    const [ uploadProgress, setUploadProgress ] = useState<number>( 0 );
    const [ selectedGame, setSelectedGame ] = useState<SelectedGame | null>( null );

    const [ formData, setFormData ] = useState( {
        title: "",
        description: "",
        visibility: "public"
    } );

    const video = useFileInput( MAX_VIDEO_SIZE, MAX_DURATION, MAX_UPLOAD_DURATION );
    const thumbnail = useFileInput( MAX_THUMBNAIL_SIZE );

    useEffect( () => {
        console.log( "selectedGame updated:", selectedGame );
    }, [ selectedGame ] );

    useEffect( () => {
        if ( video.duration !== null ) {
            setVideoDuration( video.duration );
        }
    }, [ video.duration ] )

    useEffect( () => {
        // useEffects cannot be async, so this is how you get around that.
        const checkForRecordedVideo = async () => {
            try {
                const stored = sessionStorage.getItem( "recordedVideo" );
                if ( !stored ) return;

                const { url, name, type, duration } = JSON.parse( stored );
                // Turn the json into video data.
                const blob = await fetch( url ).then( ( res ) => res.blob() );
                // Creates a browser file to be uploaded.
                const file = new File( [ blob ], name, { type, lastModified: Date.now() } )

                if ( video.inputRef.current ) {
                    // Create a new instance of data transfer and add file into it (this is done browser side
                    // normally for drag and drop cases but since im injecting it this is how its needed)
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add( file );
                    video.inputRef.current.files = dataTransfer.files;

                    // Simulate a user triggering file input change.
                    const event = new Event( "change", { bubbles: true } );
                    video.inputRef.current.dispatchEvent( event );

                    // Call fileHandler manually and pretend a user selected the file.
                    video.handleFileChange( {
                        target: { files: dataTransfer.files }
                    } as ChangeEvent<HTMLInputElement> )

                    if ( duration ) setVideoDuration( video.duration );
                    sessionStorage.removeItem( "recordedVideo" );
                    URL.revokeObjectURL( url );
                }
            } catch ( e ) {
                console.error( e, "Error loading recorded video" )
            }
        }

        checkForRecordedVideo();
    }, [ video ] );

    const handleInputChange = ( e: ChangeEvent<HTMLInputElement> ) => {
        // Name is name of input we are modifying, value will come from onChange, this allows a dynamic formField update.
        const { name, value } = e.target;
        setFormData( ( prevState ) => ({ ...prevState, [name]: value }) );
    }

    // Simulates a user clicking the upload selecting however with a randomised frame.
    const handlePopulateFrame = async ( file?: File ) => {
        if ( !video.file || !thumbnail.inputRef.current ) return;

        // If there was a file sent in, use it, otherwise the randomise button has been clicked.
        const thumbnailFile = !file ? await generateRandomThumbnail( video.file ) : file;

        if ( !thumbnailFile ) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add( thumbnailFile );

        thumbnail.inputRef.current.files = dataTransfer.files;

        const event = new Event( "change", { bubbles: true } );
        thumbnail.inputRef.current.dispatchEvent( event );
    };

    const handlePopulateVideo = ( file: File ) => {
        if ( video.inputRef.current ) {
            // Create a new instance of data transfer and add file into it (this is done browser side
            // normally for drag and drop cases but since im injecting it this is how its needed)
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add( file );
            video.inputRef.current.files = dataTransfer.files;

            // Simulate a user triggering file input change.
            const event = new Event( "change", { bubbles: true } );
            video.inputRef.current.dispatchEvent( event );

            // Call fileHandler manually and pretend a user selected the file.
            video.handleFileChange( {
                target: { files: dataTransfer.files }
            } as ChangeEvent<HTMLInputElement> )

            setVideoDuration( video.duration );
        }
    };

    const handleSubmit = async ( e: FormEvent ) => {
        // Dont want page to reload.
        e.preventDefault()
        setIsSubmitting( true )
        try {
            if ( !video.file || !thumbnail.file ) {
                setError( "Please upload a video and thumbnail" )
                return;
            }
            if ( !formData.title || !formData.description ) {
                setError( "Please fill in all the details" )
                return;
            }

            // Get upload url
            const {
                videoId,
                uploadUrl: videoUploadUrl,
                accessKey: videoAccessKey
            } = await getVideoUploadUrl();
            if ( !videoUploadUrl || !videoAccessKey ) {
                console.error( "Failed to get video upload credentials" );
                throw new Error( "Failed to get video upload credentials" );
            }

            // Upload video to video streaming and storage platform
            await uploadFileToBunny( video.file, videoUploadUrl, videoAccessKey, ( percent ) => {
                // Counts as 0–85% of total progress.
                setUploadProgress( Math.round( percent * 0.85 ) );
            } );

            // ensure thumbnail has an extension - needed for open graph preview links
            const extension = thumbnail.file.type.split( "/" )[1] || "jpg";

            // Upload the thumbnail to DB
            const {
                cdnUrl: thumbnailCdnUrl,
                uploadUrl: thumbnailUploadUrl,
                accessKey: thumbnailAccessKey
            } = await getThumbnailUploadUrl( videoId, extension );
            if ( !thumbnailUploadUrl || !thumbnailAccessKey || !thumbnailCdnUrl ) {
                console.error( "Failed to get thumbnail upload credentials" );
                throw new Error( "Failed to get video thumbnail upload credentials" );
            }

            // Upload thumbnail too
            await uploadFileToBunny( thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey, ( percent ) => {
                // Counts as 85–100% of total progress.
                setUploadProgress( 85 + Math.round( percent * 0.15 ) );
            } );

            // Create metadata and store in database
            console.log( "upload page:", selectedGame?.name, selectedGame?.slug, selectedGame?.imageUrl );
            await saveVideoDetails( {
                videoId,
                thumbnailUrl: thumbnailCdnUrl,
                ...formData,
                duration: videoDuration,
                game: selectedGame?.name ?? null,
                gameSlug: selectedGame?.slug ?? null,
                gameImageUrl: selectedGame?.imageUrl ?? null,
            } );

            // Go to homepage after upload.
            router.push( "/" )

        } catch ( error ) {
            console.log( "Error submitting form: ", error );

        } finally {
            setIsSubmitting( false );
            // Reset progress bar!
            setUploadProgress( 0 );
        }
    }

    return (
        <div className="wrapper-md upload-page">
            <ClearNavigationCursor/>
            <h1>Upload a clip ⋆｡‧˚ʚ🎥ɞ˚‧｡⋆</h1>

            { error && <div className="error-field">{ error }</div> }
            { video.error && <div className="error-field">{ video.error }</div> }
            { thumbnail.error && <div className="error-field">{ thumbnail.error }</div> }
            { video.trimWarning && <div className="warning-field">{ video.trimWarning }</div> }

            <form className="rounded-20 shadow-10 dark:shadow-40 gap-6 w-full flex flex-col px-5 py-7.5"
                  onSubmit={ handleSubmit }>
                <FormField
                    id="title"
                    label="Title"
                    value={ formData.title }
                    onChange={ handleInputChange }
                    placeholder="Enter your mp4 title!"
                />

                <FormField
                    id="description"
                    label="Description"
                    value={ formData.description }
                    onChange={ handleInputChange }
                    as="textarea"
                    placeholder="Describe what this clip is about"
                />

                <GameSearchInput
                    value={ selectedGame }
                    onChange={ setSelectedGame }
                />

                <FileInput
                    id="video"
                    label="Video"
                    accept="video/*"
                    file={ video.file }
                    previewUrl={ video.previewUrl }
                    inputRef={ video.inputRef }
                    onChange={ video.handleFileChange }
                    onReset={ video.resetFile }
                    type="video"
                />

                <div className="form-button">
                    <button
                        // Without this the form uploads because browser treats unspecified buttons
                        // inside forms as a submit button.
                        type="button"
                        disabled={ !video.file }
                        onClick={ () => setShowVideoSelect( true ) }
                    >
                        <Image src="/assets/icons/scissors.svg" alt="dice" height={ 25 } width={ 25 }/>
                        Trim clip!
                    </button>
                </div>

                <FileInput
                    id="thumbnail"
                    label="Thumbnail"
                    accept="image/*"
                    file={ thumbnail.file }
                    previewUrl={ thumbnail.previewUrl }
                    inputRef={ thumbnail.inputRef }
                    onChange={ thumbnail.handleFileChange }
                    onReset={ thumbnail.resetFile }
                    type="image"
                />

                <div className="form-button">
                    <button
                        // Without this the form uploads because browser treats unspecified buttons
                        // inside forms as a submit button.
                        type="button"
                        disabled={ !video.file }
                        onClick={ () => setShowFrameSelect( true ) }
                    >
                        <Image src="/assets/icons/polaroid.svg" alt="dice" height={ 35 } width={ 35 }/>
                        Select Frame
                    </button>
                    <button
                        type="button"
                        disabled={ !video.file }
                        onClick={ () => handlePopulateFrame() }
                    >
                        <Image src="/assets/icons/dice.svg" alt="dice" height={ 35 } width={ 35 }/>
                        Randomise
                    </button>
                </div>

                <FormField
                    id="visibility"
                    label="Visibility"
                    value={ formData.visibility }
                    onChange={ handleInputChange }
                    as="select"
                    options={ [
                        { value: "public", label: "Public" },
                        { value: "private", label: "Private" }
                    ] }
                />

                <div
                    role="alert"
                    className="flex rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-150 dark:text-blue-200"
                >
                    <Image src="/assets/icons/info.svg" width={ 20 } height={ 20 } alt="hi" className="filter-dark"/>
                    <span
                        className="ml-3">If you upload anything mean i will remove it :)</span>
                </div>

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        !video.file ||
                        video.duration > MAX_UPLOAD_DURATION ||
                        !thumbnail.file ||
                        !formData.title.trim() ||
                        !formData.description.trim() ||
                        !!video.error ||
                        !!thumbnail.error }
                    title={ video.duration > MAX_UPLOAD_DURATION ? "Clip must be under a min <3 trim it!" : "" }
                    className="submit-button">
                    { isSubmitting ? `Uploading... ${ uploadProgress }%` : "Upload clip ♡" }
                </button>
            </form>

            { showVideoSelect && (
                <VideoTrimModal
                    file={ video.file! }
                    onClose={ () => setShowVideoSelect( false ) }
                    onTrimComplete={ ( trimmedFile ) => handlePopulateVideo( trimmedFile ) }
                />
            ) }

            { showFrameSelect && (
                <SelectFrameModal
                    file={ video.file! }
                    onClose={ () => setShowFrameSelect( false ) }
                    onFrameSelection={ ( frameBlob ) => {
                        const file = new File( [ frameBlob ], "selected_thumbnail.jpg", { type: "image/jpeg" } );
                        handlePopulateFrame( file );
                    } }
                />
            ) }
        </div>
    )
}
export default Page
