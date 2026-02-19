'use client'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import FormField from "@/components/FormField";
import FileInput from "@/components/FileInput";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";

const Page = () => {
    const [ error, setError ] = useState( "" );
    const [ formData, setFormData ] = useState( {
        title: "",
        description: "",
        visibility: "public"
    } );
    const [ isSubmitting, setIsSubmitting ] = useState( false );


    const handleInputChange = ( e: ChangeEvent<HTMLInputElement> ) => {
        // Name is name of input we are modifying, value will come from onChange, this allows a dynamic formField update.
        const { name, value } = e.target;
        setFormData( ( prevState ) => ({ ...prevState, [name]: value }) );
    }

    const video = useFileInput( MAX_VIDEO_SIZE );
    const thumbnail = useFileInput( MAX_THUMBNAIL_SIZE );

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

            // TBD
            // Upload video to video streaming and storage platform
            // Upload the thumbnail to DB
            // After image is hosted, attach thumbnail to video
            // Create metadata and store in database

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
                    // All video types are accepted for upload
                    accept="video/*"
                    file={ video.file }
                    previewUrl={ video.previewUrl }
                    inputRef={ video.inputRef }
                    onChange={ video.handeFileChange }
                    onReset={ video.resetFile }
                    type="video"
                />

                <FileInput
                    id="thumbnail"
                    label="Thumbnail"
                    // All video types are accepted for upload
                    accept="image/*"
                    file={ thumbnail.file }
                    previewUrl={ thumbnail.previewUrl }
                    inputRef={ thumbnail.inputRef }
                    onChange={ thumbnail.handeFileChange }
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
