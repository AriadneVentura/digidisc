import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { satoshi } from "../fonts/font";

const geistKarla = Karla( {
    variable: "--font-geist-karla",
    subsets: [ "latin" ],
} );

export const metadata: Metadata = {
    metadataBase: new URL( "https://digidisc.tv" ),

    title: "DigiDisc",
    description: "View & upload clips n giggle",
    icons: {
        icon: "/assets/icons/cd.svg",
    },
    openGraph: {
        title: "DigiDisc",
        description: "View & upload clips n giggle",
        images: [ "/og.png" ],
    },
    twitter: {
        card: "summary_large_image",
        images: [ "/og.png" ],
    },
};

export default function Layout( {
                                    children,
                                }: Readonly<{
    children: React.ReactNode;
}> ) {
    return (
        <html lang="en">
        <body
            className={ `${ geistKarla.variable } ${ satoshi.variable } font-karla antialiased` }
        >
        { children }
        </body>
        </html>
    );
}
