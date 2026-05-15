import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codebase Time Machine — Know Why, Not Just What",
  description:
    "Turn any Git repository into a queryable knowledge base. Ask why code exists, travel through file history, generate ADRs, and chat with past contributors — all powered by IBM watsonx.ai.",
  keywords: ["git", "code understanding", "AI", "IBM watsonx", "developer tools", "onboarding"],
  authors: [{ name: "Codebase Time Machine" }],
  openGraph: {
    title: "Codebase Time Machine",
    description: "Git tells you what changed. We tell you why.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
