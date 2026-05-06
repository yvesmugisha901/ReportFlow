import "./globals.css";

export const metadata = {
  title: "ReportFlow — Internal Reporting System",
  description: "Structured submission, two-stage approval, and real-time tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}