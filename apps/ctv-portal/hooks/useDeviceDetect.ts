'use client';

import { useState, useEffect } from 'react';

// Define breakpoints and types (same as above)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
export type OrientationType = 'portrait' | 'landscape';

export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeDesktop: boolean;
    width: number;
    height: number;
    orientation: OrientationType;
    deviceType: DeviceType;
    isSmallScreen: boolean;
    isMediumScreen: boolean;
    isLargeScreen: boolean;
    isExtraLargeScreen: boolean;
}

// Default device info for SSR
const DEFAULT_DEVICE_INFO: DeviceInfo = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    width: 1024,
    height: 768,
    orientation: 'landscape',
    deviceType: 'desktop',
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: true,
    isExtraLargeScreen: false,
};

// Function to calculate device info
function calculateDeviceInfo(width: number, height: number): DeviceInfo {
    const isMobile = width < BREAKPOINTS.MD;
    const isTablet = width >= BREAKPOINTS.MD && width < BREAKPOINTS.LG;
    const isDesktop = width >= BREAKPOINTS.LG && width < BREAKPOINTS.XL;
    const isLargeDesktop = width >= BREAKPOINTS.XL;

    let deviceType: DeviceType;
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    else if (isDesktop) deviceType = 'desktop';
    else deviceType = 'large-desktop';

    const orientation = width > height ? 'landscape' : 'portrait';

    return {
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        width,
        height,
        orientation,
        deviceType,
        isSmallScreen: width < BREAKPOINTS.SM,
        isMediumScreen: width >= BREAKPOINTS.SM && width < BREAKPOINTS.LG,
        isLargeScreen: width >= BREAKPOINTS.LG && width < BREAKPOINTS.XL,
        isExtraLargeScreen: width >= BREAKPOINTS.XL,
    };
}

// Custom hook for device detection
export function useDeviceDetect(): DeviceInfo {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(DEFAULT_DEVICE_INFO);

    useEffect(() => {
        // Skip on server-side
        if (typeof window === 'undefined') return;

        // Function to update device info
        const updateDeviceInfo = () => {
            const newDeviceInfo = calculateDeviceInfo(window.innerWidth, window.innerHeight);
            setDeviceInfo(newDeviceInfo);
        };

        // Initial update
        updateDeviceInfo();

        // Add resize listener
        window.addEventListener('resize', updateDeviceInfo, { passive: true });

        // Cleanup
        return () => window.removeEventListener('resize', updateDeviceInfo);
    }, []);

    return deviceInfo;
}

// Other hooks remain the same...
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        setMatches(media.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}

export function useIsMobile() {
    return useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);
}

export function useIsTablet() {
    return useMediaQuery(`(min-width: ${BREAKPOINTS.MD}px) and (max-width: ${BREAKPOINTS.LG - 1}px)`);
}

export function useIsDesktop() {
    return useMediaQuery(`(min-width: ${BREAKPOINTS.LG}px)`);
}

export function useIsLargeDesktop() {
    return useMediaQuery(`(min-width: ${BREAKPOINTS.XL}px)`);
}

export function useOrientation() {
    const [orientation, setOrientation] = useState<OrientationType>('landscape');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOrientationChange = () => {
            setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
        };

        handleOrientationChange();
        window.addEventListener('resize', handleOrientationChange);
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            window.removeEventListener('resize', handleOrientationChange);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    return orientation;
}