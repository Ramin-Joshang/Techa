import { Bounce, ToastContainer } from "react-toastify";
import ConditionalSidebar from "../../../components/layout/ConditionalSidebar";

export default function Layout({ children }) {
  return (
    <div className="pt-32 min-h-screen bg-gray-50/30"> {/* اضافه کردن پس زمینه ملایم */}
      <div className="container px-4 xl:px-10 mx-auto pb-20">
        <div className="flex flex-col lg:flex-row lg:gap-8 relative items-start">

          {/* سایدبار */}
          <ConditionalSidebar />

          {/* محتوای اصلی: flex-1 باعث می‌شود فضای خالی را پر کند */}
          <main className="w-full flex-1 min-w-0 transition-all duration-300">
            {children}
          </main>

        </div>
      </div>

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
    </div>
  );
}