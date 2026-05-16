// Has to be secure.
"use server";

import { apiFetch, doesTitleMatch, getEnv, getOrderByClause, withErrorHandling } from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BUNNY, PAGE_SIZE } from "@/constants";
import { db } from "@/src";
import { tags, user, videoLikes, videos, videoTags } from "@/src/db/schema";
import { revalidatePath } from "next/cache";
import { fixedWindow } from "arcjet";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";

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
const validateActionWithArcjet = async ( fingerprint: string ) => {
    const rateLimit = aj.withRule(
        fixedWindow( {
            mode: "LIVE",
            window: "1m",
            // max 20 actions per minute per user (20 likes per min etc)
            max: 10,
            // Allows us to know who the actor is
            characteristics: [ "fingerprint" ]
        } )
    )

    const req = await request();

    const decision = await rateLimit.protect( req, { fingerprint } );

    if ( decision.isDenied() ) {
        throw new Error( "Rate limit exceeded" );
    }
}

// Validator function to rate limit server upload actions.
const validateUploadWithArcjet = async ( fingerprint: string ) => {
    const rateLimit = aj.withRule(
        fixedWindow( {
            mode: "LIVE",
            window: "10m",
            // max 5 uploads per 10 minutes per user
            max: 5,
            characteristics: [ "fingerprint" ]
        } )
    )

    const req = await request();

    const decision = await rateLimit.protect( req, { fingerprint } );

    if ( decision.isDenied() ) {
        throw new Error( "Upload rate limit exceeded" );
    }
}

// Server actions
export const getVideoUploadUrl = withErrorHandling( async () => {
    const userId = await getSessionUserId();

    // Protect upload generation
    await validateUploadWithArcjet( userId );

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

export const getThumbnailUploadUrl = withErrorHandling( async ( videoId: string, extension: string ) => {
    const fileName = `${ Date.now() }-${ videoId }-thumbnail.${ extension }`;
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
    await validateUploadWithArcjet( userId );

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

    // Save tags if any were provided
    if ( videoDetails.tags && videoDetails.tags.length > 0 ) {
        // Insert tag if it doesn't exist or return existing tag id if it does exist
        const tagRecords = await Promise.all(
            videoDetails.tags.map( ( tagName ) =>
                db
                    .insert( tags )
                    .values( { name: tagName.toLowerCase().trim() } )
                    .onConflictDoUpdate( {
                        target: tags.name,
                        // no-op update, just to return the id
                        // required because onConflictDoUpdate in w drizzle
                        // requires a set, to return the row.
                        set: { name: tagName.toLowerCase().trim() }
                    } )
                    .returning( { id: tags.id } )
            )
        );

        // Insert into video_tags join table
        await db.insert( videoTags ).values(
            tagRecords.map( ( [ tag ] ) => ({
                videoId: videoDetails.videoId,
                tagId: tag.id,
            }) )
        );
    }

    revalidatePaths( [ '/' ] )
    return { videoId: videoDetails.videoId }
} )

export const getAllVideos = withErrorHandling( async (
        searchQuery: string = '',
        sortFilter?: string,
        pageNumber: number = 1,
        pageSize: number = PAGE_SIZE,
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


export const deleteVideoById = withErrorHandling( async ( id: string, videoId: string, thumbnailUrl: string ) => {
        const userId = await getSessionUserId();

        if ( !userId ) {
            throw new Error( "Unauthorised nerd" );
        }

        await validateActionWithArcjet( id );

        // Delete data from bunny
        await apiFetch(
            `${ VIDEO_STREAM_BASE_URL }/${ BUNNY_LIBRARY_ID }/videos/${ videoId }`,
            { method: "DELETE", bunnyType: "stream" }
        );

        const thumbnailPath = thumbnailUrl.split( "thumbnails/" )[1];
        await apiFetch(
            `${ THUMBNAIL_STORAGE_BASE_URL }/thumbnails/${ thumbnailPath }`,
            { method: "DELETE", bunnyType: "storage", expectJson: false }
        );

        // delete from neon db
        const result = await db
            .delete( videos )
            .where(
                and(
                    eq( videos.id, id ),
                    eq( videos.userId, userId )
                )
            )
            .returning( { id: videos.id } );

        if ( result.length === 0 ) {
            throw new Error( "Clip not found or not authorised to delete" );
        }

        // Redirect
        revalidatePaths( [ "/", `/video/${ videoId }` ] );
    }
);

// Change the video visibility
export const updateVideoVisibility = withErrorHandling( async (
        videoId: string,
        visibility: Visibility
    ) => {
        await validateActionWithArcjet( videoId );
        await db
            .update( videos )
            .set( { visibility, updatedAt: new Date() } )
            .where( eq( videos.videoId, videoId ) );

        // This lets Next.js know that the data for the route has changed and it needs an update.
        revalidatePaths( [ "/", `/video/${ videoId }` ] );
        return {};
    }
);

export const generateClipImage = withErrorHandling( async ( videoId: string ) => {
    const result = await db
        .select( {
            title: videos.title,
            thumbnail: videos.thumbnailUrl,
            author: user.name,
        } )
        .from( videos )
        .innerJoin( user, eq( videos.userId, user.id ) )
        .where( eq( videos.id, videoId ) )

    return result[0]
} )

export const incrementViewCount = withErrorHandling(
    async ( videoId: string ) => {
        await db
            .update( videos )
            .set( {
                views: sql`${ videos.views }
                + 1`, updatedAt: new Date()
            } )
            .where( eq( videos.videoId, videoId ) );

        return {};
    }
);

export const hasUserLikedClip = withErrorHandling( async ( videoId: string ) => {
    const session = await auth.api.getSession( { headers: await headers() } );
    if ( !session ) return [ { hasLiked: false } ];

    const userId = session.user.id;

    return (
        await db.select( {
            hasLiked: sql<boolean>`
                EXISTS (
                    SELECT 1
                    FROM video_likes
                    WHERE video_likes.video_id =
                ${ videoId }
                AND
                video_likes
                .
                user_id
                =
                ${ userId }
                )
            `,
        } )
            .from( videos )
            .where( eq( videos.id, videoId ) )
            .limit( 1 )
    )
} );

export const toggleLike = withErrorHandling( async ( videoId: string ) => {
    const userId = await getSessionUserId();
    if ( !userId ) throw new Error( "Unauthorized" );

    await validateActionWithArcjet( videoId );

    const existing = await db
        .select()
        .from( videoLikes )
        .where(
            and(
                eq( videoLikes.videoId, videoId ),
                eq( videoLikes.userId, userId )
            )
        )
        .limit( 1 );

    if ( existing.length > 0 ) {
        await db
            .delete( videoLikes )
            .where(
                and(
                    eq( videoLikes.videoId, videoId ),
                    eq( videoLikes.userId, userId )
                )
            );

        await db
            .update( videos )
            .set( {
                likes: sql`${ videos.likes }
                - 1`,
                updatedAt: new Date(),
            } )
            .where( eq( videos.id, videoId ) );
    } else {
        await db.insert( videoLikes ).values( {
            videoId,
            userId,
        } );

        await db
            .update( videos )
            .set( {
                likes: sql`${ videos.likes }
                + 1`,
                updatedAt: new Date(),
            } )
            .where( eq( videos.id, videoId ) );
    }

    revalidatePaths( [ "/", `/video/${ videoId }` ] );
} );

// Just get the videos by the logged in videos.
export const getAllVideosByUser = withErrorHandling(
    async (
        userIdParameter: string,
        searchQuery: string = "",
        sortFilter?: string,
        pageNumber: number = 1,
        pageSize: number = PAGE_SIZE,
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

        // Count total for pagination
        const [ { totalCount } ] = await db
            .select( { totalCount: sql<number>`count(*)` } )
            .from( videos )
            .where( and( ...conditions ) );

        const totalVideos = Number( totalCount || 0 );
        const totalPages = Math.ceil( totalVideos / pageSize );

        const userVideos = await buildVideoWithUserQuery()
            .where( and( ...conditions ) )
            .orderBy(
                sortFilter ? getOrderByClause( sortFilter ) : desc( videos.createdAt )
            )
            .limit( pageSize )
            .offset( (pageNumber - 1) * pageSize );

        return {
            user: userInfo,
            videos: userVideos,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalVideos,
                pageSize,
            },
        };
    }
);


/**
 * Returns up to 4 suggested videos for a given video.
 * Priority slots:
 *  1. Same game (gameSlug)
 *  2. Shares a tag
 *  3. Same author (userId)
 *  4. Random
 *
 * Each slot fills independently, duplicates are deduplicated, and the
 * result always contains at most 4 entries.
 */
export const getSuggestedVideos = withErrorHandling(
    async (
        videoId: string,
        gameSlug?: string | null,
        userId?: string,
        videoDbId?: string,
    ) => {
        const onlyPublic = eq( videos.visibility, "public" );

        // Grows as each slot is filled — next query automatically excludes prior picks
        const excludedIds: string[] = videoDbId ? [ videoDbId ] : [];

        // Re-built before every query so exclusions are always current
        const buildWhere = ( extra?: ReturnType<typeof eq> | ReturnType<typeof and> ) =>
            and( onlyPublic, ...excludedIds.map( id => ne( videos.id, id ) ), extra );

        const flatten = ( record: RawVideoWithUser, reason: string ) => ({
            video: record.video,
            user: record.user,
            reason,
        });

        // 1. Same game
        let sameGame: RawVideoWithUser | null = null;

        if ( gameSlug ) {
            const [ result ] = await buildVideoWithUserQuery()
                .where( buildWhere( eq( videos.gameSlug, gameSlug ) ) )
                .orderBy( sql`RANDOM
                ()` )
                .limit( 1 );

            if ( result ) {
                sameGame = result;
                excludedIds.push( result.video.id );
            }
        }

        // 2. Shared tag
        let sharedTag: RawVideoWithUser | null = null;

        if ( videoDbId ) {
            const tagRows = await db
                .select( { tagId: videoTags.tagId } )
                .from( videoTags )
                .where( eq( videoTags.videoId, videoDbId ) );

            const tagIds = tagRows.map( r => r.tagId );

            if ( tagIds.length > 0 ) {
                const [ result ] = await buildVideoWithUserQuery()
                    .innerJoin( videoTags, eq( videoTags.videoId, videos.id ) )
                    .where( buildWhere( inArray( videoTags.tagId, tagIds ) ) )
                    .orderBy( sql`RANDOM
                    ()` )
                    .limit( 1 );

                if ( result ) {
                    sharedTag = result;
                    excludedIds.push( result.video.id );
                }
            }
        }

        // 3. Same author
        let sameAuthor: RawVideoWithUser | null = null;

        if ( userId ) {
            const [ result ] = await buildVideoWithUserQuery()
                .where( buildWhere( eq( videos.userId, userId ) ) )
                .orderBy( sql`RANDOM
                ()` )
                .limit( 1 );

            if ( result ) {
                sameAuthor = result;
                excludedIds.push( result.video.id );
            }
        }

        // 4. Random
        const [ randomVideo ] = await buildVideoWithUserQuery()
            .where( buildWhere() )
            .orderBy( sql`RANDOM
            ()` )
            .limit( 1 );

        return [
            sameGame ? flatten( sameGame, "Same Game" ) : null,
            sharedTag ? flatten( sharedTag, "Similar Tag" ) : null,
            sameAuthor ? flatten( sameAuthor, "Same Creator" ) : null,
            randomVideo ? flatten( randomVideo, "Dice Roll" ) : null,
        ].filter( Boolean ) as SuggestedVideo[];
    }
);

type RawVideoWithUser = Awaited<ReturnType<typeof buildVideoWithUserQuery>>[number];

export type SuggestedVideo = {
    video: RawVideoWithUser["video"];
    user: RawVideoWithUser["user"];
    reason: string;
};

export const getVideoTags = withErrorHandling( async (
    videoId: string ): Promise<string[]> => {
    const rows = await db
        .select( { name: tags.name } )
        .from( videoTags )
        .innerJoin( tags, eq( videoTags.tagId, tags.id ) )
        .where( eq( videoTags.videoId, videoId ) );

    return rows.map( ( row ) => row.name );
} );
