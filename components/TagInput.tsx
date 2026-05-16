'use client'
import React, { KeyboardEvent, useRef, useState } from 'react'

const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 10;

const TagInput = ( { value: tags, onChange }: TagInputProps ) => {
    const [ input, setInput ] = useState( "" );
    const [ error, setError ] = useState( "" );
    const inputRef = useRef<HTMLInputElement>( null );

    const normalise = ( raw: string ) =>
        raw.replace( /^#+/, "" ).replace( /\s+/g, "" ).toLowerCase();

    const addTag = ( raw: string ) => {
        const tag = normalise( raw );
        if ( !tag ) return;

        if ( tags.length >= MAX_TAGS ) {
            setError( `Max ${ MAX_TAGS } tags allowed` );
            return;
        }
        if ( tag.length > MAX_TAG_LENGTH ) {
            setError( `Tag must be under ${ MAX_TAG_LENGTH } characters` );
            return;
        }
        if ( tags.includes( tag ) ) {
            setError( "Tag already added" );
            return;
        }

        setError( "" );
        onChange( [ ...tags, tag ] );
        setInput( "" );
    };

    const removeTag = ( index: number ) => {
        onChange( tags.filter( ( _, i ) => i !== index ) );
        setError( "" );
        inputRef.current?.focus();
    };

    const handleKeyDown = ( e: KeyboardEvent<HTMLInputElement> ) => {
        if ( e.key === "Enter" || e.key === "," || e.key === " " ) {
            e.preventDefault();
            addTag( input );
        }
        if ( e.key === "Backspace" && input === "" && tags.length > 0 ) {
            removeTag( tags.length - 1 );
        }
    };

    const isAtMax = tags.length >= MAX_TAGS;

    return (
        <div className="tag-input-wrapper">
            <label htmlFor="tags" className="tag-input-label">
                Tags
            </label>

            <div
                className="tag-input-container"
                onClick={ () => inputRef.current?.focus() }
                role="group"
                aria-label="Tags input"
            >
                { tags.map( ( tag, i ) => (
                    <span key={ tag } className="tag-pill">
                        <span className="tag-hash">#</span>
                        <span className="tag-label">{ tag }</span>
                        <button
                            type="button"
                            className="tag-remove"
                            onClick={ ( e ) => {
                                e.stopPropagation();
                                removeTag( i );
                            } }
                            aria-label={ `Remove tag ${ tag }` }
                        >
                            ×
                        </button>
                    </span>
                ) ) }

                { !isAtMax && (
                    <input
                        ref={ inputRef }
                        id="tags"
                        type="text"
                        className="tag-input-field"
                        value={ input }
                        onChange={ ( e ) => {
                            setError( "" );
                            setInput( e.target.value );
                        } }
                        onKeyDown={ handleKeyDown }
                        onBlur={ () => {
                            if ( input.trim() ) addTag( input );
                        } }
                        placeholder={ tags.length === 0 ? "jumpscare, gullible, stinky..." : "" }
                        maxLength={ MAX_TAG_LENGTH + 1 }
                        aria-describedby="tag-hint"
                    />
                ) }
            </div>

            <div className="tag-meta" id="tag-hint">
                <span className="tag-hint">
                    { isAtMax ? "Max tags reached ✓" : "Press Enter, Space, or comma to add a tag :)" }
                </span>
                <span className={ `tag-counter ${ isAtMax ? "tag-counter--full" : "" }` }>
                    { tags.length } / { MAX_TAGS }
                </span>
            </div>

            { error && <p className="tag-error" role="alert">{ error }</p> }
        </div>
    );
};

export default TagInput;
