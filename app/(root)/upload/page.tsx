'use client'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails } from "@/lib/actions/video";
import { useRouter } from "next/navigation";

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

    const video = useFileInput( MAX_VIDEO_SIZE );
    const thumbnail = useFileInput( MAX_THUMBNAIL_SIZE );

    useEffect( () => {
        if ( video.duration !== null ) {
            setVideoDuration( video.duration );
        }
    }, [ video.duration ] )

    const handleInputChange = ( e: ChangeEvent<HTMLInputElement> ) => {
        // Name is name of input we are modifying, value will come from onChange, this allows a dynamic formField update.
        const { name, value } = e.target;
        setFormData( ( prevState ) => ({ ...prevState, [name]: value }) );
    }

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
            }

            // Get upload url
            const {
                videoId,
                uploadUrl: videoUploadUrl,
                accessKey: videoAccessKey
            } = await getVideoUploadUrl();
            if ( !videoUploadUrl || !videoUploadUrl ) {
                console.error( "Failed to get video upload credentials" );
                throw new Error( "Failed to get video upload credentials" );
            }

            // Upload video to video streaming and storage platform
            await uploadFileToBunny( video.file, videoUploadUrl, videoAccessKey );


            // Upload the thumbnail to DB
            const {
                cdnUrl: thumbnailCdnUrl,
                uploadUrl: thumbnailUploadUrl,
                accessKey: thumbnailAccessKey
            } = await getThumbnailUploadUrl( videoId );
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

            router.push( `/video/${ videoId }` )

        } catch ( error ) {
            console.log( "Error submitting form: ", error );

        } finally {
            setIsSubmitting( false );
        }
    }

    return (
        <div className="wrapper-md upload-page">
            <h1>Upload a video</h1>

            { error && <div className="error-field">{ error }</div> }

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

                <button type="submit" disabled={ isSubmitting } className="submit-button">
                    { isSubmitting ? "Uploading..." : "Upload video" }
                </button>

            </form>
        </div>
    )
}
export default Page
