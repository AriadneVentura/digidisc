import VideoCardSkeleton from "@/components/VideoCardSkeleton";

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
