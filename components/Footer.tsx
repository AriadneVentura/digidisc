import React from 'react'
import { FontPicker } from "@/components/FontPicker";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="flex flex-row gap-2">
                <p>
                    Developed by Ariadne
                </p>
                <img src="/assets/gifs/hearts.gif" alt="preview" width={ 20 } height={ 20 }/>
                <p>2026</p>
            </div>
            <FontPicker/>
        </footer>
    )
}
export default Footer
