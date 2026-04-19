import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const lufga = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-lufga",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Variable.woff2", style: "normal", weight: "300 900" },
    { path: "../public/fonts/Satoshi-VariableItalic.woff2", style: "italic", weight: "300 900" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ERP Learning Center",
  description: "Tutorials and guides for MTCC ERP applications.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lufga.variable} ${satoshi.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
