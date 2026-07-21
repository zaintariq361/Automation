import type { Metadata } from "next";
import { AuthProvider } from "../lib/auth-context";
import { I18nProvider } from "../lib/i18n";
import { ToastProvider } from "../lib/toast-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conviyo — Conversational Commerce for WhatsApp",
  description:
    "Answer customers, recommend products, and close sales inside WhatsApp, Instagram, and Messenger — built for Pakistan and Saudi Arabia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
