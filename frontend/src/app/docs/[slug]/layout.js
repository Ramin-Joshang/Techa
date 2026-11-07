import { Bounce, ToastContainer } from "react-toastify";
import ConditionalSidebar from "../../../components/layout/ConditionalSidebar";
import { getCourseOutline } from "../../../lib/server";
import { CourseOutlineProvider } from "../../../context/CourseOutlineContext";

export default async function Layout({ children, params }) {
  const courseSlug = params?.courseSlug || params?.slug || '';
  const outline = courseSlug ? await getCourseOutline(courseSlug).catch(() => null) : null;

  return (
    <CourseOutlineProvider outline={outline} courseSlug={courseSlug}>
      <div className="pt-32 min-h-screen bg-gray-50/30">
        <div className="container px-4 xl:px-10 mx-auto pb-20">
          <div className="flex flex-col lg:flex-row lg:gap-8 relative items-start">
            {/* Documentation Sidebar */}
            <ConditionalSidebar />

            {/* Main Content Area */}
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
    </CourseOutlineProvider>
  );
}