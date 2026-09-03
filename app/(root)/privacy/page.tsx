import React from 'react'
import Link from "next/link";
import GirlMargin from "@/components/GirlMargin";
import ClearNavigationCursor from "@/components/ClearNavigationCursor";

// Static legal page — no data fetching, just the policy content.
export const metadata = {
    title: "Privacy Policy • DigiDisc",
    description: "How DigiDisc collects, uses, stores and shares your data.",
};

// Little helpers so every section shares the same styling.
const Section = ( { title, children }: { title: string; children: React.ReactNode } ) => (
    <section className="flex flex-col gap-2.5">
        <h2 className="text-xl font-bold text-dark-100 dark:text-pink-10 -tracking-[0.8px]">
            { title }
        </h2>
        <div className="flex flex-col gap-2.5 text-sm text-gray-100 dark:text-gray-10 leading-relaxed">
            { children }
        </div>
    </section>
);

const ExternalLink = ( { href, children }: { href: string; children: React.ReactNode } ) => (
    <Link
        href={ href }
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-150 font-semibold hover:underline"
    >
        { children }
    </Link>
);

const Page = () => {
    return (
        <main className="wrapper page">
            <ClearNavigationCursor/>

            <GirlMargin/>

            <header className="header">
                <div className="header-container">
                    <div className="details">
                        <article>
                            <p>DigiDiscs's</p>
                            <h1>Privacy Policy</h1>
                        </article>
                    </div>
                </div>
            </header>

            <div className="wrapper-lg !px-0 flex flex-col gap-9">
                <p className="text-xs text-gray-100 dark:text-gray-10">
                    Last updated: 3 September 2026
                </p>

                <Section title="What is ♡ DigiDisc ♡ ?">
                    <p>
                        DigiDisc is a small space for sharing short game clips.
                        It is developed and maintained by Ariadne. This policy explains
                        what information DigiDisc collects when you use it, why, how long it is
                        kept, and the third parties involved. If anything here is unclear you can
                        reach out through { " " }
                        <ExternalLink href="mailto:ariadnevk21@gmail.com">arialovelace21@gmail.com</ExternalLink>.
                    </p>
                </Section>

                <Section title="Information I collect">
                    <p>I only collect what's needed to run the site:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>
                            <span
                                className="font-semibold text-dark-100 dark:text-pink-10">Account details.</span>{ " " }
                            When you sign in with Google DigiDisc receives and stores your name, email
                            address, email-verified status and your Google profile image. DigiDisc does
                            not receive your Google password.
                        </li>
                        <li>
                            <span
                                className="font-semibold text-dark-100 dark:text-pink-10">Authentication tokens.</span>{ " " }
                            To keep you signed in, DigiDisc stores the OAuth access, refresh and ID
                            tokens issued by Google, along with the granted scope.
                        </li>
                        <li>
                            <span
                                className="font-semibold text-dark-100 dark:text-pink-10">Session &amp; device data.</span>{ " " }
                            For each active session DigiDisc stores a session token, its expiry, your
                            IP address and your browser&apos;s user-agent string.
                        </li>
                        <li>
                            <span
                                className="font-semibold text-dark-100 dark:text-pink-10">Content you upload.</span>{ " " }
                            The videos and screen recordings you upload, their thumbnails,
                            titles, descriptions, tags, chosen visibility (public or private),
                            associated game information, duration, view counts and likes.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Screen &amp; microphone recordings.</span>{ " " }
                            If you use the in-browser recorder, your screen (and, only if you
                            enable it, your microphone audio) is captured in your browser to
                            create a clip. Recording only happens after you grant your browser&apos;s
                            permission, and nothing is stored until you choose to upload it.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Interactions.</span>{ " " }
                            Likes and views are recorded so counts stay accurate.
                        </li>
                        <li>
                            <span
                                className="font-semibold text-dark-100 dark:text-pink-10">Search queries.</span>{ " " }
                            When you search for a game to tag a clip, your search text is sent to
                            a game database provider (see below) to return matching results.
                        </li>
                        <li>
                            <span
                                className="font-semibold text-dark-100 dark:text-pink-10">Security signals.</span>{ " " }
                            To prevent abuse and rate-limit uploads and actions, request
                            metadata such as your IP address and an identifier tied to your
                            account is processed by our security provider.
                        </li>
                    </ul>
                </Section>

                <Section title="How DigiDisc use your information">
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>To create your account and keep you signed in.</li>
                        <li>To store, process and stream the clips you upload.</li>
                        <li>To show your profile, clips, likes and view counts.</li>
                        <li>To let you search for and attach game information to clips.</li>
                        <li>To protect the site from bots, spam and abuse, and to enforce upload and action rate
                            limits.
                        </li>
                    </ul>
                    <p>
                        DigiDisc does not sell your personal information, and DigiDisc does not use your clips or
                        account data for advertising or AI generated content.
                    </p>
                </Section>

                <Section title="Cookies">
                    <p>
                        DigiDisc uses a session cookie so that you stay signed in as you move
                        between pages. This cookie is essential to the site functioning and is
                        not used for tracking or advertising. Your light/dark theme and GIF
                        preferences are also stored locally in your browser.
                    </p>
                </Section>

                <Section title="Third parties DigiDisc rely on">
                    <p>
                        DigiDisc is built on a handful of trusted services. Each processes only
                        the data needed for its role:
                    </p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Google</span>: Sign-in
                            (OAuth). Provides your name, email and profile image so you can
                            authenticate. See the{ " " }
                            <ExternalLink href="https://policies.google.com/privacy">Google Privacy
                                Policy</ExternalLink>.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Bunny.net</span>: Video
                            storage, encoding, streaming and CDN delivery for your clips and
                            thumbnails. Uploaded video content is stored in Bunny&apos;s storage
                            region in Sydney, Australia. See the{ " " }
                            <ExternalLink href="https://bunny.net/privacy">Bunny.net Privacy Policy</ExternalLink>.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Neon</span>: The managed
                            PostgreSQL database that stores your account, session, clip metadata,
                            tags, likes and views. See the{ " " }
                            <ExternalLink href="https://neon.tech/privacy-policy">Neon Privacy Policy</ExternalLink>.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Arcjet</span>: Bot
                            detection, rate limiting and email validation. Processes request
                            metadata (such as your IP address) and an account-based identifier to
                            keep the site secure. See the{ " " }
                            <ExternalLink href="https://arcjet.com/privacy-policy">Arcjet Privacy Policy</ExternalLink>.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">RAWG</span>: Game
                            database used for game search and metadata. Your search text is sent
                            to RAWG to return matching games. See the{ " " }
                            <ExternalLink href="https://rawg.io/privacy_policy">RAWG Privacy Policy</ExternalLink>.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Better Auth</span>: The
                            authentication layer that manages sign-in, sessions and the session
                            cookie. It runs within DigiDisc and stores its data in our own Neon
                            database rather than sending it elsewhere.
                        </li>
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Vercel</span>: Hosting
                            and delivery of the DigiDisc application. See the{ " " }
                            <ExternalLink href="https://vercel.com/legal/privacy-policy">Vercel Privacy
                                Policy</ExternalLink>.
                        </li>
                    </ul>
                </Section>

                <Section title="Use of AI during development">
                    <p>
                        AI tools were used during the development of DigiDisc to help with
                        planning, brainstorming and writing small code components. This assistance happened while
                        building the site, AI is not part of the live service, does not run on
                        your data, and your clips, account details and activity are not sent to
                        any AI system or used to train AI models. No icons, font or art to Ariadne's knowledge were
                        created with generative AI. Ariadne is also a qualified software engineer
                        with practical experience for fullstack development, and uses AI in a responsible way.
                    </p>
                </Section>

                <Section title="Data retention &amp; deletion">
                    <p>
                        DigiDisc keep your data for as long as your account exists so the site keeps
                        working for you.
                    </p>
                    <ul className="list-disc pl-5 flex flex-col gap-1.5">
                        <li>
                            <span className="font-semibold text-dark-100 dark:text-pink-10">Your uploads are not deleted automatically.</span>{ " " }
                            A clip stays on DigiDisc until <span className="italic">you</span> delete
                            that video yourself, or until you delete your account.
                        </li>
                        <li>
                            Deleting a clip removes the video and its thumbnail from our storage
                            provider and its record from our database.
                        </li>
                        <li>
                            Deleting your account removes your associated clips, likes, sessions
                            and account records.
                        </li>
                    </ul>
                </Section>

                <Section title="Your choices &amp; rights">
                    <p>
                        You can control your presence on DigiDisc at any time: change a clip&apos;s
                        visibility between public and private, delete individual clips, or delete
                        your account entirely. Depending on where you live, you may also have the
                        right to access, correct or export your data, reach out through{ " " }
                        <ExternalLink href="mailto:ariadnevk21@gmail.com">arialovelace21@gmail.com</ExternalLink>
                        { " " } and I&apos;ll help.
                    </p>
                </Section>

                <Section title="Children">
                    <p>
                        DigiDisc is not intended for children under 13, and DigiDisc does not knowingly
                        collect personal information from them.
                    </p>
                </Section>

                <Section title="Changes to this policy">
                    <p>
                        I may update this policy as DigiDisc evolves. When it does, I&apos;ll change
                        the &quot;last updated&quot; date at the top of this page.
                    </p>
                </Section>
            </div>
        </main>
    )
}

export default Page
