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
        {
            path: "./Satoshi-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./Satoshi-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "./Satoshi-Black.woff2",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-satoshi",
} );

export const star_crush = localFont( {
    src: [
        {
            path: "./Star-Crush.woff2",
            style: "normal",
        },
    ],
    variable: "--font-star-crush",
} );

export const unifontexmono = localFont( {
    src: [
        {
            path: "./UnifontExMono.woff2",
            style: "normal",
        },
    ],
    variable: "--font-unifonexmono",
} );

export const magasans = localFont( {
    src: [
        {
            path: "./maga-sans.woff2",
            style: "normal",
        },
    ],
    variable: "--font-magasans",
} );

export const minecraft = localFont( {
    src: [
        {
            path: "./Minecraft.woff2",
            style: "normal",
        },
    ],
    variable: "--font-minecraft",
} );
