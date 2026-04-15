import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { AuthProvider } from "@/context/AuthContext";

// Configuración de Montserrat (Títulos)
const montserrat = Montserrat({
  variable: "--font-titles",
  subsets: ["latin"],
  weight: ["700", "900"],
});

// Configuración de Inter (Cuerpo)
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TFG | Complejo Deportivo",
  description: "Gestión avanzada de instalaciones deportivas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${montserrat.variable} ${inter.variable} font-body antialiased min-h-screen flex flex-col bg-nieve text-carbon`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}