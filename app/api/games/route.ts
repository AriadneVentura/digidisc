import { NextRequest, NextResponse } from "next/server";

// dont want to expose the RAWG environment variable to the web, so here I proxy the request through a Next.js
// API route instead, so the key stays server-side only.
export const GET = async ( req: NextRequest ) => {
    const query = req.nextUrl.searchParams.get( "query" );

    if ( !query || query.length < 2 ) {
        return NextResponse.json( { results: [] } );
    }

    const res = await fetch(
        `https://api.rawg.io/api/games?key=${ process.env.RAWG_API_KEY }&search=${ encodeURIComponent( query ) }&page_size=8`
    );

    const data = await res.json();

    return NextResponse.json( { results: data.results ?? [] } );
};