import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

// NTS: 1.1MB middleware :( vercel doesnt allow
// // Shield protects against the most common attacks from the OWASP top 10, before any page is called.
// const validate = aj
//     .withRule( shield( { mode: "LIVE" } ) )
//     .withRule( detectBot( { mode: "LIVE", allow: [ "CATEGORY:SEARCH_ENGINE", "G00G1E_CRAWLER" ] } ) );

// Route protection for Next.js that runs on every request.
export default async function proxy( request: NextRequest ) {
    // Check if the user has a session by looking at cookies in headers
    const session = await auth.api.getSession({
        headers: await headers()
    })    
    const { pathname } = request.nextUrl;

    const isLoggedIn = !!session;
    const isAuthPage = pathname === "/sign-in";

    // Redirect user to sign in if not logged in.
    if ( !isLoggedIn && !isAuthPage ) {
        return NextResponse.redirect( new URL( "/sign-in", request.url ) );
    }

    // If logged in but trying to get to sign in then return to home page.
    if ( isLoggedIn && isAuthPage ) {
        return NextResponse.redirect( new URL( "/", request.url ) );
    }

    return NextResponse.next();
}

// This ensures that the middleware is not applied for the below.
export const config = {
    matcher: [ "/((?!api|_next/static|_next/image|favicon.ico|assets).*)" ],
};