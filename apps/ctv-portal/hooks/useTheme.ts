'use client';

import { useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'system';

export interface ThemeInfo {
    theme: ThemeType;
    systemTheme: 'light' | 'dark';
    isDark: boolean;
    effectiveTheme: 'light' | 'dark'; // The actual theme being applied
}

export function useTheme(initialTheme: ThemeType = 'system'): ThemeInfo & { toggleTheme: () => void; setTheme: (theme: ThemeType) => void } {
    const [theme, setThemeState] = useState<ThemeType>(() => {
        // Get saved theme from localStorage or use initial theme
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as ThemeType | null;
            return savedTheme || initialTheme;
        }
        return initialTheme;
    });

    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        // Listen for system theme changes
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Determine the effective theme
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    const isDark = effectiveTheme === 'dark';

    // Update DOM when theme changes
    useEffect(() => {
        if (typeof document === 'undefined') return;

        // Update body class
        if (isDark) {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        }

        // Update meta theme-color
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', isDark ? '#0f172a' : '#3b82f6');
        }
    }, [isDark]);

    // Save theme to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            if (prevTheme === 'dark') return 'light';
            return systemTheme === 'dark' ? 'light' : 'dark';
        });
    };

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
    };

    return {
        theme,
        systemTheme,
        isDark,
        effectiveTheme,
        toggleTheme,
        setTheme,
    };
}