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
                    <Image src="/assets/icons/cd.svg" height={ 32 } width={ 32 } alt="logo"/>
                    <h1>DigiDisc</h1>
                </Link>

                <div className="description">
                    <section>
                        <figure>
                            { Array.from( { length: 5 } ).map( ( _, i ) => (
                                <Image src="/assets/icons/star.svg" height={ 20 } width={ 20 } alt="star" key={ i }/>
                            ) ) }
                        </figure>
                        <p>
                            DigiDisc makes screen recording effortless. From quick walkthroughs to full presentations,
                            capture your world digitally and broadcast it in seconds.
                        </p>

                        <article>
                            <Image src="/assets/images/jessica.png" height={ 64 } width={ 64 } alt="jessica"
                                   className="rounded-full"/>

                            <div>
                                <h2>
                                    Jessica Summers
                                </h2>
                                <p>Product Designer, ProjectNova</p>
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
                        <Image src="/assets/icons/cd.svg" height={ 40 } width={ 40 } alt="logo"/>
                        <h1>DigiDisc</h1>
                    </Link>
                    <p>Create and share your very first <span>DigiDisc video</span> in no time.</p>
                    <button onClick={ handleSignIn }>
                        <Image src="/assets/icons/google.svg" height={ 22 } width={ 22 } alt="google"/>
                        <span>Sign in with Google</span>
                    </button>
                </section>
            </aside>

            <div className="overlay"/>
        </main>
    )
}
export default Page
