import React from 'react'
import Header from "@/components/Header";

const Page = () => {
    return (
        // This applies a max-width to the entire window & column to allow top to bottom layout.
        <main className="wrapper page">
            <Header title={ "All MP4s" } subHeader="Public Library"/>
            <h1 className="text-2xl font-karla">Welcome to Digi Disc!</h1>
        </main>
    )
}

export default Page