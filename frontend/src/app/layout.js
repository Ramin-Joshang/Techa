import "../styles/globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { AuthProvider } from "../components/contexts/AuthContext";
import "react-loading-skeleton/dist/skeleton.css";
import { Bounce, ToastContainer } from "react-toastify";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Providers } from "./Providers";

export const metadata = {
  title: {
    default: "پلتفرم آموزشی تکا | Techa",
    template: "%s | Techa",
  },
  icons: {
    icon: "/images/favicon.svg",
  },
  description: "پلتفرم آموزشی تکا",
  keywords: ["آموزش برنامه‌نویسی", "دوره آنلاین", "Techa"],
  metadataBase: new URL("https://techa.ir"),
  openGraph: {
    title: "پلتفرم آموزشی تکا | Techa",
    description: "پلتفرم آموزشی برای یادگیری برنامه‌نویسی و تکنولوژی",
    url: "https://techa.ir",
    siteName: "Techa",
    locale: "fa_IR",
    type: "website",
  },
  other: {
    enamad: "5807521",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa">
      <head />
      <body>
        <Providers>
          <AuthProvider>
            <Header />
            <main className="mb-40 md:mb-60">{children}</main>
            <Footer />
          </AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Bounce}
          />
        </Providers>
      </body>
    </html>
  );
}
