import React from 'react'
import { getVideoById, hasUserLikedClip, incrementViewCount } from "@/lib/actions/video";
import { redirect } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoInfo from "@/components/VideoInfo";

// search params = url?page=2&filter=asc
// params = url/:id (so we want params)

const Page = async ( { params }: Params ) => {
    // videoId bc the page is called [videoId] in the tree
    const { videoId } = await params;

    const { user, video } = await getVideoById( videoId );

    if ( !video ) redirect( "/404" );

    // Note: Sending in videoId here cause comparing by videoId in db. (videoId is bunnyId and Id is db id)
    await incrementViewCount( video.videoId );

    const [ data ] = await hasUserLikedClip( video.id );

    return (
        <main className="wrapper page">
            <VideoDetailHeader { ...video } userImg={ user?.image } username={ user?.name } ownerId={ video.userId }/>

            <section className="video-details">
                <div className="content">
                    {/*Note video.id is the id stored in the database, but we want the video id stored in bunny*/ }
                    <VideoPlayer videoId={ video.videoId }/>
                </div>

                <VideoInfo
                    videoId={ video.videoId }
                    id={ video.id }
                    description={ video.description }
                    views={ video.views }
                    initialLikes={ video.likes }
                    hasUserLiked={ data.hasLiked }
                />
            </section>
        </main>
    )
}
export default Page
