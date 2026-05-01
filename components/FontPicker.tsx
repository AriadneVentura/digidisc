'use client'
import Image from 'next/image'
import DropdownList from '@/components/DropdownList'
import { fontOptions, useFont } from '@/components/FontProvider'

const fontLabels = Object.fromEntries(
    Object.entries( fontOptions ).map( ( [ key, { label } ] ) => [ label, key ] )
)

export function FontPicker() {
    const { font, changeFont } = useFont()

    const options = Object.values( fontOptions ).map( f => f.label )
    const selectedOption = fontOptions[font].label

    const handleOptionSelect = ( label: string ) => {
        const key = fontLabels[label]
        if ( key ) changeFont( key as any )
    }

    const triggerElement = (
        <div className="filter-trigger">
            <figure>
                <Image
                    src="/assets/icons/hamburger.svg"
                    alt="text-theme"
                    className="filter-dark"
                    width={ 14 }
                    height={ 14 }
                />
                <span>font: { selectedOption }</span>
            </figure>
            <Image
                src="/assets/icons/arrow-down.svg"
                alt="arrow-down"
                className="filter-dark"
                width={ 20 }
                height={ 20 }
            />
        </div>
    )

    return (
        <DropdownList
            options={ options }
            selectedOption={ selectedOption }
            onOptionSelect={ handleOptionSelect }
            triggerElement={ triggerElement }
            dropUp
        />
    )
}