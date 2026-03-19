import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/providers";
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
  title: "ORT Calendar — Parciales y entregas",
  description:
    "Todos tus parciales y entregas de ORT Uruguay en tu calendario, en un click. Sin cuentas, sin complicaciones.",
  openGraph: {
    title: "ORT Calendar",
    description:
      "Parciales y entregas de ORT Uruguay directo en tu calendario.",
    url: "https://ortcal.aviera.me",
    siteName: "ORT Calendar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
