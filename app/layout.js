// src/app/layout.js
import { ClerkProvider } from "@clerk/nextjs";
import { StatusProvider } from "./context/StatusContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ModerationProvider } from "./context/ModerationContext";
import "./globals.css"; // Ensure your CSS import is at the very top

export const metadata = {
  title: "FreeNow | Ephemeral Vibe Sync",
  description: "Connect instantly, vibe deeply, and vanish without a trace.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* StatusProvider must be inside <body> so it doesn't break the <head> */}
          <ThemeProvider>
            <ModerationProvider>
              <StatusProvider>
                {children}
              </StatusProvider>
            </ModerationProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}