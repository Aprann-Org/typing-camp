import type { Metadata } from "next";
import { Bungee, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SwRegister } from "./sw-register";
import { AppSettingsProvider } from "@/context/AppSettingsContext";
import { I18nProvider } from "@/context/I18nContext";

const displayFont = Bungee({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

const uiFont = Work_Sans({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
});

const typingFont = JetBrains_Mono({
  variable: "--font-typing",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Kod & Kreyasyon Typing",
  description: "Typing practice for Kod & Kreyasyon camp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${uiFont.variable} ${typingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppSettingsProvider>
          <I18nProvider>{children}</I18nProvider>
        </AppSettingsProvider>
        <SwRegister />
      </body>
    </html>
  );
}
