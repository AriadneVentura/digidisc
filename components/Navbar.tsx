// Note: when use router is used within a page, the page needs to be client rendered.
// The navbar is a small component so in this case it's okay to be rendered within the client.
'use client'

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const user = {};

const Navbar = () => {
    // NextNavigation hook
    const router = useRouter();

    return (
        <header className="navbar">
            <nav>
                <Link href="/">
                    <Image src="/assets/icons/cd.svg" alt="Logo" width={ 32 } height={ 32 }/>
                    <h1>DigiDisc</h1>
                </Link>
                { user && (
                    <figure>
                        <button onClick={ () => router.push( `/profile/123456` ) }>
                            <Image src="/assets/images/dummy.jpg" alt="user" width={ 32 } height={ 32 }
                                   className="rounded-full aspect-square"/>
                        </button>
                        <button className="cursor-pointer">
                            <Image src="/assets/icons/logout.svg" alt="logout" width={ 32 } height={ 32 }/>
                        </button>
                    </figure>
                )
                }
            </nav>

        </header>
    )
}
export default Navbar
