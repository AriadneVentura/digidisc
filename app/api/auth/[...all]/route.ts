import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { ArcjetDecision, slidingWindow, validateEmail } from "arcjet";
import aj from "@/lib/arcjet";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import ip from "@arcjet/ip";

// Email validation
const emailValidation = aj.withRule( validateEmail( {
    mode: "LIVE",
    // disallow spam emails or unverified emails or temp emails
    deny: [ "DISPOSABLE", "INVALID", "NO_MX_RECORDS" ]
} ) )

// Rate limit sliding window which prevents a burst of requests and then nothing.
const rateLimit = aj.withRule( slidingWindow( {
    mode: "LIVE",
    interval: "2m",
    // Only allowed to log in twice
    max: 2,
    characteristics: [ "fingerprint" ]
} ) )

const protectedAuth = async ( req: NextRequest ): Promise<ArcjetDecision> => {
    const session = await auth.api.getSession( { headers: req.headers } );

    let userId: string;

    if ( session?.user?.id ) {
        userId = session.user.id;
    } else {
        // default ip that arcjet uses if no other is provided.
        userId = ip( req ) || "127.0.0.1";
    }

    // User trying to log in
    if ( req.nextUrl.pathname.startsWith( "/api/auth/sign-in" ) ) {
        const body = await req.clone().json();

        if ( typeof body.email === "string" ) {
            return emailValidation.protect( req, { email: body.email } );
        }
    }

    return rateLimit.protect( req, { fingerprint: userId } );
}

const authHandlers = toNextJsHandler( auth.handler );

export const { GET } = authHandlers;

// Secure authentication with email validation, rate limiting and common malicious attacks.
export const POST = async ( req: NextRequest ) => {
    const decision = await protectedAuth( req );
    if ( decision.isDenied() ) {
        if ( decision.reason.isEmail() ) {
            throw new Error( "Email validation failed." );
        }

        if ( decision.reason.isRateLimit() ) {
            throw new Error( "Rate limit exceeded." )
        }

        if ( decision.reason.isShield() ) {
            throw new Error( "Shield turned on, protected against malicious actions." )
        }
    }

    return authHandlers.POST( req );
}