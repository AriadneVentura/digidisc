'use client'
import React, { useState } from 'react'
import { cn } from "@/lib/utils";
import Image from "next/image";

const VideoInfo = ( {
                        createdAt,
                        description,
                        videoId,
                        title,
                        videoUrl,
                        views
                    }: VideoInfoProps ) => {
    const [ isLiking, setIsLiking ] = useState( false );
    const hasLiked = false;

    const metaDatas = [
        {
            label: "Video description",
            value: description,
        },
    ];

    const handleLike = () => {
        setIsLiking( !isLiking );
    }

    return (
        <section className="video-information">
            <aside>
                <div className="metadata">
                    { metaDatas.map( ( { label, value }, index ) => (
                        <article key={ index }>
                            <h2>{ label }</h2>
                            <p
                                className={ cn( {
                                    "text-pink-100 truncate": label === "Video url",
                                } ) }
                            >
                                { value }
                            </p>
                        </article>
                    ) ) }
                </div>
                <aside>
                    <div className="side-details">
                        <Image src="/assets/icons/eye.svg" alt="views" width={ 16 } height={ 16 }/>
                        <span>{ views }</span>
                    </div>
                    <div className="side-details">
                        <button onClick={ handleLike }>
                            {/*ik you can dynamically change the source, but two images cause alt tags for behaviour*/ }
                            { hasLiked ? (
                                <Image src="/assets/icons/heart_filled.svg" alt="liked" width={ 16 } height={ 16 }/>
                            ) : (
                                <Image src="/assets/icons/heart.svg" alt="like" width={ 16 } height={ 16 }/>
                            ) }
                            <span>1</span>
                        </button>
                    </div>
                </aside>
            </aside>
        </section>
    );
};

export default VideoInfo
