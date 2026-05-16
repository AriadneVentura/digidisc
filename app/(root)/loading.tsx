import VideoCardSkeleton from "@/components/VideoCardSkeleton";

const Loading = () => (
    <main className="wrapper page">
        <div className="header">
            <div className="header-container">
                <div className="details">
                    <div className="flex flex-col gap-1">
                        <div className="h-3.5 w-28 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                        <div className="h-8 w-56 rounded-full bg-gray-20 dark:bg-gray-150 animate-pulse"/>
                    </div>
                </div>
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
    </main>
);

export default Loading;
