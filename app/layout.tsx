import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "WaffleMan — by ApeXhit",
  description: "The central waffle manager for all ApeXhit apps and featured websites.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-[#0a0a16] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
