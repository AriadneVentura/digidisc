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
        </div>
    </div>
);

export default VideoCardSkeleton;