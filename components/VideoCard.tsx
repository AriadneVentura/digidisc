// For the click functionality
'use client'

import React, { useState } from 'react'
import Link from "next/link";
import Image from "next/image";
import { useGifs } from "@/components/GifProvider";

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
                        gifUrl,
                    }: VideoCardProps ) => {
    const [ copied, setCopied ] = useState( false );
    const [ isNavigating, setIsNavigating ] = useState( false );
    const { gifsEnabled } = useGifs()

    const handleCopy = ( e: React.MouseEvent ) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText( `${ window.location.origin }/video/${ id }` );
        setCopied( true );
        setTimeout( () => {
            setCopied( false );
        }, 3000 );
    };

    // Bunny's CDN allows image resizing via query params, if the image comes back smaller, digi disc is faster.
    // Also prevents LCP warning for large uploaded images.
    const optimizedThumbnail = `${ thumbnail }?width=640&height=360&quality=80`;

    return (
        <div className={ "video-card" }>
            {/* Prefetch true allows next.js to prefetch on default on hover how cool. */ }
            <Link href={ `/video/${ id }` } onClick={ () => setIsNavigating( true ) }>
                <div className="relative">
                    <Image
                        src={ optimizedThumbnail }
                        alt={ thumbnail }
                        width={ 390 }
                        height={ 160 }
                        className={ `thumbnail transition-all duration-200 ${ isNavigating ? "brightness-50" : "" }` }
                    />
                    { isNavigating && (
                        <div className="absolute inset-0 flex items-center justify-center h-[190px]">
                            <div
                                className="size-8 rounded-full border-2 border-white/30 border-t-pink-300 animate-spin"/>
                        </div>
                    ) }
                </div>
            </Link>
            <article>
                <div>
                    <figure>
                        {/*On the main page, allow people to click user profiles*/ }
                        { ownerId ? (
                            <Link href={ `/profile/${ ownerId }` } prefetch={ true }>
                                <Image src={ userImg } alt="avatar" width={ 34 } height={ 34 }
                                       className="rounded-full aspect-square"/>
                            </Link>
                        ) : (
                            <Image src={ userImg } alt="avatar" width={ 34 } height={ 34 }
                                   className="rounded-full aspect-square"/>
                        ) }
                        <figcaption>
                            <h3>{ username }</h3>
                            <p>{ visibility } ○ { createdOn.toLocaleDateString( 'en-us', {
                                year: 'numeric',
                                month: "short",
                                day: "numeric",
                            } ) } </p>
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

                <div>
                    <h2>{ title }</h2>
                    { gifsEnabled && (
                        <img src={ gifUrl } alt="preview" width={ 20 } height={ 20 }/>
                    ) }
                </div>
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
        </div>
    )
}
export default VideoCard
