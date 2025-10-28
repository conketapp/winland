'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useNavigation() {
    const [activeNav, setActiveNav] = useState<string>('home');
    const router = useRouter();
    const pathname = usePathname();

    // Update active navigation based on current path
    useEffect(() => {
        const pathToNavMap: Record<string, string> = {
            '/dashboard': 'home',
            '/project-management': 'cart',
            '/planning-area': 'planning',
            '/my-transactions': 'deal',
            '/notification': 'notify',
            '/profile': 'profile',
        };

        const matchedNav = Object.entries(pathToNavMap).find(([path]) =>
            pathname === path || pathname.startsWith(path + '/')
        );

        if (matchedNav) {
            setActiveNav(matchedNav[1]);
        }
    }, [pathname]);

    const navigateTo = (path: string) => {
        router.push(path);
    };

    return { activeNav, setActiveNav, navigateTo };
}