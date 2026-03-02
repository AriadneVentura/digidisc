import React from 'react'
import { createIframeLink } from "@/lib/utils";

const VideoPlayer = ( { videoId }: VideoPlayerProps ) => {
    return (
        <div className="video-player">
            <iframe
                src={ createIframeLink( videoId ) }
                loading="lazy"
                title="Video player"
                style={ { border: 0 } }
                allowFullScreen
                // allow for mobile users:
                // accelerometer & gyroscope: screen rotation causes video to detect horizontal video layout
                // picture-in-picture: Allows video watching while using other apps.
                // encrypted media: allows videos marked as encrypted to be played still.
                allow="accelerometer; encrypted-media; gyroscope; autoplay; picture-in-picture"
            />
        </div>
    )
}
export default VideoPlayer
