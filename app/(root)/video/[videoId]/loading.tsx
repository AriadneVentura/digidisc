import VideoCardSkeleton from "@/components/VideoCardSkeleton";

const Loading = () => (
    <main className="wrapper page">

        {/* VideoDetailHeader skeleton */ }
        <div className="detail-header">
            <aside className="user-info">
                <div className="h-8 w-72 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                <figure className="gap-1 flex items-center">
                    <div className="size-[34px] rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse shrink-0"/>
                    <div className="h-3.5 w-28 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    <figcaption className="flex items-center gap-1">
                        <span className="text-gray-100 dark:text-gray-10">»</span>
                        <div className="h-3.5 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    </figcaption>
                </figure>
            </aside>

            <aside className="cta">
                {/* gif placeholder */ }
                <div className="size-6 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                {/* copy link button */ }
                <div className="size-6 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                {/* owner controls */ }
                <div className="user-btn">
                    <div className="h-10 w-24 rounded-4xl bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    <div className="bar"/>
                    <div className="h-10 w-32 rounded-[28px] bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                </div>
            </aside>
        </div>

        {/* video-details section */ }
        <section className="video-details">

            {/* Left: player + video info */ }
            <div className="content">

                {/* Video player */ }
                <div className="relative aspect-video w-full rounded-2xl bg-gray-20 dark:bg-gray-150 animate-pulse"/>

                {/* VideoInfo skeleton */ }
                <div className="video-information">

                    {/* Game card */ }
                    <div className="game-information">
                        <article className="game-metadata">
                            <div className="game-metadata-info flex flex-col gap-3">
                                <div className="h-3.5 w-10 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                <div className="h-5 w-24 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                            </div>
                            <div
                                className="game-metadata-image w-[120px] h-[80px] rounded-lg bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        </article>
                    </div>

                    {/* Clip info card */ }
                    <div className="clip-information">
                        <aside>
                            <div className="info-metadata">
                                {/* Description */ }
                                <article className="flex flex-col gap-3">
                                    <div className="h-3.5 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                    <div className="flex flex-col gap-2">
                                        <div
                                            className="h-4 w-full rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                        <div
                                            className="h-4 w-3/4 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                    </div>
                                </article>
                                {/* Tags */ }
                                <article className="flex flex-col gap-3 shrink-0">
                                    <div className="h-3.5 w-10 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                    <div className="video-tags-wrapper">
                                        <div
                                            className="h-7 w-16 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                        <div
                                            className="h-7 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                        <div
                                            className="h-7 w-14 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                    </div>
                                </article>
                            </div>

                            {/* Views + likes */ }
                            <aside>
                                <div className="side-details">
                                    <div className="h-4 w-12 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                </div>
                                <div className="side-details">
                                    <div className="h-4 w-12 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                                </div>
                            </aside>
                        </aside>
                    </div>

                </div>
            </div>
        </section>

        {/* Suggested Videos skeleton */ }
        <div className="suggested-videos">
            <div className="suggested-toggle pointer-events-none">
                <div className="h-5 w-36 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                <div className="size-5 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
            </div>
            <div className="suggested-grid mt-4">
                { Array.from( { length: 4 } ).map( ( _, i ) => (
                    <div key={ i } className="suggested-item">
                        <div className="h-3 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        <VideoCardSkeleton/>
                    </div>
                ) ) }
            </div>
        </div>

    </main>
);

export default Loading;
