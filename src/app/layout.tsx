import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MITRA | Autism Learning Companion & Sensory Space",
  description: "A calm, structured browser-based learning companion for children with autism. Providing visual schedules, emotion recognition activities, and educator IEP tracking.",
  keywords: ["autism learning", "neurodiverse education", "visual schedule", "sensory learning companion", "IEP tracking"],
  authors: [{ name: "MITRA Education Team" }]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FBF9F5] text-[#1C241E]" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
