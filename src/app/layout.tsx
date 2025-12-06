import "./globals.css";


/**
 * Root layout
 * This layout wraps all pages. Since `src/app/[locale]/layout.tsx` provides the 
 * `<html>` and `<body>` tags for the app, this root layout simply acts as a wrapper.
 * The middleware handles redirection from root `/` to the default locale.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}