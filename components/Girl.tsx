'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface GirlCharacterProps {
    baseImage: string
    pupilImage: string
    blinkImage: string
    width?: number
    height?: number
    maxOffset?: number
    lerpFactor?: number
    className?: string
}

export default function GirlCharacter( {
                                           baseImage,
                                           pupilImage,
                                           blinkImage,
                                           width = 200,
                                           height = 280,
                                           maxOffset = 6,
                                           lerpFactor = 0.13,
                                           className = '',
                                       }: GirlCharacterProps ) {
    const sceneRef = useRef<HTMLDivElement>( null )
    const pupilRef = useRef<HTMLImageElement>( null )
    const targetRef = useRef( { x: 0, y: 0 } )
    const currentRef = useRef( { x: 0, y: 0 } )
    const rafRef = useRef<number | null>( null )
    const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>( null )
    const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>( null )

    const [ isActive, setIsActive ] = useState( false )
    const [ isBlinking, setIsBlinking ] = useState( false )

    const handleClick = useCallback( () => {
        setIsActive( true )

        // Clear any previous timer so clicks refresh the 5s duration
        if ( activeTimerRef.current ) clearTimeout( activeTimerRef.current )

        activeTimerRef.current = setTimeout( () => {
            // Disable tracking after timeout
            setIsActive( false )

            // Reset eyes back to neutral position
            targetRef.current = { x: 0, y: 0 }
        }, 5000 )
    }, [] )


    // Track mouse movement and calculate where the pupils should look
    const handleMouseMove = useCallback( ( e: MouseEvent ) => {
        // Don't track unless activated
        if ( !isActive ) return

        const scene = sceneRef.current
        if ( !scene ) return

        // Get scene position/size on screen
        const rect = scene.getBoundingClientRect()

        // Find center point of the face
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        // Distance from center to mouse
        const dx = e.clientX - cx
        const dy = e.clientY - cy

        // Total distance from center
        const dist = Math.sqrt( dx * dx + dy * dy )

        // Clamp movement so pupils never move too far
        const scale = Math.min( dist, maxOffset ) / (dist || 1)

        // Store target eye position
        // Y movement is reduced to look less weird
        targetRef.current = {
            x: dx * scale,
            y: dy * scale * 0.35,
        }
    }, [ isActive, maxOffset ] )


    // Add/remove global mousemove listener
    useEffect( () => {
        window.addEventListener( 'mousemove', handleMouseMove )

        return () =>
            window.removeEventListener( 'mousemove', handleMouseMove )
    }, [ handleMouseMove ] )


    // Animate pupils toward target position
    useEffect( () => {
        const animate = () => {
            const cur = currentRef.current
            const tgt = targetRef.current

            // Linear interpolation (lerp) allows smoothness instead of snapping
            cur.x += (tgt.x - cur.x) * lerpFactor
            cur.y += (tgt.y - cur.y) * lerpFactor

            // Apply to pupil image
            if ( pupilRef.current ) {
                pupilRef.current.style.transform =
                    `translate(${ cur.x.toFixed( 2 ) }px, ${ cur.y.toFixed( 2 ) }px)`
            }

            // Continue animation loop
            rafRef.current = requestAnimationFrame( animate )
        }

        // Start animation loop
        rafRef.current = requestAnimationFrame( animate )

        // Cleanup animation frame on unmount
        return () => {
            if ( rafRef.current )
                cancelAnimationFrame( rafRef.current )
        }
    }, [ lerpFactor ] )


    // Cleanup active timer when component unmounts
    useEffect( () => {
        return () => {
            if ( activeTimerRef.current )
                clearTimeout( activeTimerRef.current )
        }
    }, [] )


    const doSingleBlink = useCallback( ( onDone?: () => void ) => {
        setIsBlinking( true )

        setTimeout( () => {
            setIsBlinking( false )

            // Optionally run code after
            // (used for scheduling n double blinks)
            onDone?.()
        }, 220 )
    }, [] )


    // Stores the recursive blink scheduler function
    const scheduleNextBlink = useRef<() => void>( null! )

    scheduleNextBlink.current = () => {
        // 20% chance of doing a double blink
        const isDouble = Math.random() < 0.2

        // Random delay between blinks
        const delay = 2000 + Math.random() * 4000

        blinkTimerRef.current = setTimeout( () => {
            if ( isDouble ) {
                // Blink once, wait briefly, then blink again
                doSingleBlink( () => {
                    setTimeout(
                        () => doSingleBlink( scheduleNextBlink.current ),
                        150
                    )
                } )
            } else {
                // Normal single blink
                doSingleBlink( scheduleNextBlink.current )
            }
        }, delay )
    }


    // Start blink loop when component mounts
    useEffect( () => {
        scheduleNextBlink.current()

        // Cleanup blink timer on unmount
        return () => {
            if ( blinkTimerRef.current )
                clearTimeout( blinkTimerRef.current )
        }
    }, [] )

    return (
        <div
            ref={ sceneRef }
            onClick={ handleClick }
            className={ `relative select-none ${
                isActive
                    ? 'cursor-disc'
                    : 'cursor-pointer'
            } ${ className }` }
            style={ { width, height } }
        >
            <img
                src={ baseImage }
                alt="character"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={ { display: isBlinking ? 'none' : 'block' } }
                draggable={ false }
            />

            <img
                ref={ pupilRef }
                src={ pupilImage }
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
                style={ { display: isBlinking ? 'none' : 'block' } }
                draggable={ false }
            />

            <img
                src={ blinkImage }
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={ { display: isBlinking ? 'block' : 'none' } }
                draggable={ false }
            />
        </div>
    )
}