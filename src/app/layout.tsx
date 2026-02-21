import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UTRADE | CHIT Marketplace",
  description: "Digital Cash Alternative for Cash-Intensive Operatives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased selection:bg-[#4ade80] selection:text-[#161616]`}>
        {children}
      </body>
    </html>
  );
}
