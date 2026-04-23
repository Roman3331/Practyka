import type { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'EduFlow | Система дистанційного навчання',
  description: 'Сучасна платформа для навчання: створюйте курси, виконуйте завдання та проходьте тести.',
};

import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full flex flex-col gradient-bg">
        {children}
        <ConfirmModal />
      </body>
    </html>
  );
}
