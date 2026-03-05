import { NextRequest, NextResponse } from "next/server";
import aj, { createMiddleware, detectBot, shield } from "./lib/arcjet";

const validate = aj
    // Shield protects against the most common attacks from the OWASP top 10, before any page is called.
    .withRule( shield( { mode: "LIVE" } ) )
    .withRule(
        detectBot( {
            mode: "LIVE",
            allow: [ "CATEGORY:SEARCH_ENGINE", "G00G1E_CRAWLER" ],
        } )
    );

// Route protection for Next.js that runs on every request.
export default createMiddleware( validate, async ( request: NextRequest ) => {
    // Check if the user has a session by looking at cookies in headers
    const sessionCookie = request.cookies.get( "better-auth.session_token" );

    if ( !sessionCookie ) {
        return NextResponse.redirect( new URL( "/sign-in", request.url ) );
    }

    // Continue normally if logged in.
    return NextResponse.next();
} );

// This ensures that the middleware is not applied for the below.
export const config = {
    matcher: [ "/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)" ],
};