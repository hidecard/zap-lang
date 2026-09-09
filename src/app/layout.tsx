import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zap — Documentation",
  description:
    "Zap is a readable, general-purpose programming language with .zp source files, indentation-based blocks, optional type checking, explicit modules, structured errors, and a standalone native runtime.",
  keywords: [
    "Zap",
    "Zap language",
    ".zp",
    "programming language",
    "native runtime",
    "documentation",
  ],
  authors: [{ name: "hidecard" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Zap — Documentation",
    description:
      "A readable, general-purpose programming language with .zp source files and a standalone native runtime.",
    url: "https://github.com/hidecard/zap",
    siteName: "Zap",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zap — Documentation",
    description:
      "A readable, general-purpose programming language with .zp source files and a standalone native runtime.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Prevent dark-mode flash: apply theme before first paint.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zap-docs-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
