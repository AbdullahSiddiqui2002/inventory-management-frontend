import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { HealthProvider } from '@/context/HealthContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'StockCore Construction — Multi-Project Inventory Management System',
  description: 'Multi-Project Construction Inventory, Site Tracking, Supplier Invoices & Materials Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <NotificationProvider>
            <HealthProvider>
              <AuthProvider>
                <AppShell>{children}</AppShell>
              </AuthProvider>
            </HealthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
