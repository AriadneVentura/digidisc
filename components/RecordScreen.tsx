'use client'
import React, { useRef, useState } from 'react'
import Image from "next/image";
import { ICONS } from "@/constants";
import { redirect, useRouter } from "next/navigation";
import { useScreenRecording } from "@/lib/hooks/useScreenRecording";
import { authClient } from "@/lib/auth-client";
import { useGifs } from "@/components/GifProvider";

const RecordScreen = () => {
    const [ isOpen, setIsOpen ] = useState( false );
    const videoRef = useRef<HTMLVideoElement>( null );
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const router = useRouter();
    const {
        isRecording,
        recordedBlob,
        recordedVideoUrl,
        recordingDuration,
        startRecording,
        stopRecording,
        resetRecording
    } = useScreenRecording();

    const closeModal = () => {
        resetRecording();
        setIsOpen( false );
    }

    const handleStart = async () => {
        await startRecording();
    }

    const handleStop = () => {
        stopRecording();
    }

    const recordAgain = async () => {
        resetRecording();
        await startRecording();

        // Attach the video url to the video to record over it.
        if ( recordedVideoUrl && videoRef.current ) {
            videoRef.current.src = recordedVideoUrl;
        }
    }

    // navigate to upload form
    const goToUpload = () => {
        // Nothing to upload
        if ( !recordedBlob ) return;

        const url = URL.createObjectURL( recordedBlob );

        // store the current video
        sessionStorage.setItem( "recordedVideo",
            JSON.stringify( {
                url,
                name: "screen-recording.webm",
                type: recordedBlob.type,
                size: recordedBlob.size,
                duration: recordingDuration || 0,
            } )
        )

        router.push( "/upload" );
        closeModal();
    }

    const handleRecordClick = () => {
        if ( user ) {
            setIsOpen( true );
        } else {
            redirect( "/sign-in" )
        }
    }

    const { gifsEnabled } = useGifs();

    return (
        <div className="record">
            <button className="primary-btn" onClick={ handleRecordClick }>
                { gifsEnabled ? (
                    <img src="/assets/gifs/ds_pink.gif" alt="preview" width={ 20 } height={ 20 }/>
                ) : (
                    <Image src={ ICONS.record } width={ 16 } height={ 16 } alt="record" className="filter-dark"/>
                ) }
                <span>Record a vid</span>
            </button>

            { isOpen && (
                <section className="dialog">
                    <div className="overlay-record" onClick={ closeModal }/>
                    <div className="dialog-content">
                        <figure>
                            <h3>Screen Recording</h3>
                            <button onClick={ closeModal }>
                                <Image src={ ICONS.close } alt="close" className="filter-dark" height={ 20 }
                                       width={ 20 }/>
                            </button>
                        </figure>

                        <section>
                            { isRecording ? (
                                <article>
                                    <div/>
                                    <span>Recording in progress</span>
                                </article>
                            ) : recordedVideoUrl ? (
                                <video ref={ videoRef } src={ recordedVideoUrl } controls/>
                            ) : (
                                <div>
                                    <p className="mb-10">Click record to start capturing your screen ♡</p>
                                    <p className="font-bold text-center text-xs">WARNING!</p>
                                    <p className="font-light text-xs">Discord audio won't be captured unless it's hosted
                                        in your browser</p>
                                </div>
                            ) }
                        </section>

                        <div className="record-box">
                            { !isRecording && !recordedVideoUrl && (
                                <button onClick={ handleStart } className="record-start">
                                    <Image src={ ICONS.record } alt="record" className="filter-dark" width={ 16 }
                                           height={ 16 }/>
                                    Record
                                </button>
                            ) }
                            { isRecording && (
                                <button onClick={ handleStop } className="record-stop">
                                    <Image src={ ICONS.record } alt="record" width={ 16 } height={ 16 }/>
                                    Stop Recording
                                </button>
                            ) }
                            { recordedVideoUrl && (
                                <>
                                    <button onClick={ recordAgain } className="record-again">
                                        Record again
                                    </button>
                                    <button onClick={ goToUpload } className="record-upload">
                                        <Image src={ ICONS.upload }
                                               alt="upload"
                                               width={ 16 }
                                               height={ 16 }
                                               className="filter-dark"
                                        />
                                        Continue to upload
                                    </button>
                                </>
                            ) }
                        </div>
                    </div>
                </section>
            ) }
        </div>
    )
}
export default RecordScreen
