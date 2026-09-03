'use client';

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

const Page = () => {
    const handleSignIn = async () => {
        return await authClient.signIn.social( { provider: 'google' } );
    }
    return (
        <main className="sign-in">
            <aside className="testimonial">
                <Link href="/">
                    <Image src="/assets/icons/pxldvd.svg" alt="Logo" width={ 32 } height={ 32 }/>
                    <h1>DigiDisc</h1>
                </Link>

                <div className="description">
                    <section>
                        <p>
                            Hiii I also like to stream on{ " " }
                            <Link href="https://twitch.tv/ariadnelovelace"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={ { color: "#9146FF" } }
                                  className="!inline hover:underline">
                                twitch
                            </Link>{ " " }:)
                        </p>

                        <article>
                            <Image src="/assets/images/me.jpg" height={ 104 } width={ 104 } alt="creator"
                                   className="rounded-full"/>

                            <div>
                                <Link href="https://twitch.tv/ariadnelovelace"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                >
                                    <h2 className="text-pink-400 dark:text-pink-10 hover:underline">
                                        AriadneLovelace
                                    </h2>
                                </Link>
                                <p>Software Engineer & Twitch Streamer</p>
                            </div>
                        </article>
                    </section>
                </div>

                <p>
                    © DigiDisc { (new Date()).getFullYear() }
                </p>
            </aside>

            <aside className="google-sign-in">
                <section>
                    <Link href="/">
                        <Image src="/assets/icons/pxldvd.svg" alt="Logo" width={ 35 } height={ 35 }/>
                        <h1>DigiDisc</h1>
                    </Link>
                    <p>Create and share your very first <span>DigiDisc Clip</span> now!</p>
                    <button onClick={ handleSignIn }>
                        <Image src="/assets/icons/google.svg" height={ 22 } width={ 22 } alt="google"/>
                        <span>Sign in with Google</span>
                    </button>
                    <Link href="/privacy" className="text-gray-100 dark:text-pink-10 font-bold hover:underline">
                        Privacy Policy
                    </Link>
                </section>
            </aside>

            <div className="overlay"/>
        </main>
    )
}
export default Page
