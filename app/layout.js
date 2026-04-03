import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Trenchmunity — Build Your Community',
  description: 'The home for communities built in the trenches. Create, grow, and own your space.',
  icons: {
    icon:  '/favicon.png',
    apple: '/favicon.png',
  },
  themeColor: '#7AB541',
  openGraph: {
    title:       'Trenchmunity',
    description: 'Build communities. No limits.',
    type:        'website',
    images:      ['/logo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="theme-color" content="#7AB541" />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-trench-border py-6 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-trench-muted">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Trenchmunity" className="w-5 h-5 opacity-80" />
                <span className="font-semibold text-trench-dim">Trenchmunity</span>
              </div>
              <span>All communities are user-created and owned.</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
