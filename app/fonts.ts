import { Cormorant_Garamond, Jost } from "next/font/google";

export const displayFont = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-face",
  display: "swap",
});

export const sansFont = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans-face",
  display: "swap",
});

export const fontVariables = `${displayFont.variable} ${sansFont.variable}`;
