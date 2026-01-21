// src/app/layout.js
import { ClerkProvider } from "@clerk/nextjs";
import { StatusProvider } from "./context/StatusContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./globals.css"; // Ensure your CSS import is at the very top

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* StatusProvider must be inside <body> so it doesn't break the <head> */}
          <ThemeProvider>
            <StatusProvider>
              {children}
            </StatusProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}