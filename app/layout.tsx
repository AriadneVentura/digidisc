import type { Metadata } from "next";
import "./globals.css";
import { magasans, minecraft, satoshi, star_crush, unifontexmono } from "@/fonts/font";
import { Providers } from "@/components/ThemeProvider";
import { FontProvider } from "@/components/FontProvider";
import { GifProvider } from "@/components/GifProvider";
import NavigationStart from "@/components/NavigationStart";
import React from "react";

export const metadata: Metadata = {
    metadataBase: new URL( "https://digidisc.tv" ),

    title: "DigiDisc",
    description: "View, upload & share gaming clips n giggle",
    icons: {
        icon: "/assets/icons/pxldvd.svg",
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
        <html suppressHydrationWarning>
        <body
            className={ `
                ${ satoshi.variable }  
                ${ star_crush.variable }  
                ${ unifontexmono.variable } 
                ${ magasans.variable } 
                ${ minecraft.variable } 
                `
            }
        >
        <Providers>
            <GifProvider>
                <FontProvider>
                    <NavigationStart/>
                    { children }
                </FontProvider>
            </GifProvider>
        </Providers>
        </body>
        </html>
    );
}
