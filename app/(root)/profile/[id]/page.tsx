import React from 'react'
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { getAllVideosByUser } from "@/lib/actions/video";
import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

const Page = async ( { params, searchParams }: ParamsWithSearch ) => {
    // Next.js exposes the ID through async params;
    const { id } = await params;
    const { query, filter, page } = await searchParams;

    const { user, videos, pagination } = await getAllVideosByUser( id, query, filter, Number( page ) || 1 );

    if ( !user ) redirect( "/404" );

    return (
        <div className="wrapper page">
            <Header subHeader={ user?.email } title={ `⋆. 𐙚˚࿔ ${ user?.name } ☆˚⋆` } userImg={ user?.image ?? "" }/>

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
            ) : <EmptyState icon="/assets/icons/video.svg" title="Empty Disc atm"
                            description="Videos will show when you upload them Diva"/>
            }

            { pagination?.totalPages > 1 && (
                <Pagination
                    currentPage={ pagination.currentPage }
                    totalPages={ pagination.totalPages }
                    queryString={ query }
                    filterString={ filter }
                />
            ) }
        </div>
    )
}
export default Page
