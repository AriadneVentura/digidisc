'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type FontKey = 'satoshi' | 'magasans' | 'unifontexmono' | "minecraft"

export const fontOptions: Record<FontKey, { label: string; variable: string }> = {
    'unifontexmono': { label: 'pixels', variable: 'var(--font-unifonexmono)' },
    'minecraft': { label: 'minecraft', variable: 'var(--font-minecraft)' },
    'magasans': { label: 'digital clock', variable: 'var(--font-magasans)' },
    'satoshi': { label: 'zzzzz', variable: 'var(--font-satoshi)' }
}

const FontContext = createContext<{
    font: FontKey
    changeFont: ( key: FontKey ) => void
} | null>( null )

export function FontProvider( { children }: { children: React.ReactNode } ) {
    const [ font, setFont ] = useState<FontKey>( 'unifontexmono' )

    const changeFont = ( key: FontKey ) => {
        setFont( key )
        localStorage.setItem( 'font-preference', key )
        document.body.style.setProperty( '--font-satoshi', fontOptions[key].variable )
    }

    useEffect( () => {
        const saved = localStorage.getItem( 'font-preference' ) as FontKey
        const initial = saved && fontOptions[saved] ? saved : 'unifontexmono'
        setFont( initial )
        document.body.style.setProperty( '--font-satoshi', fontOptions[initial].variable )
    }, [] )

    return (
        <FontContext.Provider value={ { font, changeFont } }>
            { children }
        </FontContext.Provider>
    )
}

export const useFont = () => {
    const ctx = useContext( FontContext )
    if ( !ctx ) throw new Error( 'useFont must be used within FontProvider' )
    return ctx
}