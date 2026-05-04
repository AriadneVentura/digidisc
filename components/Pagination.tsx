"use client";
import { cn, generateMobilePagination, generatePagination, updateURLParams } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const useIsMaxSm = () => {
    const [ isMaxSm, setIsMaxSm ] = useState( false );

    useEffect( () => {
        const mediaQuery = window.matchMedia( "(max-width: 639px)" );
        setIsMaxSm( mediaQuery.matches );

        const handler = ( e: MediaQueryListEvent ) => setIsMaxSm( e.matches );
        mediaQuery.addEventListener( "change", handler );
        return () => mediaQuery.removeEventListener( "change", handler );
    }, [] );

    return isMaxSm;
};

const Pagination = ( {
                         currentPage = 1,
                         totalPages = 10,
                         queryString = "",
                         filterString = "",
                         basePath = "/",
                     }: PaginationProps ) => {
    const isMaxSm = useIsMaxSm();

    const pages = useMemo(
        () =>
            isMaxSm
                ? generateMobilePagination( currentPage, totalPages )
                : generatePagination( currentPage, totalPages ),
        [ isMaxSm, currentPage, totalPages ]
    );

    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageUrl = ( pageNumber: number ) => {
        return updateURLParams(
            searchParams,
            {
                page: pageNumber.toString(),
                query: queryString?.trim() || null,
                filter: filterString || null,
            },
            basePath
        );
    };

    const navigateToPage = ( pageNumber: number ) => {
        if ( pageNumber < 1 || pageNumber > totalPages ) return;
        router.push( createPageUrl( pageNumber ) );
    };

    return (
        <section className="pagination">
            <button
                onClick={ () => navigateToPage( currentPage - 1 ) }
                className={ cn( "nav-button", {
                    "pointer-events-none opacity-50": currentPage === 1,
                } ) }
                disabled={ currentPage === 1 }
                aria-disabled={ currentPage === 1 }
            >
                <Image
                    src="/assets/icons/arrow-left.svg"
                    alt="Previous"
                    width={ 16 }
                    height={ 16 }
                    className="filter-dark"
                />
                <p className="max-sm:hidden">Previous</p>
            </button>

            <div>
                { pages.map( ( page, index ) =>
                    page === "..." ? (
                        <span key={ `ellipsis-${ index }` }>...</span>
                    ) : (
                        <button
                            key={ `page-${ page }` }
                            onClick={ () => navigateToPage( page as number ) }
                            className={ cn( {
                                "bg-pink-100 text-white dark:bg-pink-150 dark:text-dark-100": currentPage === page,
                            } ) }
                        >
                            { page }
                        </button>
                    )
                ) }
            </div>

            <button
                onClick={ () => navigateToPage( currentPage + 1 ) }
                className={ cn( "nav-button", {
                    "pointer-events-none opacity-50": currentPage === totalPages,
                } ) }
                disabled={ currentPage === totalPages }
                aria-disabled={ currentPage === totalPages }
            >
                <p className="max-sm:hidden">Next</p>
                <Image
                    src="/assets/icons/arrow-right.svg"
                    alt="next"
                    width={ 16 }
                    height={ 16 }
                    className="filter-dark"
                />
            </button>
        </section>
    );
};

export default Pagination;