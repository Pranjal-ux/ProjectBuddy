import type { Metadata, Viewport } from "next";
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://projectbuddyapp.vercel.app";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProjectBuddy — Developer Network & Open Source Project Collaboration",
    template: "%s | ProjectBuddy",
  },
  description:
    "The premier developer network to discover trending open-source projects, recruit co-founders and team members, showcase code snippets, and build real-world software together.",
  applicationName: "ProjectBuddy",
  authors: [{ name: "Pranjal Shukla", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "ProjectBuddy",
    "project buddy",
    "developer network",
    "project collaboration platform",
    "find coding partners",
    "open source projects",
    "find developer cofounders",
    "software engineering community",
    "hackathon team builder",
    "code showcase platform",
    "developer social network",
    "hire developer teammates",
    "github open source community",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Pranjal Shukla",
  publisher: "ProjectBuddy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProjectBuddy — Developer Network & Open Source Project Collaboration",
    description:
      "Connect with developers, discover open-source projects, recruit teammates, and share code in high-contrast developer aesthetic.",
    url: siteUrl,
    siteName: "ProjectBuddy",
    images: [
      {
        url: "/projectbuddy-emblem-512.png",
        width: 512,
        height: 512,
        alt: "ProjectBuddy - Developer Collaboration Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectBuddy — Developer Network & Project Collaboration",
    description:
      "Connect with developers, discover open-source projects, recruit teammates, and share code in real-time.",
    images: ["/projectbuddy-emblem-512.png"],
    creator: "@projectbuddy",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "googlee1234567890abcdef",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/projectbuddy-logo.svg", type: "image/svg+xml" },
      { url: "/projectbuddy-logo.png", type: "image/png" },
    ],
    shortcut: "/projectbuddy-logo.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// Rich Structured Data (JSON-LD) for Google Position #1 Rich Snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ProjectBuddy",
      alternateName: ["Project Buddy", "ProjectBuddy Dev Network"],
      description: "Developer Network & Open Source Project Collaboration Platform",
      inLanguage: "en-US",
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#application`,
      name: "ProjectBuddy",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web Browser, iOS, Android",
      url: siteUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Collaborate on open source projects, recruit developers, share code showcases, and chat in real-time.",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ProjectBuddy",
      url: siteUrl,
      logo: `${siteUrl}/projectbuddy-emblem-512.png`,
      sameAs: [
        "https://github.com",
        "https://twitter.com",
        "https://linkedin.com",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ProjectBuddy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ProjectBuddy is a modern developer collaboration network where software engineers, designers, and tech creators discover open-source projects, recruit co-founders and team members, and build real-world software together.",
          },
        },
        {
          "@type": "Question",
          name: "How can I find developers or teammates for my project on ProjectBuddy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can publish your project on ProjectBuddy specifying tech stack requirements, open roles, and project goals. Interested developers can discover your project, inspect your GitHub repository, and request to join your team with one click.",
          },
        },
        {
          "@type": "Question",
          name: "Is ProjectBuddy free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, ProjectBuddy is 100% free for developers to showcase projects, find teammates, share code snippets, and collaborate.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
