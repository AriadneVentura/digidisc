import React from 'react'
import {
    generateClipImage,
    getSuggestedVideos,
    getVideoById,
    getVideoTags,
    hasUserLikedClip,
    incrementViewCount,
} from "@/lib/actions/video";
import { db } from "@/src";
import { videoTags } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoInfo from "@/components/VideoInfo";
import SuggestedVideos from "@/components/SuggestedVideos";
import { Metadata } from "next";
import ClearNavigationCursor from "@/components/ClearNavigationCursor";
import GirlMargin from "@/components/GirlMargin";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// search params = url?page=2&filter=asc
// params = url/:id (so we want params)
export async function generateMetadata( { params }: Params ): Promise<Metadata> {
    const { videoId } = await params;
    const result = await generateClipImage( videoId );

    if ( !result ) return { title: "DigiDisc" };

    return {
        title: result.author,
        description: result.title,
        openGraph: {
            title: result.author,
            description: result.title,
            url: `https://digidisc.tv/video/${ videoId }`,
            siteName: "DigiDisc",
            images: [ { url: result.thumbnail, width: 1200, height: 630 } ],
            locale: "en_AU",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: result.author,
            description: result.title,
            images: [ result.thumbnail ],
        },
    };
}

const Page = async ( { params }: Params ) => {
    // videoId bc the page is called [videoId] in the tree
    const { videoId } = await params;

    const [ { user, video }, tags ] = await Promise.all( [
        getVideoById( videoId ),
        getVideoTags( videoId ),
    ] );
    if ( !video ) redirect( "/404" );

    const [ likeData, suggested, tagRows ] = await Promise.all( [
        hasUserLikedClip( video.id ).then( d => d[0] ),
        getSuggestedVideos( video.videoId, video.gameSlug, video.userId, video.id ),
        db.select().from( videoTags ).where( eq( videoTags.videoId, video.id ) ),
        // Note: Sending in videoId here cause comparing by videoId in db. (videoId is bunnyId and Id is db id)
        incrementViewCount( video.videoId ),
    ] );

    return (
        <main className="wrapper page">
            <ClearNavigationCursor/>
            <GirlMargin/>

            <VideoDetailHeader { ...video } userImg={ user?.image } username={ user?.name } ownerId={ video.userId }/>

            <section className="video-details">
                <div className="content">
                    <VideoPlayer videoId={ video.videoId }/>
                </div>

                <VideoInfo
                    videoId={ video.videoId }
                    id={ video.id }
                    description={ video.description }
                    views={ video.views }
                    initialLikes={ video.likes }
                    hasUserLiked={ likeData?.hasLiked }
                    game={ video.game }
                    gameImageUrl={ video.gameImageUrl }
                    gameSlug={ video.gameSlug }
                    tags={ tags }
                />
            </section>

            <SuggestedVideos
                suggested={ suggested }
                hasGameSlug={ !!video.gameSlug }
                hasTags={ tagRows.length > 0 }
                hasOtherUserVideos={ suggested?.some( s => s.reason === "Same Creator" ) ?? false }
            />
        </main>
    );
};

export default Page;
