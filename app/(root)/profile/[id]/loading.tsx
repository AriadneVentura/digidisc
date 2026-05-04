const VideoCardSkeleton = () => (
    <div className="flex flex-col rounded-2xl w-full border border-gray-20 dark:border-gray-10 overflow-hidden">
        <div className="w-full h-[190px] bg-gray-20 dark:bg-gray-150 animate-pulse"/>
        <div className="flex flex-col gap-3 px-3.5 pt-4 pb-4.5">
            <div className="flex gap-2 justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <div className="size-6 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse shrink-0"/>
                    <div className="flex flex-col gap-0.5">
                        <div className="h-3 w-20 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        <div className="h-3 w-14 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    </div>
                </div>
                <div className="h-3 w-10 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
            </div>
            <div className="h-4 w-4/5 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
            <div className="flex items-center gap-4">
                <div className="h-3 w-12 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                <div className="h-3 w-12 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
            </div>
        </div>
    </div>
);

const Loading = () => (
    <div className="wrapper page">
        <div className="header">
            <div className="header-container">
                <div className="details">
                    <div className="size-12 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse shrink-0"/>
                    <article className="flex flex-col gap-1">
                        <div className="h-3.5 w-40 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        <div className="h-7 w-64 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    </article>
                </div>
                <aside className="flex items-center gap-2 md:gap-4">
                    <div
                        className="h-10 w-32 rounded-4xl border border-gray-20 dark:border-gray-10 bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    <div
                        className="h-10 w-32 rounded-4xl border border-gray-20 dark:border-gray-10 bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                </aside>
            </div>
            <div className="search-filter">
                <div className="search">
                    <div className="h-9 w-full max-w-[500px] rounded-[18px] bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                </div>
                <div className="h-9 w-28 rounded-[28px] bg-gray-20 dark:bg-gray-150 animate-pulse"/>
            </div>
        </div>
        <section className="video-grid">
            { Array.from( { length: 8 } ).map( ( _, i ) => (
                <VideoCardSkeleton key={ i }/>
            ) ) }
        </section>
    </div>
);

export default Loading;
