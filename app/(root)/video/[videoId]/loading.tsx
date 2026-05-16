import VideoCardSkeleton from "@/components/VideoCardSkeleton";

const Loading = () => (
    <main className="wrapper page">
        {/* VideoDetailHeader skeleton */ }
        <div className="detail-header">
            <div className="user-info">
                <div className="h-8 w-72 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                <figure className="gap-1 flex items-center">
                    <div className="size-5 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse shrink-0"/>
                    <div className="h-3.5 w-32 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    <div className="h-3.5 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                </figure>
            </div>
            <div className="cta">
                <div className="flex items-center gap-2">
                    <div
                        className="h-10 w-24 rounded-4xl border border-gray-20 dark:border-gray-10 bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    <div
                        className="h-10 w-32 rounded-[28px] border border-gray-20 dark:border-gray-10 bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    <div
                        className="h-10 w-28 rounded-[28px] border border-gray-20 dark:border-gray-10 bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                </div>
            </div>
        </div>

        {/* video-details section */ }
        <section className="video-details">
            <div className="content">
                <div className="relative aspect-video w-full rounded-2xl bg-gray-20 dark:bg-gray-150 animate-pulse"/>
            </div>

            {/* VideoInfo panel skeleton */ }
            <div className="video-info">
                <nav className="flex gap-6 items-center border-b border-gray-20 dark:border-gray-10">
                    <div className="h-4 w-16 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse mb-4"/>
                    <div className="h-4 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse mb-4"/>
                </nav>

                <div className="video-information">
                    <aside className="flex gap-7 justify-between">
                        <div className="h-4 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        <div className="h-4 w-16 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        <div className="h-4 w-16 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    </aside>
                </div>

                <div className="metadata">
                    { Array.from( { length: 3 } ).map( ( _, i ) => (
                        <article key={ i }>
                            <div className="h-3.5 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                            <div className="h-5 w-48 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse mt-2"/>
                        </article>
                    ) ) }
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    { Array.from( { length: 5 } ).map( ( _, i ) => (
                        <div key={ i } className="flex gap-2 items-start">
                            <div
                                className="h-3.5 w-10 rounded-full bg-pink-100/20 dark:bg-pink-150/20 animate-pulse shrink-0"/>
                            <div
                                className="h-3.5 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"
                                style={ { width: `${ 55 + (i * 11) % 35 }%` } }
                            />
                        </div>
                    ) ) }
                </div>

                <section className="video-grid">
                    { Array.from( { length: 8 } ).map( ( _, i ) => (
                        <VideoCardSkeleton key={ i }/>
                    ) ) }
                </section>
            </div>
        </section>
    </main>
);

export default Loading;
