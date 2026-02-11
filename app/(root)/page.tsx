import React from 'react'
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { dummyCards } from "@/constants";

const Page = () => {
    return (
        // This applies a max-width to the entire window & column to allow top to bottom layout.
        <main className="wrapper page">
            <Header title={ "All MP4s" } subHeader="Public Library"/>

            <section className="video-grid">
                { dummyCards.map( ( card ) => (
                    <VideoCard key={ card.id } { ...card }

                    />
                ) ) }
            </section>
        </main>
    )
}

export default Page