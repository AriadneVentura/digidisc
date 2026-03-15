import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { satoshi } from "../fonts/font";
import { Providers } from "@/components/ThemeProvider";

const geistKarla = Karla( {
    variable: "--font-geist-karla",
    subsets: [ "latin" ],
} );

export const metadata: Metadata = {
    metadataBase: new URL( "https://digidisc.tv" ),

    title: "DigiDisc",
    description: "View, upload & share gaming clips n giggle",
    icons: {
        icon: "/assets/icons/cd.svg",
    },
    openGraph: {
        title: "DigiDisc",
        description: "View, upload & share gaming clips n giggle",
        images: [ "/assets/images/og.png" ],
    },
    twitter: {
        card: "summary_large_image",
        images: [ "/assets/images/og.png" ],
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
        <Providers>{ children }</Providers>
        </body>
        </html>
    );
}
