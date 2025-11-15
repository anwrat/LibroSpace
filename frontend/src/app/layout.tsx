import type { Metadata } from "next";
import { Inter } from "next/font/google"; //Importing inter font
import "./globals.css";

//Setting up inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LibroSpace",
  description: "Because books are better when shared",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}//Applying inter font to entire app
      >
        {children}
      </body>
    </html>
  );
}
