import React from 'react'
import { FontPicker } from "@/components/FontPicker";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer id="site-footer" className="footer">
            <Link
                href="https://buymeacoffee.com/ariiadne"
                target="_blank"
                rel="noopener noreferrer"
                className="filter-trigger hover:bg-pink-200 dark:hover:bg-pink-20 font-bold"
            >
                <Image
                    src="/assets/icons/coffee.svg"
                    height={ 25 }
                    width={ 25 }
                    alt="buy me a chai"
                    className="filter-dark"
                />
                <span>buy me a chai :)</span>
            </Link>
            <div className="flex flex-row gap-2">
                <p>
                    Developed by Ariadne
                </p>
                <img src="/assets/gifs/hearts.gif" alt="preview" width={ 20 } height={ 20 }/>
                <p>© 2026</p>
            </div>
            <FontPicker/>
        </footer>
    )
}
export default Footer
