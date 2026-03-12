import React from 'react'
import { generateClipImage, getVideoById, hasUserLikedClip, incrementViewCount } from "@/lib/actions/video";
import { redirect } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoInfo from "@/components/VideoInfo";
import { Metadata } from "next";

// search params = url?page=2&filter=asc
// params = url/:id (so we want params)
export async function generateMetadata( { params }: Params ): Promise<Metadata> {
    const { videoId } = await params;

    const result = await generateClipImage( videoId );

    console.log( "metadata result", result );

    if ( !result ) {
        return {
            title: "DigiDisc"
        }
    }

    return {
        title: result.author,
        description: result.title,
        openGraph: {
            title: result.author,
            description: result.title,
            url: `https://digidisc.tv/video/${ videoId }`,
            siteName: "DigiDisc",
            images: [
                {
                    url: result.thumbnail,
                    width: 1200,
                    height: 630,
                },
            ],
            locale: "en_AU",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: result.author,
            description: result.title,
            images: [ result.thumbnail ]
        }
    }
}

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
