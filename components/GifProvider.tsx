// context/GifContext.tsx
"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface GifContextType {
    gifsEnabled: boolean;
    toggleGifs: () => void;
}

const GifContext = createContext<GifContextType>( {
    gifsEnabled: true,
    toggleGifs: () => {
    },
} );

export const GifProvider = ( { children }: { children: ReactNode } ) => {
    const [ gifsEnabled, setGifsEnabled ] = useState( true );

    const toggleGifs = () => setGifsEnabled( ( prev ) => !prev );

    return (
        <GifContext.Provider value={ { gifsEnabled, toggleGifs } }>
            { children }
        </GifContext.Provider>
    );
};

export const useGifs = () => useContext( GifContext );