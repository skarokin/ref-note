import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from 'next/head';
import "./globals.css";

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ref:note",
  description: "student-focused collaborative notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        
      </Head>
      
      {/* <Script src="https://kit.fontawesome.com/d53aaa60a3.js" crossOrigin="anonymous" />  */}

      <body className={inter.className}>{children}</body>
    </html>
  );
}
