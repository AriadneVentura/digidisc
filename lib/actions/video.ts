// Has to be secure.
"use server";

import { apiFetch, doesTitleMatch, getEnv, getOrderByClause, withErrorHandling } from "@/lib/utils";
import { headers } from "next/dist/server/request/headers";
import { auth } from "@/lib/auth";
import { BUNNY } from "@/constants";
import { db } from "@/src";
import { user, videos } from "@/src/db/schema";
import { revalidatePath } from "next/cache";
import { fixedWindow } from "arcjet";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

// Call constants to form API endpoints.
const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv( "BUNNY_LIBRARY_ID" );
const ACCESS_KEYS = {
    streamAccessKey: getEnv( "BUNNY_STREAM_ACCESS_KEY" ),
    storageAccessKey: getEnv( "BUNNY_STORAGE_ACCESS_KEY" ),
}

// Helpers
const getSessionUserId = async (): Promise<string> => {
    const session = await auth.api.getSession( { headers: await headers() } );
    if ( !session ) throw new Error( "Unauthenticated" );

    return session.user.id;
}

const revalidatePaths = ( paths: string[] ) => {
    paths.forEach( ( path ) => revalidatePath( path ) )
}

const buildVideoWithUserQuery = () => {
    return db
        .select( {
            video: videos,
            user: { id: user.id, name: user.name, image: user.image }
        } )
        .from( videos )
        .leftJoin( user, eq( videos.userId, user.id ) )
}

// Validator function to rate limit server actions.
const validateWithArcjet = async ( fingerprint: string ) => {
    // A fingerprint allows us to connect us to who is the actor of the request
    const rateLimit = aj.withRule(
        fixedWindow( {
            mode: "LIVE",
            // Time window
            window: "1m",
            // Max requests per time window
            max: 1,
            characteristics: [ "fingerprint" ]
        } )
    )

    const req = await request();

    const decision = await rateLimit.protect( req, { fingerprint } );
    if ( decision.isDenied() ) {
        throw new Error( "Rate limit exceeded" )
    }
}

// Server actions
export const getVideoUploadUrl = withErrorHandling( async () => {
    await getSessionUserId();

    const videoResponse = await apiFetch<BunnyVideoResponse>(
        `${ VIDEO_STREAM_BASE_URL }/${ BUNNY_LIBRARY_ID }/videos`, {
            method: "POST",
            bunnyType: "stream",
            body: { title: "Temp", collectionId: "" }
        } );

    const uploadUrl = `${ VIDEO_STREAM_BASE_URL }/${ BUNNY_LIBRARY_ID }/videos/${ videoResponse.guid }`;

    return {
        videoId: videoResponse.guid,
        uploadUrl,
        accessKey: ACCESS_KEYS.streamAccessKey,
    }

} );

export const getThumbnailUploadUrl = withErrorHandling( async ( videoId: string ) => {
    const fileName = `${ Date.now() }-${ videoId }-thumbnail`;
    const uploadUrl = `${ THUMBNAIL_STORAGE_BASE_URL }/thumbnails/${ fileName }`;
    const cdnUrl = `${ THUMBNAIL_CDN_URL }/thumbnails/${ fileName }`;

    return {
        uploadUrl,
        cdnUrl,
        accessKey: ACCESS_KEYS.storageAccessKey,
    }
} );

export const saveVideoDetails = withErrorHandling( async ( videoDetails: VideoDetails ) => {
    const userId = await getSessionUserId();
    // Rate limit
    await validateWithArcjet( userId );

    // Use video details to update the descriptions and title of video.
    await apiFetch(
        `${ VIDEO_STREAM_BASE_URL }/${ BUNNY_LIBRARY_ID }/videos/${ videoDetails.videoId }`,
        {
            method: "POST",
            bunnyType: "stream",
            body: {
                title: videoDetails.title,
                description: videoDetails.description,
            }
        }
    )

    await db.insert( videos ).values( {
        ...videoDetails,
        videoUrl: `${ BUNNY.EMBED_URL }/${ BUNNY_LIBRARY_ID }/${ videoDetails.videoId }`,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
    } );

    // Revalidate the homepage after insertion of new video.
    revalidatePaths( [ '/' ] )
    return { videoId: videoDetails.videoId }
} )

export const getAllVideos = withErrorHandling( async (
        searchQuery: string = '',
        sortFilter?: string,
        pageNumber: number = 1,
        pageSize: number = 8,
    ) => {
        const session = await auth.api.getSession( { headers: await headers() } )
        const currentUserId = session?.user.id;

        const canSeeTheVideos = or(
            eq( videos.visibility, 'public' ),
            eq( videos.userId, currentUserId! ),
        );

        const whereCondition = searchQuery.trim()
            ? and(
                canSeeTheVideos,
                doesTitleMatch( videos, searchQuery ),
            )
            : canSeeTheVideos

        // Count total for pagination
        const [ { totalCount } ] = await db
            .select( { totalCount: sql<number>`count(*)` } )
            .from( videos )
            .where( whereCondition );
        const totalVideos = Number( totalCount || 0 );
        const totalPages = Math.ceil( totalVideos / pageSize );

        // Fetch paginated, sorted results
        const videoRecords = await buildVideoWithUserQuery()
            .where( whereCondition )
            .orderBy(
                sortFilter
                    ? getOrderByClause( sortFilter )
                    // my ide is formatting this as weird and dont look at me cause ceebs finding the specific rule
                    // that fixes it <3 if you find it lmk.
                    : sql`${ videos.createdAt }
                        DESC`
            )
            .limit( pageSize )
            .offset( (pageNumber - 1) * pageSize );

        return {
            videos: videoRecords,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalVideos,
                pageSize,
            },
        };
    }
);

export const getVideoById = withErrorHandling( async ( videoId: string ) => {
    const [ videoRecord ] = await buildVideoWithUserQuery()
        // Get the specific video
        .where( eq( videos.id, videoId ) )

    return videoRecord
} )

// Just get the videos by the logged in videos.
export const getAllVideosByUser = withErrorHandling(
    async (
        userIdParameter: string,
        searchQuery: string = "",
        sortFilter?: string
    ) => {
        const currentUserId = (
            await auth.api.getSession( { headers: await headers() } )
        )?.user.id;
        const isOwner = userIdParameter === currentUserId;

        const [ userInfo ] = await db
            .select( {
                id: user.id,
                name: user.name,
                image: user.image,
                email: user.email,
            } )
            .from( user )
            .where( eq( user.id, userIdParameter ) );
        if ( !userInfo ) throw new Error( "User not found" );

        const conditions = [
            // Only return the videos that match the user
            eq( videos.userId, userIdParameter ),
            // Or if they are not the owner if its public
            !isOwner && eq( videos.visibility, "public" ),
            // ilike is case insensitive comparison
            searchQuery.trim() && ilike( videos.title, `%${ searchQuery }%` ),
        ].filter( Boolean ) as any[];

        const userVideos = await buildVideoWithUserQuery()
            .where( and( ...conditions ) )
            .orderBy(
                sortFilter ? getOrderByClause( sortFilter ) : desc( videos.createdAt )
            );

        return { user: userInfo, videos: userVideos, count: userVideos.length };
    }
);