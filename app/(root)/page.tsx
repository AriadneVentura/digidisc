import React from 'react'
import Header from "@/components/Header";
import { getAllVideos } from "@/lib/actions/video";
import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";
import Pagination from "@/components/Pagination";
import { getRandomGifs } from "@/lib/utils";
import ClearNavigationCursor from "@/components/ClearNavigationCursor";

const Page = async ( { searchParams }: SearchParams ) => {
    const { query, filter, page } = await searchParams;
    const { videos, pagination } = await getAllVideos( query, filter, Number( page ) || 1 );

    // one per card
    const randomGifs = getRandomGifs( videos?.length ?? 0 );

    return (
        // This applies a max-width to the entire window & column to allow top to bottom layout.
        <main className="wrapper page">
            <ClearNavigationCursor/>
            <Header title={ "All clips ˚♪ ♡ 𝄞˚" } subHeader="Public Library"/>

            { videos?.length > 0 ? (
                <section className="video-grid">
                    { videos.map( ( { video, user }, index ) => {
                        return (
                            <VideoCard
                                createdOn={ video.createdAt }
                                thumbnail={ video.thumbnailUrl }
                                key={ video.id }
                                { ...video }
                                userImg={ user?.image || "" }
                                username={ user?.name || "Guest" }
                                ownerId={ video.userId }
                                gifUrl={ randomGifs[index] }
                            />
                        )
                    } ) }

                </section>
            ) : <EmptyState icon="/assets/icons/video.svg" title="Empty Disc"
                            description="Adjust your search Diva"/>
            }

            { pagination?.totalPages > 1 && (
                <Pagination
                    currentPage={ pagination.currentPage }
                    totalPages={ pagination.totalPages }
                    queryString={ query }
                    filterString={ filter }
                />
            ) }
        </main>
    )
}

export default Page