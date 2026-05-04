"use client";

import { useEffect } from "react";

const NavigationStart = () => {
    useEffect( () => {
        const handleClick = ( e: MouseEvent ) => {
            const anchor = (e.target as HTMLElement).closest( "a[href]" );
            if ( !anchor ) return;
            const href = anchor.getAttribute( "href" );
            if ( href && !href.startsWith( "http" ) && !href.startsWith( "#" ) && !href.startsWith( "mailto" ) ) {
                document.documentElement.classList.add( "navigating" );
            }
        };
        document.addEventListener( "click", handleClick );
        return () => document.removeEventListener( "click", handleClick );
    }, [] );

    return null;
};

export default NavigationStart;