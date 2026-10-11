import type { Metadata, Viewport } from "next";
import { Bitcount_Grid_Single, Zalando_Sans_SemiExpanded } from "next/font/google";
import { site } from "@/content/site";
import { THEME_COLOR, themeBootScript } from "@/lib/theme";
import { blueprintBootScript } from "@/lib/blueprint";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { RevealObserver } from "@/components/site/RevealObserver";
import { GridOverlay } from "@/components/site/GridOverlay";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/utilities.css";
import "@/styles/blueprint.css";
import "@/styles/tailwind.css";

const zalando = Zalando_Sans_SemiExpanded({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zalando",
  // No metric overrides exist for this family; the fallback stack lives in tokens.css.
  adjustFontFallback: false,
});

/* Pixel-grid face for buttons and keys. */
const bitcount = Bitcount_Grid_Single({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bitcount",
  adjustFontFallback: false,
});


export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.description,
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR.dark,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script sets data-theme before React hydrates.
    <html lang="en" className={`${zalando.variable} ${bitcount.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {/* Holds the homepage back for the blueprint intro; a no-op on every other path. */}
        <script dangerouslySetInnerHTML={{ __html: blueprintBootScript }} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <RevealObserver />
        {process.env.NODE_ENV === "development" && <GridOverlay />}
      </body>
    </html>
  );
}
