'use client'
import React, { useState } from 'react'
import Image from "next/image";


const DropdownList = () => {
    const [ isOpen, setIsOpen ] = useState<boolean>( false );

    return (
        // Relative so the pop-up appears in the right place.
        <div className="relative">
            <div className="cursor-pointer" onClick={ () => setIsOpen( !isOpen ) }>
                <div className="filter-trigger">
                    <figure>
                        <Image src="/assets/icons/hamburger.svg" alt="menu" width={ 14 } height={ 14 }/>
                        Most recent
                    </figure>
                    <Image src="/assets/icons/arrow-down.svg" alt="arrow-down" width={ 20 } height={ 20 }/>
                </div>
            </div>

            { isOpen && (
                <ul className="dropdown">
                    { [ 'Most recent', 'Most liked' ].map( ( item ) => (
                        <li key={ item } className="list-item">
                            { item }
                        </li>
                    ) ) }
                </ul>
            ) }
        </div>
    )
}
export default DropdownList
