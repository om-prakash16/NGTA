import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalNav from "@/components/GlobalNav";
import Footer from "@/components/Footer";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { FilterProvider } from "@/context/FilterContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NG Trade Analysis — AI-Driven Trade Analysis for the Next Generation of Traders",
  description: "Real-time stock insights, F&O analysis, market trends, gainers, losers, and AI-powered breakout detection.",
  keywords: ["AI-driven trade analysis", "next-generation trading tools", "stock market AI analysis", "F&O analytics platform", "real-time trade insights", "AI for traders", "market trends analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <FilterProvider>
                <div className="flex flex-col min-h-screen">
                  <GlobalNav />
                  <main className="flex-grow pt-24">
                    {children}
                  </main>
                  <Footer />
                </div>
              </FilterProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
