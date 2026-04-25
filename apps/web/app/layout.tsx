import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { CartProvider } from '@/components/cart-provider'

export const metadata: Metadata = {
  title: {
    default: 'Bionic Life — Organic Products, Traced from Farm to Table',
    template: '%s | Bionic Life',
  },
  description:
    'Shop premium organic rice, snacks, and oils — every product scanned and verified from source to your doorstep.',
  keywords: ['organic', 'rice', 'bionic life', 'farm to table', 'Indonesia'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Bionic Life',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Sora:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="footer">
            <div className="container">
              <div className="footer-inner">
                <div>
                  <span className="footer-logo">🌿 Bionic Life</span>
                  <p className="footer-tagline">Farm-to-Table, Verified.</p>
                </div>
                <p className="footer-copy">© 2026 Bionic Life. Portfolio Demo.</p>
              </div>
            </div>
          </footer>
        </CartProvider>
        <style>{`
          .footer {
            background: var(--neutral-900);
            color: var(--neutral-400);
            padding: 2rem 0;
            margin-top: 4rem;
          }
          .footer-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .footer-logo {
            font-family: var(--font-display);
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--brand-400);
            display: block;
            margin-bottom: 0.25rem;
          }
          .footer-tagline {
            font-size: 0.85rem;
          }
          .footer-copy {
            font-size: 0.8rem;
          }
        `}</style>
      </body>
    </html>
  )
}
