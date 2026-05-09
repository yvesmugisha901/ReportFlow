import "./globals.css";
import { Providers } from "./context/Providers";

export const metadata = {
  title: "ReportFlow",
  description: "Internal Reporting System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}