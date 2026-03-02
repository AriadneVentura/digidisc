'use client'
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { daysAgo } from "@/lib/utils";
import { ICONS } from "@/constants";
import { deleteVideoById } from "@/lib/actions/video";

const VideoDetailHeader = ( {
                                title,
                                createdAt,
                                userImg,
                                username,
                                videoId,
                                ownerId,
                                id,
                                visibility,
                                thumbnailUrl
                            }: VideoDetailHeaderProps ) => {
    const router = useRouter();
    const [ copied, setCopied ] = useState( false );
    const [ isOpen, setIsOpen ] = useState( false );


    const handleCopyLink = async () => {
        await navigator.clipboard.writeText( `${ window.location.origin }/video/${ videoId }` );
        setCopied( true );
    }

    const handleDeleteVideo = async () => {
        await deleteVideoById( id );
        setIsOpen( false );
        // rewrite in case overlap
        await navigator.clipboard.writeText( "" );
        router.push( "/" );
    }

    useEffect( () => {
        const changeChecked = setTimeout( () => {
            if ( copied ) setCopied( false );
        }, 2000 )

        return () => clearTimeout( changeChecked );
    }, [ copied ] )

    return (
        <header className="detail-header">
            <aside className="user-info">
                <h1>{ title }</h1>
                <figure>
                    <button onClick={ () => router.push( `/profile/${ ownerId }` ) }>
                        <Image src={ userImg || "" } alt="user" width={ 24 } height={ 24 } className="rounded-full"/>
                        <h2>{ username ?? "Guest" }</h2>
                    </button>
                    <figcaption>
                        <span>»</span>
                        <p>{ daysAgo( createdAt ) }</p>
                    </figcaption>
                </figure>
            </aside>

            <aside className="cta">
                <button onClick={ handleCopyLink }>
                    <Image src={ copied ? "/assets/images/check.png" : "/assets/icons/link.svg" } alt="copy link"
                           width={ 24 } height={ 24 }/>
                </button>

                <button className="primary-btn" onClick={ () => setIsOpen( true ) }>
                    <span>Delete Clip</span>
                </button>

            </aside>

            { isOpen && (
                <div className="record">
                    <section className="dialog">
                        <div className="overlay-record" onClick={ () => setIsOpen( false ) }/>
                        <div className="dialog-content">
                            <figure>
                                <h3>You super sure?</h3>
                                <button onClick={ () => setIsOpen( false ) }>
                                    <Image src={ ICONS.close } alt="close" height={ 20 } width={ 20 }/>
                                </button>
                            </figure>
                            <button onClick={ handleDeleteVideo } className="primary-btn">
                                Yes almighty power, im sure, delete this
                            </button>
                        </div>
                    </section>
                </div>
            ) }
        </header>
    )
}
export default VideoDetailHeader
