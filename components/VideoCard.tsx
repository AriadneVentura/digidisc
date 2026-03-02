// For the click functionality
'use client'

import React from 'react'
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
                        duration
                    }: VideoCardProps ) => {
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
            <button className="copy-btn" onClick={ () => {
            } }>
                <Image src="/assets/icons/link.svg" height={ 18 } width={ 18 } alt="copy"/>
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
