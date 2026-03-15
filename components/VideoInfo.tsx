'use client'
import React, { useState, useTransition } from 'react'
import Image from "next/image";
import { toggleLike } from "@/lib/actions/video";
import { authClient } from "@/lib/auth-client";

const VideoInfo = ( {
                        description,
                        videoId,
                        id,
                        views,
                        initialLikes,
                        hasUserLiked,
                    }: VideoInfoProps ) => {
    const [ likes, setLikes ] = useState( initialLikes );
    const [ hasLiked, setHasLiked ] = useState( hasUserLiked );
    const [ isPending, startTransition ] = useTransition();

    // Only enable the liked button if the user is logged in
    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

    const metaData = [
        {
            label: "Video description",
            value: description,
        },
    ];

    const handleLike = () => {
        startTransition( async () => {
            try {
                await toggleLike( id );

                // Optimistic update so the server can run in the background but the UI updates instantly.
                if ( hasLiked ) {
                    setLikes( ( prev ) => prev - 1 );
                } else {
                    setLikes( ( prev ) => prev + 1 );
                }

                setHasLiked( ( prev ) => !prev );
            } catch ( err ) {
                console.error( err );
                setHasLiked( false );
            }
        } );
    };


    return (
        <section className="video-information">
            <aside>
                <div className="metadata">
                    { metaData.map( ( { label, value }, index ) => (
                        <article key={ index }>
                            <h2>{ label }</h2>
                            <p>{ value }</p>
                        </article>
                    ) ) }
                </div>
                <aside>
                    <div className="side-details">
                        <Image src="/assets/icons/eye.svg" alt="views" className="filter-dark" width={ 16 }
                               height={ 16 }/>
                        <span>{ views }</span>
                    </div>
                    <div className="side-details">
                        <button onClick={ handleLike } disabled={ isPending || !userId }>
                            {/*ik you can dynamically change the source, but two images cause alt tags for behaviour*/ }
                            { hasLiked ? (
                                <Image src="/assets/icons/heart_filled.svg" alt="liked"
                                       width={ 16 } height={ 16 }/>
                            ) : (
                                <Image src="/assets/icons/heart.svg" alt="like" className="filter-dark" width={ 16 }
                                       height={ 16 }/>
                            ) }
                            <span>{ likes }</span>
                        </button>
                    </div>
                </aside>
            </aside>
        </section>
    );
};

export default VideoInfo
