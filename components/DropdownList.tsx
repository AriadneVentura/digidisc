'use client'
import React, { useState } from 'react'
import Image from "next/image";
import { cn } from "@/lib/utils";


const DropdownList = ( {
                           options,
                           selectedOption,
                           onOptionSelect,
                           triggerElement,
                           dropUp = false,
                       }: DropdownListProps ) => {
    const [ isOpen, setIsOpen ] = useState<boolean>( false );

    const handleOptionClick = ( option: string ) => {
        onOptionSelect( option );
        setIsOpen( false );
    };

    return (
        <div className="relative">
            <div className="cursor-pointer" onClick={ () => setIsOpen( !isOpen ) }>
                { triggerElement }
            </div>

            { isOpen && (
                <ul className={ cn( "dropdown", { "dropdown-up": dropUp } ) }>
                    { options.map( ( option ) => (
                        <li
                            key={ option }
                            className={ cn( "list-item", {
                                "bg-pink-100 text-white dark:bg-pink-150 dark:text-dark-100": selectedOption === option,
                            } ) }
                            onClick={ () => handleOptionClick( option ) }
                        >
                            { option }
                            { selectedOption === option && (
                                <Image
                                    src="/assets/icons/check.svg"
                                    alt="check"
                                    width={ 16 }
                                    height={ 16 }
                                    className="filter-dark"
                                />
                            ) }
                        </li>
                    ) ) }
                </ul>
            ) }
        </div>
    );
}
export default DropdownList
