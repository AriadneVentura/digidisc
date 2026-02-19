import React from 'react'
import Image from "next/image";

const FileInput = ( {
                        id, label, accept, file, previewUrl, inputRef, onChange, onReset, type
                    }: FileInputProps ) => {
    return (
        <section className="file-input">
            <label htmlFor={ id }>{ label }</label>
            <input
                type="file"
                id={ id }
                accept={ accept }
                onChange={ onChange }
                // To allow a new design rather than the default
                ref={ inputRef }
                hidden
            />

            { !previewUrl ? (
                // To click on the hidden ugly input, we click on this diva one
                <figure onClick={ () => inputRef.current?.click() }>
                    <Image src="/assets/icons/upload.svg" alt="upload" width={ 24 } height={ 24 }/>
                    <p>Click to upload your { id }</p>
                </figure>
            ) : (
                <div>
                    { type === "video" ?
                        <video src={ previewUrl } controls/> :
                        <Image src={ previewUrl } alt={ `Selected ${ id }` } fill/>
                    }
                    <button type="button" onClick={ onReset }>
                        <Image src="/assets/icons/close.svg" alt="close" width={ 16 } height={ 16 }/>
                    </button>
                    <p>{ file?.name }</p>
                </div>
            ) }
        </section>
    )
}
export default FileInput
