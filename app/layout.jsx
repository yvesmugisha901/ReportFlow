import "./globals.css";
import { Providers } from "./context/Providers";

export const metadata = {
  title: "ReportFlow",
  description: "Internal Reporting System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}