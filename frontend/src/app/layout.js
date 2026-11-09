import '../styles/globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const metadata = {
  title: {
    default: 'پلتفرم آموزشی تکا | TECHA',
    template: '%s | TECHA',
  },
  icons: {
    icon: '/images/favicon.svg',
  },
  description: 'پلتفرم مدرن و استاندارد آموزش برنامه‌نویسی وب و مهندسی نرم‌افزار به زبان فارسی',
  keywords: ['آموزش برنامه‌نویسی', 'تکا', 'Techa', 'پایتون', 'ری‌اکت', 'نکست جی‌اس', 'جاوا اسکریپت'],
  metadataBase: new URL('https://techa.ir'),
  openGraph: {
    title: 'پلتفرم آموزشی تکا | TECHA',
    description: 'آموزش جامع و استاندارد برنامه‌نویسی با معماری مدرن و درس‌های تعاملی',
    url: 'https://techa.ir',
    siteName: 'TECHA',
    locale: 'fa_IR',
    type: 'website',
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
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
