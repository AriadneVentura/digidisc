// For the click functionality
'use client'

import React, { useState } from 'react'
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
                        ownerId,
                    }: VideoCardProps ) => {
    const [ copied, setCopied ] = useState( false );
    const router = useRouter();

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
                        {/*On the main page, allow people to click user profiles*/ }
                        { ownerId ? (
                            <button onClick={ () => router.push( `/profile/${ ownerId }` ) }>
                                <Image src={ userImg } alt="avatar" width={ 34 } height={ 34 }
                                       className="rounded-full aspect-square"/>
                            </button>
                        ) : (
                            <Image src={ userImg } alt="avatar" width={ 34 } height={ 34 }
                                   className="rounded-full aspect-square"/>
                        ) }
                        <figcaption>
                            <h3>{ username }</h3>
                            <p>{ visibility }</p>
                        </figcaption>
                    </figure>
                    <aside>
                        <Image src="/assets/icons/heart_black.svg" className="filter-dark" alt="likes" width={ 11 }
                               height={ 11 }/>
                        <span>{ likes }</span>
                        <div/>
                        <Image src="/assets/icons/eye.svg" className="filter-dark" alt="views" width={ 16 }
                               height={ 16 }/>
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
                { copied ? (
                    <Image
                        src="/assets/images/check.png"
                        alt="Copy Link"
                        width={ 18 }
                        height={ 18 }
                    />
                ) : (
                    <Image
                        src="/assets/icons/chain.svg"
                        alt="Copy Link"
                        width={ 18 }
                        height={ 18 }
                        className="filter-dark"
                    />
                ) }
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
