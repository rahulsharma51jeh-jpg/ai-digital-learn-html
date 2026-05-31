import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Infinity BSEB Learn — Bihar Board Classes 1–12",
    template: "%s · Infinity BSEB Learn",
  },
  description:
    "India's focused learning platform for Bihar Board (BSEB) students, Class 1 to 12. Concept-first video lessons, structured courses and progress tracking.",
  keywords: ["BSEB", "Bihar Board", "Class 10", "Class 12", "online learning", "edtech"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Navbar
          user={
            session
              ? { name: session.name, role: session.role, classLevel: session.classLevel }
              : null
          }
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
