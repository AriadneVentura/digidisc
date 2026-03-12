'use client'
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { daysAgo } from "@/lib/utils";
import { ICONS, visibilities } from "@/constants";
import { updateVideoVisibility } from "@/lib/actions/video";
import { authClient } from "@/lib/auth-client";
import DropdownList from "@/components/DropdownList";

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
    const [ isDeleting, setIsDeleting ] = useState( false );
    const [ isOpen, setIsOpen ] = useState( false );
    const [ visibilityState, setVisibilityState ] = useState<Visibility>(
        visibility as Visibility
    );
    const [ isUpdating, setIsUpdating ] = useState( false );
    const { data: session } = authClient.useSession();
    const userId = session?.user.id;
    const isOwner = userId === ownerId;


    const handleCopyLink = async () => {
        await navigator.clipboard.writeText( `${ window.location.origin }/video/${ videoId }` );
        setCopied( true );
    }

    const handleDeleteVideo = async () => {
        try {
            console.log( id, videoId, thumbnailUrl )
            // setIsDeleting( true );
            // await deleteVideoById( id, videoId, thumbnailUrl );
            // // rewrite in case overlap
            // await navigator.clipboard.writeText( "" );
            // router.push( "/" );
            // setIsOpen( false );
        } catch ( error ) {
            console.error( "Error deleting video:", error );
        } finally {
            setIsDeleting( false );
        }
    }

    useEffect( () => {
        const changeChecked = setTimeout( () => {
            if ( copied ) setCopied( false );
        }, 2000 )

        return () => clearTimeout( changeChecked );
    }, [ copied ] )

    const handleVisibilityChange = async ( option: string ) => {
        if ( option !== visibilityState ) {
            setIsUpdating( true );
            try {
                await updateVideoVisibility( videoId, option as Visibility );
                setVisibilityState( option as Visibility );
            } catch ( error ) {
                console.error( "Error updating visibility:", error );
            } finally {
                setIsUpdating( false );
            }
        }
    };

    const TriggerVisibility = (
        <div className="visibility-trigger">
            <div>
                { visibility === "public" ? (
                        <Image
                            src="/assets/icons/unlock.svg"
                            alt="Views"
                            width={ 16 }
                            height={ 16 }
                            className="mr-2"
                        />
                    ) :
                    (
                        <Image
                            src="/assets/icons/lock.svg"
                            alt="Views"
                            width={ 16 }
                            height={ 16 }
                            className="mr-2"
                        />
                    )
                }
                <p>{ visibilityState }</p>
            </div>
            <Image
                src="/assets/icons/arrow-down.svg"
                alt="Arrow Down"
                width={ 16 }
                height={ 16 }
            />
        </div>
    );

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
                    <Image src={ copied ? "/assets/images/check.png" : "/assets/icons/chain.svg" } alt="copy link"
                           width={ 24 } height={ 24 }/>
                </button>

                { isOwner && (
                    <div className="user-btn">
                        <button
                            className="delete-btn"
                            onClick={ () => setIsOpen( true ) }
                            disabled={ isDeleting }
                        >
                            Delete Clip
                        </button>
                        <div className="bar"/>
                        { isUpdating ? (
                            <div className="update-stats">
                                <p>Updating...</p>
                            </div>
                        ) : (
                            <DropdownList
                                options={ visibilities }
                                selectedOption={ visibilityState }
                                onOptionSelect={ handleVisibilityChange }
                                triggerElement={ TriggerVisibility }
                            />
                        ) }
                    </div>
                ) }
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
                                { !isDeleting ? "Mhmm" : "Deleting..." }
                            </button>
                        </div>
                    </section>
                </div>
            ) }
        </header>
    )
}
export default VideoDetailHeader
