import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FerroMax — Ferretería, Calefacción y Herramientas",
  description:
    "Tu ferretería de confianza. Herramientas, calefactores, pinturas y accesorios para el hogar, con envío rápido a todo el país.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isExtensionError(event) {
                  var reason = event.reason;
                  var stack = (reason && reason.stack) || '';
                  var message = (reason && reason.message) || String(reason || '');
                  return stack.includes('chrome-extension://') || message.includes('chrome-extension://') || message.includes('M_ID');
                }
                window.addEventListener('unhandledrejection', function(event) {
                  if (isExtensionError(event)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
                window.addEventListener('error', function(event) {
                  var filename = event.filename || '';
                  var message = event.message || '';
                  if (filename.includes('chrome-extension://') || message.includes('M_ID')) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
                try {
                  var savedTheme = localStorage.getItem('ferromax-theme');
                  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
