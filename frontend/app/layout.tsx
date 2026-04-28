import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import Footer from "@/app/components/Layout/Footer";
import Header from "@/app/components/Layout/Header";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-titles",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Complejo Deportivo",
  description: "Sistema de gestión y reservas deportivas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${cormorant.variable} ${manrope.variable} min-h-screen text-[#f4f6ff] antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}