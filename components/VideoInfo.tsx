'use client'
import React, { useState, useTransition } from 'react'
import Image from "next/image";
import { toggleLike } from "@/lib/actions/video";
import { authClient } from "@/lib/auth-client";

const VideoInfo = ( {
                        description,
                        id,
                        views,
                        initialLikes,
                        hasUserLiked,
                        game,
                        gameImageUrl,
                        tags
                    }: VideoInfoProps ) => {
    const [ likes, setLikes ] = useState( initialLikes );
    const [ hasLiked, setHasLiked ] = useState( hasUserLiked );
    const [ isPending, startTransition ] = useTransition();

    // Only enable the liked button if the user is logged in
    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

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
            { game && (
                <div className="game-information">
                    <article className="game-metadata">
                        <div className="game-metadata-info">
                            <h2>Game</h2>
                            <p>{ game }</p>
                        </div>

                        { gameImageUrl && (
                            <Image
                                src={ gameImageUrl }
                                alt={ game }
                                width={ 120 }
                                height={ 80 }
                                className="game-metadata-image"
                            />
                        ) }
                    </article>
                </div>
            ) }

            <div className="clip-information">
                <aside>
                    <div className="info-metadata">
                        <article>
                            <h2>Description</h2>
                            <p>{ description }</p>
                        </article>
                        { tags.length > 0 && (
                            <article>
                                <h2>Tags</h2>
                                <div className="video-tags-wrapper shrink-0">
                                    { tags.map( ( tag ) => (
                                        <span key={ tag } className="tag-pill">
                                            <span className="tag-hash">#</span>
                                            <span className="tag-label">{ tag }</span>
                                        </span>
                                    ) ) }
                                </div>
                            </article>
                        ) }
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
                                    <Image src="/assets/icons/heart_filled.svg" alt="liked" width={ 16 } height={ 16 }/>
                                ) : (
                                    <Image src="/assets/icons/heart.svg" alt="like" className="filter-dark" width={ 16 }
                                           height={ 16 }/>
                                ) }
                                <span>{ likes }</span>
                            </button>
                        </div>
                    </aside>
                </aside>
            </div>
        </section>
    );
};

export default VideoInfo
