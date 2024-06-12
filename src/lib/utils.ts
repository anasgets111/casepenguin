import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })
  return formatter.format(price)

}

export function constructMetadata({
  title = "CasePenguin - custom hight-quality iPhone cases",
  description = "create your own custom high quality iPhone cases in seconds",
  image = "/thumbnail.png",
  icons = "/favicon.ico",


}: {
  title?: string,
  description?: string,
  image?: string,
  icons?: string,
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          alt: "CasePenguin - custom hight-quality iPhone cases",
        },

      ],
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [image],
      creator: "@anasgets111"
    },
    icons,
    metadataBase: new URL("https://casepenguin.vercel.app"),
  }
}