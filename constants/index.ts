// 500 MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
// 10MB
export const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;
// 60s video clips allowed
export const MAX_DURATION = 60;


export const BUNNY = {
    STREAM_BASE_URL: "https://video.bunnycdn.com/library",
    STORAGE_BASE_URL: "https://syd.storage.bunnycdn.com/digi-disc",
    CDN_URL: "https://digi-disc.b-cdn.net",
    EMBED_URL: "https://iframe.mediadelivery.net/embed",
    // So videos are transcribed
    TRANSCRIPT_URL: "https://vz-98453fdd-a25.b-cdn.net",
};

export const emojis = [ "😂", "😍", "👍" ];

export const filterOptions = [
    "Most Viewed",
    "Most Recent",
    "Oldest First",
    "Least Viewed",
];

export const visibilities: Visibility[] = [ "public", "private" ];

export const ICONS = {
    record: "/assets/icons/record.svg",
    close: "/assets/icons/close.svg",
    upload: "/assets/icons/upload.svg",
};

export const initialVideoState = {
    isLoaded: false,
    hasIncrementedView: false,
    isProcessing: true,
    processingProgress: 0,
};

// export const infos = [ "transcript", "metadata" ];

export const DEFAULT_VIDEO_CONFIG = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
};

export const DEFAULT_RECORDING_CONFIG = {
    // Firefox atm doesnt support vp9 </3
    mimeType: "video/webm;codecs=vp8,opus",
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
};