"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const NavigationStart = () => {
    const pathname = usePathname();

    useEffect( () => {
        const handleClick = ( e: MouseEvent ) => {
            const anchor = (e.target as HTMLElement).closest( "a[href]" );
            if ( !anchor ) return;
            const href = anchor.getAttribute( "href" );
            if ( !href ) return;
            if ( href.startsWith( "http" ) || href.startsWith( "#" ) ) return;

            // Don't add navigating if already on page
            const isSamePage = href === pathname || href.split( "?" )[0] === pathname;
            if ( isSamePage ) return;

            document.documentElement.classList.add( "navigating" );
        };

        document.addEventListener( "click", handleClick );
        return () => document.removeEventListener( "click", handleClick );
    }, [ pathname ] );

    return null;
};

export default NavigationStart;