"use client";
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "react-hot-toast";
import VoiceButton from '@/components/header/VoiceButton';
import { m } from 'framer-motion';
import { usePathname } from "next/navigation"; // import this



const outfit = Outfit({
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // get current route
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
            containerStyle={{ top: 20, right: 20, zIndex: 2147483647 }}
          />
        {pathname !== "/voice-chat" && <VoiceButton />}
        
        </ThemeProvider>
      </body>
    </html>
  );
}
