
"use client"; // Make RootLayout a client component to use usePathname

// import type {Metadata} from 'next'; // Type import for reference if needed elsewhere
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation'; // Import usePathname
import { cn } from '@/lib/utils';

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

  const hideFooter = appInternalPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
  
  // New logic to control page width
  const fullWidthPaths = ['/mock-test', '/practice-test'];
  const isFullWidthPage = fullWidthPaths.some(p => pathname.startsWith(p));
  
  const mainClasses = cn(
    "flex-grow",
    { "container mx-auto px-4 py-8": !isFullWidthPage }
  );

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className={mainClasses}>
          {children}
        </main>
        {!hideFooter && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}
