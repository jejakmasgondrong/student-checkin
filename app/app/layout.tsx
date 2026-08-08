import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://student-checkin-superteam.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Student Check-In — Daily Attendance on Solana Devnet",
    template: "%s — Student Check-In",
  },
  description:
    "Check in once per day, on-chain, using a Solana wallet. Built with the Anchor framework on Solana devnet — every check-in is recorded in a per-day account you can verify yourself.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Student Check-In — Daily Attendance on Solana",
    description:
      "Connect your Solana wallet and check in on-chain. One check-in per day, recorded on the devnet with Anchor.",
    url: "/",
    type: "website",
    siteName: "Student Check-In",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Check-In — Daily Attendance on Solana",
    description:
      "Connect your Solana wallet and check in on-chain. One check-in per day, recorded on the devnet with Anchor.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Student Check-In",
              description:
                "Daily on-chain attendance check-in for Solana devnet. Connect a wallet and check in, strictly once per day.",
              applicationCategory: "UtilitiesApplication",
              url: siteUrl,
              operatingSystem: "Any",
            }),
          }}
        />
        <footer className="mt-auto border-t border-zinc-800 py-4 text-center">
          <a
            href="https://www.linkedin.com/in/rsatriya-wicaksana-56b026ab/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            Built by RSatriya · Contact Me
          </a>
        </footer>
      </body>
    </html>
  );
}