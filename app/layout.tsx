import type { Metadata } from "next";
import "./globals.css";
import { Cursor3D } from "@/components/Cursor3D";

export const metadata: Metadata = {
  title: "Jinni — AI-Powered School Management Software",
  description:
    "Jinni connects teachers, students and parents in one AI-powered platform — homework grading, attendance, notifications and personalized learning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Cursor3D />
      </body>
    </html>
  );
}
