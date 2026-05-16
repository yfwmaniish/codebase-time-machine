import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = "https://codebase-time-machine.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Codebase Time Machine — Git tells you what changed. We tell you why.",
    template: "%s · Codebase Time Machine",
  },
  description:
    "Codebase Time Machine reads your entire Git history with IBM Bob and turns it into a queryable brain. Onboard in hours, not weeks. Never lose tribal knowledge again.",
  keywords: [
    "codebase understanding",
    "git history",
    "code archaeology",
    "AI developer tools",
    "IBM watsonx",
    "IBM Bob",
    "RAG",
    "ADR generation",
    "developer onboarding",
  ],
  authors: [{ name: "Codebase Time Machine" }],
  creator: "Codebase Time Machine",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Codebase Time Machine",
    description: "Git tells you what changed. We tell you why.",
    siteName: "Codebase Time Machine",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Codebase Time Machine — turn any Git repo into a queryable brain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Codebase Time Machine",
    description: "Git tells you what changed. We tell you why.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Codebase Time Machine",
    description: "Turn any Git repository into a queryable knowledge base. Powered by IBM Bob.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteUrl,
    offers: [
      { "@type": "Offer", name: "Explorer", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Team", price: "19", priceCurrency: "USD" },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
