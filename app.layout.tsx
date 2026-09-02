import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnostic Maturité Data & IA | Alzà",
  description: "Évaluez votre maturité Data & IA et identifiez vos priorités.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
