// Note: when use router is used within a page, the page needs to be client rendered.
// The navbar is a small component so in this case it's okay to be rendered within the client.
'use client'

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";

const user = {};

const Navbar = () => {
    // NextNavigation hook
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    // For light/dark mode.
    const { theme, setTheme } = useTheme();

    return (
        <header className="navbar">
            <nav>
                <Link href="/">
                    <Image src="/assets/icons/cd.svg" alt="Logo" width={ 32 } height={ 32 }/>
                    <h1>DigiDisc</h1>
                </Link>
                <p className="font-light dark:font-dark text-xs max-sm:hidden">digital space for clips :)</p>
                <figure>
                    <button onClick={ () => setTheme( theme === "dark" ? "light" : "dark" ) }>
                        <Image src={ "assets/icons/day-and-night.svg" } alt="switch light/dark"
                               width={ 32 }
                               height={ 32 }
                               className="filter-dark"
                        />
                    </button>
                    { user ? (
                        <>
                            <button onClick={ () => router.push( `/profile/${ user?.id }` ) }>
                                <Image src={ user.image || "" } alt="user" width={ 32 } height={ 32 }
                                       className="rounded-full aspect-square"/>
                            </button>
                            <button
                                onClick={ async () => {
                                    return await authClient.signOut( {
                                        fetchOptions: {
                                            onSuccess: () => {
                                                redirect( "/sign-in" );
                                            },
                                        },
                                    } );
                                } }
                                className="cursor-pointer"
                            >
                                <Image src="/assets/icons/logout.svg" alt="logout" className="filter-dark" width={ 32 }
                                       height={ 32 }/>
                            </button>
                        </>
                    ) : (
                        <button onClick={ () => redirect( "/sign-in" ) }
                                className="cursor-pointer primary-btn"
                        >
                            Sign In
                        </button>
                    )
                    }
                </figure>
            </nav>

        </header>
    )
}
export default Navbar
