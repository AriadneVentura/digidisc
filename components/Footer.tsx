import React from 'react'
import { FontPicker } from "@/components/FontPicker";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer id="site-footer" className="footer !flex-col !h-auto py-5">
            <div className="flex flex-row max-sm:flex-col justify-center items-center gap-3 max-sm:gap-5">
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
            </div>

            <Link href="/privacy" className="text-dark-100 dark:text-pink-10 font-bold hover:underline">
                Privacy Policy
            </Link>
        </footer>
    )
}
export default Footer
