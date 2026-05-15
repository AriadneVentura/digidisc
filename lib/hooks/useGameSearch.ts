import { useEffect, useRef, useState } from "react";

export interface Game {
    id: number;
    name: string;
    slug: string;
    background_image: string | null;
    released: string | null;
}

export function useGameSearch( query: string ) {
    const [ results, setResults ] = useState<Game[]>( [] );
    const [ loading, setLoading ] = useState( false );

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>( null );

    useEffect( () => {
        if ( !query || query.length < 2 ) {
            setResults( [] );
            return;
        }

        if ( debounceRef.current ) {
            clearTimeout( debounceRef.current );
        }

        debounceRef.current = setTimeout( async () => {
            setLoading( true );

            try {
                const res = await fetch(
                    `https://api.rawg.io/api/games?key=${ process.env.NEXT_PUBLIC_RAWG_API_KEY }&search=${ encodeURIComponent(
                        query
                    ) }&page_size=8`
                );

                const data = await res.json();
                setResults( data.results ?? [] );
            } catch {
                setResults( [] );
            } finally {
                setLoading( false );
            }
        }, 300 );

        return () => {
            if ( debounceRef.current ) {
                clearTimeout( debounceRef.current );
            }
        };
    }, [ query ] );

    return { results, loading };
}