import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { auth } from "@/lib/auth";
import { headers } from "next/dist/server/request/headers";
import { detectBot, shield } from "arcjet";
import aj from "@/lib/arcjet";
import { createMiddleware } from "@arcjet/next";

// Route protection for Next.js that runs on every request.
export async function middleware( request: NextRequest, response: NextResponse ) {
    const session = await auth.api.getSession( {
        // Check if the user has a session by looking at cookies in headers
        headers: await headers(),
    } );

    if ( !session ) {
        return NextResponse.redirect( new URL( '/sign-in', request.url ) );
    }

    // TODO make navigate function that directs you home if youre logged in and try to go sign in.

    // Continue normally if logged in.
    return NextResponse.next();
}

// Shield protects against the most common attacks from the OWASP top 10, before any page is called.
const validate = aj
    .withRule( shield( { mode: "LIVE" } ) )
    .withRule( detectBot( { mode: "LIVE", allow: [ "CATEGORY:SEARCH_ENGINE", "G00G1E_CRAWLER" ] } ) );

// This automatically turns on shield protection heheha.
export default createMiddleware( validate );

// This ensures that the middleware is not applied for the below.
export const config = {
    matcher: [ "/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)" ],
};
