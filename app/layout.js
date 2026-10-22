import { Inter } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/reset.css";
import "@/styles/typography.css";
import "@/styles/globals.css";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Inventual",
  description: "Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <PreferencesProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
