import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SilentRemover | Remove Silences Instantly",
  description: "Drop your video, we remove the dead air. 100% free. 100% private. No upload needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-white selection:bg-accent selection:text-black`}>
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#111111',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#00ff88',
                secondary: '#111',
              },
            },
          }} 
        />
      </body>
    </html>
  );
}
