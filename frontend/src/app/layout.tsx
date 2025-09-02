import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from "react-hot-toast";
import VoiceButton from '@/components/header/VoiceButton';
import { m } from 'framer-motion';


const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <VoiceButton /> {/* Voice button visible on all pages */}
          
        </ThemeProvider>
      </body>
    </html>
  );
}
