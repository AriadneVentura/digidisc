// For the click functionality
'use client'

import React, { useState } from 'react'
import Link from "next/link";
import Image from "next/image";

const VideoCard = ( {
                        id,
                        title,
                        thumbnail,
                        userImg,
                        username,
                        createdOn,
                        views,
                        visibility,
                        duration,
                        likes,
                    }: VideoCardProps ) => {
    const [ copied, setCopied ] = useState( false );

    const handleCopy = ( e: React.MouseEvent ) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText( `${ window.location.origin }/video/${ id }` );
        setCopied( true );
        setTimeout( () => {
            setCopied( false );
        }, 3000 );
    };

    return (
        <Link href={ `/video/${ id }` } className={ "video-card" }>
            <Image src={ thumbnail } alt={ thumbnail } width={ 390 } height={ 160 } className="thumbnail"/>
            <article>
                <div>
                    <figure>
                        <Image src={ userImg } alt="avatar" width={ 34 } height={ 34 }
                               className="rounded-full aspect-square"/>
                        <figcaption>
                            <h3>{ username }</h3>
                            <p>{ visibility }</p>
                        </figcaption>
                    </figure>
                    <aside>
                        <Image src="/assets/icons/heart_black.svg" alt="likes" width={ 11 } height={ 11 }/>
                        <span>{ likes }</span>
                        <div/>
                        <Image src="/assets/icons/eye.svg" alt="views" width={ 16 } height={ 16 }/>
                        <span>{ views }</span>
                    </aside>
                </div>

                <h2>{ title } - { createdOn.toLocaleDateString( 'en-us', {
                    year: 'numeric',
                    month: "short",
                    day: "numeric",
                } ) }</h2>
            </article>
            <button onClick={ handleCopy } className="copy-btn">
                <Image
                    src={ copied ? "/assets/images/check.png" : "/assets/icons/chain.svg" }
                    alt="Copy Link"
                    width={ 18 }
                    height={ 18 }
                />
            </button>
            { duration && (
                <div className="duration">
                    { Math.ceil( duration ) } second(s)
                </div>
            ) }
        </Link>
    )
}
export default VideoCard
