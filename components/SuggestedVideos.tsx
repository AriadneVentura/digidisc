"use client";

import React, { useState } from "react";
import Image from "next/image";
import VideoCard from "@/components/VideoCard";
import SuggestedPlaceholder from "@/components/SuggestedPlaceholder";
import { getRandomGifs } from "@/lib/utils";
import { getSuggestedVideos } from "@/lib/actions/video";

const SuggestedVideosAccordion = ( { children }: { children: React.ReactNode } ) => {
    const [ open, setOpen ] = useState( true );

    return (
        <div className="suggested-videos">
            <button
                onClick={ () => setOpen( prev => !prev ) }
                className="suggested-toggle"
                aria-expanded={ open }
            >
                <span>Suggested Clips</span>
                <Image src="/assets/icons/arrow-down.svg" alt="arrow-down"
                       className={ `filter-dark transition-transform duration-200 ${ open ? "rotate-0" : "rotate-180" }` }
                       width={ 20 }
                       height={ 20 }/>
            </button>

            { open && (
                <div className="suggested-grid">
                    { children }
                </div>
            ) }
        </div>
    );
};

interface SuggestedVideosProps {
    suggested: Awaited<ReturnType<typeof getSuggestedVideos>>;
    hasGameSlug: boolean;
    hasTags: boolean;
    hasOtherUserVideos: boolean;
}

const SuggestedVideos = ( { suggested, hasGameSlug, hasTags, hasOtherUserVideos }: SuggestedVideosProps ) => {
    const randomGifs = getRandomGifs( suggested?.length ?? 0 );

    // Map reason label to video record, to look it up
    const byReason = Object.fromEntries(
        (suggested ?? []).map( ( suggested_video, index ) => [ suggested_video.reason, {
            ...suggested_video,
            gifIndex: index
        } ] )
    );

    const slots = [
        {
            reason: "Same Creator",
            emptyMessage: "This creator doesn't have any other clips... yet!",
        },
        {
            reason: "Dice Roll",
            emptyMessage: null,
        },
        {
            reason: "Same Game",
            emptyMessage: hasGameSlug
                ? "No other clips from this game yet"
                : "This clip was posted prior to game categories :O",
        },
        {
            reason: "Similar Tag",
            emptyMessage: hasTags
                ? "No clips with similar tags"
                : "This clip has no tags attached :O",
        },
    ];

    return (
        <SuggestedVideosAccordion>
            { slots.map( ( { reason, emptyMessage } ) => {
                const match = byReason[reason];

                if ( match ) {
                    const { video, user, gifIndex } = match;
                    return (
                        <div key={ reason } className="suggested-item">
                            <span className="suggested-reason">{ reason }</span>
                            <VideoCard
                                id={ video.id }
                                title={ video.title }
                                thumbnail={ video.thumbnailUrl }
                                userImg={ user?.image ?? "/assets/icons/default-avatar.svg" }
                                username={ user?.name ?? "Unknown" }
                                createdOn={ new Date( video.createdAt ) }
                                views={ video.views }
                                visibility={ video.visibility }
                                duration={ video.duration }
                                likes={ video.likes }
                                ownerId={ user?.id }
                                gifUrl={ randomGifs[gifIndex] }
                            />
                        </div>
                    );
                }

                // Empty slot — show placeholder unless emptyMessage is null
                if ( emptyMessage === null ) return null;

                return (
                    <div key={ reason } className="suggested-item">
                        <span className="suggested-reason">{ reason }</span>
                        <SuggestedPlaceholder message={ emptyMessage }/>
                    </div>
                );
            } ) }
        </SuggestedVideosAccordion>
    );
};

export default SuggestedVideos;
