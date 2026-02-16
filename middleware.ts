import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { auth } from "@/lib/auth";
import { headers } from "next/dist/server/request/headers";

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

// This ensures that the middleware is not applied for the below.
export const config = {
    matcher: [ "/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)" ],
};
