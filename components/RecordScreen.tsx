'use client'
import React, { useRef, useState } from 'react'
import Image from "next/image";
import { ICONS } from "@/constants";
import { useRouter } from "next/navigation";
import { useScreenRecording } from "@/lib/hooks/useScreenRecording";

const RecordScreen = () => {
    const [ isOpen, setIsOpen ] = useState( false );
    const videoRef = useRef<HTMLVideoElement>( null );

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
                // TODO this ist working properly for record...
                duration: recordingDuration || 0,
            } )
        )

        router.push( "/upload" );
        closeModal();
    }

    return (
        <div className="record">
            <button className="primary-btn" onClick={ () => setIsOpen( true ) }>
                <Image src={ ICONS.record } width={ 16 } height={ 16 } alt="record"/>
                <span>Record a vid</span>
            </button>

            { isOpen && (
                <section className="dialog">
                    <div className="overlay-record" onClick={ closeModal }/>
                    <div className="dialog-content">
                        <figure>
                            <h3>Screen Recording</h3>
                            <button onClick={ closeModal }>
                                <Image src={ ICONS.close } alt="close" height={ 20 } width={ 20 }/>
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
                                    <Image src={ ICONS.record } alt="record" width={ 16 } height={ 16 }/>
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
                                        Record Again
                                    </button>
                                    <button onClick={ goToUpload } className="record-upload">
                                        <Image src={ ICONS.upload } alt="upload" width={ 16 } height={ 16 }/>
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
