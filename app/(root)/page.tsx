import React from 'react'
import Header from "@/components/Header";
import { getAllVideos } from "@/lib/actions/video";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";

const Page = async ( { searchParams }: SearchParams ) => {
    const { query, filter, page } = await searchParams;
    const { videos, pagination } = await getAllVideos( query, filter, Number( page ) || 1 );

    return (
        // This applies a max-width to the entire window & column to allow top to bottom layout.
        <main className="wrapper page">
            <Header title={ "All clips ˚♪ ♡ 𝄞˚" } subHeader="Public Library"/>

            { videos?.length > 0 ? (
                <section className="video-grid">
                    { videos.map( ( { video, user } ) => (
                        <VideoCard
                            createdOn={ video.createdAt }
                            thumbnail={ video.thumbnailUrl }
                            key={ video.id }
                            { ...video }
                            userImg={ user?.image || "" }
                            username={ user?.name || "Guest" }/>
                    ) ) }

                </section>
            ) : <EmptyState icon="/assets/icons/video.svg" title="Empty Disc"
                            description="Adjust your search Diva"/>
            }
        </main>
    )
}

export default Page