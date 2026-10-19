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
    default: "ProjectBuddy (projectbuddyapp) — #1 Developer Network & Open Source Project Collaboration",
    template: "%s | ProjectBuddy — Developer Network",
  },
  description:
    "ProjectBuddy (projectbuddyapp) is the premier developer collaboration network. Find coding partners, discover trending open-source projects, recruit co-founders, showcase code snippets, and build real-world software together.",
  applicationName: "ProjectBuddy",
  authors: [{ name: "Pranjal Shukla", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "ProjectBuddy",
    "projectbuddyapp",
    "project buddy",
    "projectbuddy app",
    "projectbuddyapp.vercel.app",
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
    "collaborative programming platform",
    "pair programming network",
    "tech buddy finder",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Pranjal Shukla",
  publisher: "ProjectBuddy",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "ProjectBuddy (projectbuddyapp) — Developer Network & Open Source Project Collaboration",
    description:
      "Find coding partners, discover open-source projects, recruit teammates, and share code in high-contrast developer aesthetic.",
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
    title: "ProjectBuddy (projectbuddyapp) — Developer Network & Project Collaboration",
    description:
      "Find coding partners, discover open-source projects, recruit teammates, and share code in real-time.",
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
      alternateName: [
        "projectbuddyapp",
        "Project Buddy",
        "ProjectBuddy Dev Network",
        "projectbuddyapp.vercel.app",
      ],
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
      applicationCategory: "DeveloperApplication, SocialNetworkingApplication",
      operatingSystem: "Web Browser, iOS, Android, macOS, Windows, Linux",
      url: siteUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "168",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Discover trending open-source projects",
        "Recruit developer teammates and co-founders",
        "Code snippet showcase with syntax highlighting",
        "Real-time developer chat and team messaging",
        "Tech stack synergy matching algorithm",
      ],
      description:
        "Collaborate on open source projects, recruit developers, share code showcases, and chat in real-time.",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ProjectBuddy",
      url: siteUrl,
      logo: `${siteUrl}/projectbuddy-emblem-512.png`,
      founder: {
        "@type": "Person",
        name: "Pranjal Shukla",
        url: siteUrl,
      },
      sameAs: [
        "https://github.com/Pranjal-ux/ProjectBuddy",
        "https://twitter.com/projectbuddy",
        "https://linkedin.com",
      ],
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#navigation`,
      name: [
        "Home Feed",
        "Discover Projects",
        "Developer Network",
        "Messages",
        "Bookmarks",
      ],
      url: [
        `${siteUrl}/`,
        `${siteUrl}/?tab=discover`,
        `${siteUrl}/?tab=discover`,
        `${siteUrl}/?tab=messages`,
        `${siteUrl}/?tab=bookmarks`,
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ProjectBuddy (projectbuddyapp)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ProjectBuddy (projectbuddyapp) is a modern developer collaboration network where software engineers, designers, and tech creators discover open-source projects, recruit co-founders and team members, and build real-world software together.",
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
          name: "Is ProjectBuddy free to use for developers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, ProjectBuddy is 100% free for developers to showcase projects, find teammates, share code snippets, and collaborate.",
          },
        },
        {
          "@type": "Question",
          name: "How does ProjectBuddy stack synergy matching work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ProjectBuddy analyzes your developer profile skills (e.g. Next.js, TypeScript, Python, Rust) against open project requirements to calculate a high-fidelity synergy match score, connecting you with projects where your skills are in demand.",
          },
        },
        {
          "@type": "Question",
          name: "How do I showcase code snippets on ProjectBuddy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "When publishing a post or sending a message, developers can attach formatted code snippets with syntax highlighting and file name badges that teammates can inspect and copy directly.",
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
      className={`${geistMono.variable} h-full antialiased font-sans`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/sf-pro-display"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
