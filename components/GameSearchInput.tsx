"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Game, useGameSearch } from "@/lib/hooks/useGameSearch";

export const GameSearchInput = ( { value, onChange, label = "Game" }: GameSearchInputProps ) => {
    const [ query, setQuery ] = useState( value?.name ?? "" );
    const [ open, setOpen ] = useState( false );
    const { results, loading } = useGameSearch( open ? query : "" );
    const containerRef = useRef<HTMLDivElement>( null );

    useEffect( () => {
        const handleClickOutside = ( e: MouseEvent ) => {
            if ( !containerRef.current?.contains( e.target as Node ) ) {
                setOpen( false );
            }
        };
        document.addEventListener( "mousedown", handleClickOutside );
        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [] );

    useEffect( () => {
        if ( value?.name ) setQuery( value.name );
    }, [ value ] );

    const handleSelect = ( game: Game ) => {
        onChange( { name: game.name, slug: game.slug, imageUrl: game.background_image } );
        setQuery( game.name );
        setOpen( false );
    }
    const handleClear = () => {
        onChange( null );
        setQuery( "" );
    };

    const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        setQuery( e.target.value );
        setOpen( true );
        if ( !e.target.value ) onChange( null );
    };

    const showDropdown = open && query.length >= 2 && !loading && results.length > 0;

    return (
        <div className="form-field" ref={ containerRef }>
            <label>{ "Game" }</label>

            <div className="game-search-input-wrapper">
                <input
                    type="text"
                    value={ query }
                    onChange={ handleChange }
                    onFocus={ () => setOpen( true ) }
                    placeholder="Search for the game this clip is from..."
                    autoComplete="off"
                />
                <Image className="search-image" src="/assets/icons/search.svg" alt="search" width={ 16 } height={ 16 }
                />

                <div className="game-search-input-icons">
                    { loading && (
                        <svg className="game-search-spinner" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" className="game-search-spinner-track" strokeWidth="3"/>
                            <circle cx="12" cy="12" r="10" className="game-search-spinner-arc" strokeWidth="3"
                                    strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12"/>
                        </svg>
                    ) }
                    { value && !loading && (
                        <button
                            type="button"
                            onClick={ handleClear }
                            className="game-search-clear-btn"
                            aria-label="Clear game"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2"
                                      strokeLinecap="round"/>
                            </svg>
                        </button>
                    ) }
                </div>

                { showDropdown && (
                    <ul className="game-search-dropdown">
                        { results.map( ( game ) => {
                            const year = game.released ? game.released.split( "-" )[0] : null;

                            return (
                                <li key={ game.id } className="game-search-item-divider">
                                    <button
                                        type="button"
                                        onClick={ () => handleSelect( game ) }
                                        className="game-search-item"
                                    >
                                        <span className="game-search-item-title">
                                            { game.name }
                                            { year && (
                                                <span className="game-search-item-year"> ({ year })</span>
                                            ) }
                                        </span>

                                        <div className="game-search-item-meta">
                                            { game.background_image ? (
                                                <Image
                                                    src={ game.background_image }
                                                    alt={ game.name }
                                                    width={ 64 }
                                                    height={ 36 }
                                                    className="game-search-item-image"
                                                />
                                            ) : (
                                                <div className="game-search-item-image-placeholder"/>
                                            ) }
                                        </div>
                                    </button>
                                </li>
                            );
                        } ) }
                    </ul>
                ) }
            </div>
        </div>
    );
};