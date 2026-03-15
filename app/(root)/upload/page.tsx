'use client'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { MAX_DURATION, MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails } from "@/lib/actions/video";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { generateRandomThumbnail } from "@/lib/utils";

const uploadFileToBunny = (
    file: File,
    uploadUrl: string,
    accessKey: string
): Promise<void> =>
    fetch( uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
            AccessKey: accessKey,
        },
        body: file,
    } ).then( ( response ) => {
        if ( !response.ok )
            throw new Error( `Upload failed with status ${ response.status }` );
    } );


const Page = () => {
    const router = useRouter();
    const [ isSubmitting, setIsSubmitting ] = useState( false );
    const [ error, setError ] = useState( "" );
    const [ videoDuration, setVideoDuration ] = useState( 0 );

    const [ formData, setFormData ] = useState( {
        title: "",
        description: "",
        visibility: "public"
    } );

    const video = useFileInput( MAX_VIDEO_SIZE, MAX_DURATION );
    const thumbnail = useFileInput( MAX_THUMBNAIL_SIZE );

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
    const handleRandomFrame = async () => {
        if ( !video.file || !thumbnail.inputRef.current ) return;

        const thumbnailFile = await generateRandomThumbnail( video.file );

        if ( !thumbnailFile ) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add( thumbnailFile );

        thumbnail.inputRef.current.files = dataTransfer.files;

        const event = new Event( "change", { bubbles: true } );
        thumbnail.inputRef.current.dispatchEvent( event );
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
            await uploadFileToBunny( video.file, videoUploadUrl, videoAccessKey );

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

            await uploadFileToBunny( thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey );

            // Create metadata and store in database
            await saveVideoDetails( {
                videoId,
                thumbnailUrl: thumbnailCdnUrl,
                ...formData,
                duration: videoDuration
            } );

            // Go to homepage after upload.
            router.push( "/" )

        } catch ( error ) {
            console.log( "Error submitting form: ", error );

        } finally {
            setIsSubmitting( false );
        }
    }

    return (
        <div className="wrapper-md upload-page">
            <h1>Upload a clip ⋆｡‧˚ʚ🎥ɞ˚‧｡⋆</h1>

            { error && <div className="error-field">{ error }</div> }
            { video.error && <div className="error-field">{ video.error }</div> }
            { thumbnail.error && <div className="error-field">{ thumbnail.error }</div> }

            <form className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5"
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
                    placeholder="Describe what this vid is about"
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

                <div className="form-thumbnail-button">
                    <button
                        // Without this the form uploads because browser treats unspecified buttons
                        // inside forms as a submit button.
                        type="button"
                        disabled={ !video.file }
                        onClick={ handleRandomFrame }
                    >
                        <Image src="/assets/icons/dice.svg" alt="dice" height={ 35 } width={ 35 }/>
                        Randomise my thumbnail!
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
                        !thumbnail.file ||
                        !formData.title.trim() ||
                        !formData.description.trim() ||
                        !!video.error ||
                        !!thumbnail.error }
                    className="submit-button">
                    { isSubmitting ? "Uploading..." : "Upload clip ♡" }
                </button>

            </form>
        </div>
    )
}
export default Page
