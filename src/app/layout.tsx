import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CasePenguin | Custom Phone Cases",
  description:
    "Design and order your custom iPhone case today! Turn your memories into stylish phone protection with CasePenguin.",
  keywords: [
    "custom phone case",
    "iphone case",
    "personalized case",
    "phone accessories",
    "case design",
    "gift ideas", 
    "phone protection" 
  ],
  publisher: "CasePenguin",
  twitter: {
    card: "summary_large_image",
    title: "CasePenguin: Design Your Dream Phone Case", 
    description:
      "Create a unique phone case with your photos. High-quality, durable, and stylish – order yours now!",
    creator: "@anasgets111", 
    images: ["https://casepenguin.vercel.app/penguin-1.jpeg"],
  },
  openGraph: {
    title: "CasePenguin: Make Your Phone Uniquely Yours", 
    description:
      "Design and order your custom iPhone case today! Turn your memories into stylish phone protection with CasePenguin.",
    url: "https://casepenguin.vercel.app", 
    siteName: "CasePenguin", 
    images: [
      {
        url: "https://casepenguin.vercel.app/penguin-1.jpeg",
        width: 1200,
        height: 630,
        alt: "A custom phone case from CasePenguin", 
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "https://casepenguin.vercel.app/favicon.ico", 
    shortcut: "https://casepenguin.vercel.app/favicon.ico", 
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={recursive.className}>
        <Navbar />
        <main className="grainy-light flex min-h-[calc(100vh-3.5rem-1px)] flex-col">
          <div className="flex h-full flex-1 flex-col">
            <Providers>{children}</Providers>
          </div>
          <Footer />
        </main>
        <Toaster />
      </body>
    </html>
  );
}
