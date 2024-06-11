import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

const recursive = Recursive({ subsets: ["latin"] });

eexport const metadata: Metadata = {
  title: "CasePenguin",
  description: "Design and order your custom iPhone case today!",
  openGraph: {
    type: "website",
    url: "https://casepenguin.vercel.app",
    title: "CasePenguin | Create Your Custom iPhone Case Now",
    description: "Design and order your custom iPhone case today!",
    images: [
      {
        url: "https://casepenguin.vercel.app/penguin-1.jpeg",
        height: 600,
        alt: "CasePenguin logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CasePenguin | Create Your Custom iPhone Case Now",
    description: "Design and order your custom iPhone case today!",
    images: [
      "https://casepenguin.vercel.app/penguin-1.jpeg"
    ],
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
