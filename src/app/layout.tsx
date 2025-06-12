
"use client"; // Make RootLayout a client component to use usePathname

// import type {Metadata} from 'next'; // Type import for reference if needed elsewhere
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation'; // Import usePathname

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Note: 'export const metadata: Metadata' was removed from here.
// Statically exporting 'metadata' is not supported in Client Component root layouts.
// Metadata should be defined in 'page.tsx' files for specific pages, 
// a 'template.tsx' (Server Component) if a server-side wrapper is needed,
// or a dedicated 'src/app/metadata.ts' file for app-global defaults.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Define paths that are considered part of the "dashboard" or authenticated app area
  // where the main marketing footer should not be displayed.
  // This list is based on typical authenticated app sections and sidebar links.
  const appInternalPaths = [
    '/dashboard',
    '/previous-year-tests',
    '/new-mock-test',
    '/new-practice-test',
    '/ai-tests', 
    '/mock-test', 
    '/practice-test',
    '/test-history',
    '/profile'
  ];

  // Check if the current pathname starts with any of the app-internal paths
  // or is an exact match for one of them.
  const hideFooter = appInternalPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        {!hideFooter && <Footer />} {/* Conditionally render Footer */}
        <Toaster />
      </body>
    </html>
  );
}
