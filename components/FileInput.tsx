import Image from "next/image";
import { DragEvent, useState } from "react";

const FileInput = ( {
                        id,
                        label,
                        accept,
                        file,
                        previewUrl,
                        inputRef,
                        onChange,
                        onReset,
                        type,
                    }: FileInputProps ) => {
    const [ isDragging, setIsDragging ] = useState( false );

    const handleDragOver = ( e: DragEvent<HTMLElement> ) => {
        // without this the browser blocks dropping entirely
        e.preventDefault();
        e.stopPropagation();
        setIsDragging( true );
    };

    const handleDragLeave = ( e: DragEvent<HTMLElement> ) => {
        e.preventDefault();
        e.stopPropagation();
        // removes the drag-over visuals when cursor leaves the square
        setIsDragging( false );
    };

    const handleDrop = ( e: DragEvent<HTMLElement> ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging( false );

        // Grabs the first file dropped
        const droppedFile = e.dataTransfer.files[0];
        if ( !droppedFile ) return;

        // Validate against the accept prop (e.g. "video/*", "image/png")
        if ( accept ) {
            const acceptedTypes = accept.split( "," ).map( ( t ) => t.trim() );
            const isAccepted = acceptedTypes.some( ( accepted ) => {
                if ( accepted.endsWith( "/*" ) ) {
                    return droppedFile.type.startsWith( accepted.replace( "/*", "/" ) );
                }
                return droppedFile.type === accepted || droppedFile.name.endsWith( accepted );
            } );

            if ( !isAccepted ) return;
        }

        // Simulate a native change event on the hidden input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add( droppedFile );

        if ( inputRef.current ) {
            inputRef.current.files = dataTransfer.files;
            inputRef.current.dispatchEvent( new Event( "change", { bubbles: true } ) );
        }
    };

    return (
        <section className="file-input">
            <label htmlFor={ id }>{ label }</label>
            <input
                type="file"
                id={ id }
                accept={ accept }
                hidden
                ref={ inputRef }
                onChange={ onChange }
            />

            { !previewUrl ? (
                <figure
                    onClick={ () => inputRef.current?.click() }
                    onDragOver={ handleDragOver }
                    onDragLeave={ handleDragLeave }
                    onDrop={ handleDrop } blue-400
                    className={ `transition-all duration-200 ${ isDragging ? "border-2 border-dashed border-pink-100 dark:border-pink-150" : "" }` }
                >
                    <Image
                        src="/assets/icons/upload.svg"
                        alt="Upload Icon"
                        width={ 24 }
                        height={ 24 }
                        className="filter-dark"
                    />
                    <p>{ isDragging ? `Drop your ${ id } here!` : `Click or drag to upload your ${ id }!` }</p>
                </figure>
            ) : (
                <div>
                    { type === "video" ? (
                        <video src={ previewUrl } controls/>
                    ) : (
                        <Image src={ previewUrl } alt={ `Selected ${ id }` } fill/>
                    ) }
                    <button type="button" onClick={ onReset }>
                        <Image
                            src="/assets/icons/close.svg"
                            alt="Close Icon"
                            width={ 16 }
                            height={ 16 }
                            className="filter-dark"
                        />
                    </button>
                    <p>{ file?.name }</p>
                </div>
            ) }
        </section>
    );
};

export default FileInput;