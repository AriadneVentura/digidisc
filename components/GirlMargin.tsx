'use client'

import { useEffect, useState } from 'react'
import Girl from './Girl'
import { useGifs } from "@/components/GifProvider";

export default function GirlMargin() {
    const { gifsEnabled } = useGifs()
    const [ footerVisible, setFooterVisible ] = useState( false )

    // Different styling for when the footer is/isnt present.
    useEffect( () => {
        const footer = document.getElementById( 'site-footer' )
        // If the footer isnt visible
        if ( !footer ) return

        // This watches when the footer enters/leaves the viewport
        const observer = new IntersectionObserver(
            ( [ entry ] ) => {
                // entry.isIntersecting becomes:
                // true  -> footer is visible on screen
                // false -> footer is outside the viewport
                setFooterVisible( entry.isIntersecting )
            },
            {
                // Trigger as soon as even 1px is visible
                threshold: 0,
            }
        )

        // Start watching the footer
        observer.observe( footer )

        // Cleanup observer when component unmounts
        return () => observer.disconnect()
    }, [] )

    if ( !gifsEnabled ) return null

    return (
        <div
            className={ `
                hidden min-[1718px]:flex
                fixed
                right-[max(1rem,calc((100vw-896px)/2-750px))] 
                transition-[bottom] duration-300
            ${
                footerVisible
                    ? 'bottom-13'
                    : '-bottom-14.5'
            }
    ` }
        >
            <Girl
                baseImage="/assets/images/girl.png"
                pupilImage="/assets/images/eyes.png"
                blinkImage="/assets/images/blink.png"
                width={ 165 }
                height={ 225 }
                maxOffset={ 6 }
                lerpFactor={ 0.13 }
                className="filter-dark"
            />
        </div>
    )
}