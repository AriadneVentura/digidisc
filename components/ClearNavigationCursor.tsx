"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ClearCursor = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect( () => {
        document.documentElement.classList.remove( "navigating" );
    }, [ pathname, searchParams ] );

    return null;
};

const ClearNavigationCursor = () => (
    <Suspense fallback={ null }>
        <ClearCursor/>
    </Suspense>
);

export default ClearNavigationCursor;