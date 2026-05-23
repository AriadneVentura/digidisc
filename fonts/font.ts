import localFont from "next/font/local";

export const satoshi = localFont( {
    src: [
        {
            path: "./Satoshi-Light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "./Satoshi-Regular.woff2",
            weight: "400",
            style: "normal",
        },
    ],
    variable: "--font-satoshi",
    preload: false,
    display: 'swap',
} );

export const star_crush = localFont( {
    src: [
        {
            path: "./Star-Crush.woff2",
            style: "normal",
        },
    ],
    variable: "--font-star-crush",
    preload: false,
    display: 'swap',
} );

export const unifontexmono = localFont( {
    src: [
        {
            path: "./UnifontExMono.woff2",
            style: "normal",
        },
    ],
    variable: "--font-unifonexmono",
    preload: false,
    display: 'swap',
} );

export const magasans = localFont( {
    src: [
        {
            path: "./maga-sans.woff2",
            style: "normal",
        },
    ],
    variable: "--font-magasans",
    preload: false,
    display: 'swap',
} );

export const minecraft = localFont( {
    src: [
        {
            path: "./Minecraft.woff2",
            style: "normal",
        },
    ],
    variable: "--font-minecraft",
    preload: false,
    display: 'swap',
} );
