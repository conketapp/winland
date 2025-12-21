"use client";
import { ThemeProvider } from "next-themes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Providers({ children }: { children: any }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
}
