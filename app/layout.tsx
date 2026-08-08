import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bosslive Cricket",
  description: "Live cricket scoring, teams, players and career statistics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}