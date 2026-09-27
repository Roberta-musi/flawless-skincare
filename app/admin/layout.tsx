import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin · Flawless Skin Care", template: "%s · Admin · Flawless Skin Care" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#2b1431",
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-ivory">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-line !bg-white !font-sans !text-plum !shadow-[0_20px_50px_-20px_rgb(43_20_49/0.35)]",
            },
          }}
        />
      </body>
    </html>
  );
}
