import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Knowledge - AI-Powered Team Knowledge Base",
  description:
    "Consolidate scattered team knowledge from Jira, Wiki, Contracts, and Slack into one searchable AI-powered knowledge base. Ask questions in plain English, get answers with source attribution.",
  openGraph: {
    title: "Project Knowledge",
    description:
      "Demo: AI-powered knowledge base that consolidates Jira, Wiki, Contracts, and Slack",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
