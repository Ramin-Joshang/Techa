import '../styles/globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';
import { getSiteUrl, SEO_DEFAULT_OG_IMAGE } from '../lib/seo';

const siteUrl = getSiteUrl();
const defaultTitle = 'تکا | آموزش برنامه‌نویسی وب و مستندات فنی';
const defaultDescription =
  'آموزش استاندارد برنامه‌نویسی وب، React، TypeScript و معماری نرم‌افزار با ۱۳ بلوک محتوایی و آزمایشگاه زنده کد به زبان فارسی.';

export const metadata = {
  title: {
    default: defaultTitle,
    template: '%s | تکا (TECHA)',
  },
  icons: {
    icon: '/images/favicon.svg',
  },
  description: defaultDescription,
  keywords: [
    'آموزش برنامه‌نویسی',
    'تکا',
    'TECHA',
    'آموزش React',
    'آموزش TypeScript',
    'مستندات مهندسی وب',
    'کارآموزی برنامه‌نویسی',
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: 'TECHA',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}${SEO_DEFAULT_OG_IMAGE}`,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [`${siteUrl}${SEO_DEFAULT_OG_IMAGE}`],
  },
  other: {
    enamad: '5807521',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head />
      <body className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
