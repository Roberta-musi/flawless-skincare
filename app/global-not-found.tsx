import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found · Flawless Skin Care",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center px-6">
        <main className="flex flex-col items-center gap-6 text-center">
          <Image src="/brand/logo.png" unoptimized alt="Flawless Skin Care" width={400} height={231} className="h-auto w-36" />
          <h1 className="text-4xl">Page not found</h1>
          <p className="text-muted">
            The page you&apos;re looking for doesn&apos;t exist. · La page que vous cherchez n&apos;existe pas.
          </p>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-[0.14em]">
            <Link href="/" className="text-fuchsia hover:underline">
              Home
            </Link>
            <Link href="/fr" className="text-fuchsia hover:underline">
              Accueil
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
