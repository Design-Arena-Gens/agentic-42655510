import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Encore | Music Booking Platform",
  description: "Discover live music talent and book unforgettable performances."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
