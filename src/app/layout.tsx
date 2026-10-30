import type { Metadata, Viewport } from "next";
import { EARLY_POLYFILL_SCRIPT } from "@/lib/polyfills";
import "./globals.css";
import "../App.css";

export const metadata: Metadata = {
  title: "სკოლის ელექტრონული ჟურნალი - eSchools",
  description: "სასკოლო მართვის სისტემა",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "eSchools",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY_POLYFILL_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
