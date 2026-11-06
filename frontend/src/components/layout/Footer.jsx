"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { subscribeNewsletter } from "../../features/main/newsletter/newsletterActions";

const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error('ایمیل وارد شده معتبر نیست');
      return;
    }

    setIsSubmitting(true);

    dispatch(subscribeNewsletter({ Email: email }))
      .unwrap()
      .then((message) => {
        toast.success(message);
        setEmail('');
        setIsSubmitting(false);
      })
      .catch((error) => {
        toast.error(error);
        setIsSubmitting(false);
      });
  };

  return (
    <footer
      className={`bg-[#042A1B] relative ${pathname.includes("account") ? "hidden" : "block"
        }`}
    >
      <img
        className="hidden md:block absolute -top-32 w-full h-32 rotate-180"
        src="/images/banner.png"
        alt="banner"
      />
      <div className="container mx-auto px-5 2xl:px-20">
        <div className="w-full absolute -top-20 sm:-top-12 md:-top-32 xl:-top-36 2xl:-top-44 right-1/2 translate-x-1/2 px-5 lg:px-10">
          <div className="md:w-fit mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 md:gap-10 lg:gap-20 rounded-3xl py-5 md:py-10 px-5 sm:px-10 md:px-20 bg-[#7AE36A]">
            <div className="text-[#042A1B] whitespace-nowrap text-center md:text-start">
              <h4 className="font-extrabold text-lg ">عضویت در خبرنامه</h4>
              <p className=" font-medium text-[15px] mt-1">
                از جدیدترین اخبار و دوره‌های ما مطلع شوید
              </p>
            </div>
            <div>
              <form className="p-2 bg-white rounded-xl flex gap-5"
                onSubmit={handleSubmit}
              >
                <button
                  className="px-5 py-2.5 bg-[#042A1B] text-white rounded-lg text-xs "
                  type="submit"
                  disabled={isSubmitting}

                >
                  {isSubmitting ? "در حال ارسال..." : "عضویت"}
                </button>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full lg:min-w-80 px-3 text-[#042A1B] text-lg font-medium focus:outline-none"
                  style={{ direction: "ltr" }}
                  type="email"
                  placeholder="Techa@gmail.com"
                  required
                />
              </form>
            </div>
          </div>
        </div>
        <div className="pt-40 sm:pt-20 pb-14 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-10 lg:gap-15 justify-start">
          <div className="">
            <Link href="/">
              <Image
                src="/images/logo-light.svg"
                width={200}
                height={100}
                alt="logo"
                priority
              />
            </Link>
            <p className="mt-5 text-white font-light  text-justify text-[15px] leading-7">
              پلتفرم توانمندسازی و مهارت افزایی تکا، بستری ارزان و سریع برای
              جوانان فراهم کرده تا بتوانند برای آینده خود مسیر روشن در عرصه
              توسعه برنامه های وب ایجاد کنند، مسیر اصلی تکا، کارآفرین نمودن
              کارآموز، با استفاده از منابع عرضه شده برای تجاری سازی یک پروژه
              واقعی است، مسیر دوم در صورت شکست مسیر اول عرضه کارآموز مجرب با یک
              رزومه قوی به بازار کار برای استخدام تمام وقت در یک شرکت بزرگ می
              باشد.{" "}
            </p>
          </div>
          <div className="sm:mx-auto">
            <h4 className="font-bold text-[15px] text-[#F6DC65] ">
              دسترسی سریع
            </h4>
            <ul className="mt-4 text-white font-light text-[15px] leading-7 ">
              <li className="flex items-center gap-3">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="4"
                    cy="4"
                    r="3.25"
                    stroke="#F6DC65"
                    strokeWidth="1.5"
                  />
                </svg>
                <Link href="/">صفحه اصلی</Link>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="4"
                    cy="4"
                    r="3.25"
                    stroke="#F6DC65"
                    strokeWidth="1.5"
                  />
                </svg>
                <Link href="/courses">دوره های ما</Link>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="4"
                    cy="4"
                    r="3.25"
                    stroke="#F6DC65"
                    strokeWidth="1.5"
                  />
                </svg>
                <Link href="/term">قوانین و مقررات</Link>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="4"
                    cy="4"
                    r="3.25"
                    stroke="#F6DC65"
                    strokeWidth="1.5"
                  />
                </svg>
                <Link href="/about-me">درباره ما</Link>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="4"
                    cy="4"
                    r="3.25"
                    stroke="#F6DC65"
                    strokeWidth="1.5"
                  />
                </svg>
                <Link href="contact-us">تماس با ما</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-[16px] text-[#F6DC65]">
              اطلاعات تماس
            </h4>
            <ul className="mt-4 text-white font-light leading-7">
              <li className="flex items-center gap-3">
                <svg
                  width="11"
                  height="14"
                  viewBox="0 0 11 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.0809 0.0747632L8.72662 0.263833C9.90104 0.607717 10.7636 1.58196 10.9379 2.76142C11.2055 4.57196 10.607 6.68828 9.16509 9.11434C7.72619 11.5353 6.14239 13.0955 4.39885 13.7779C3.25499 14.2257 1.94742 13.9846 1.05196 13.1608L0.562918 12.711C-0.0925312 12.108 -0.187494 11.127 0.340739 10.4159L1.56298 8.7703C1.90138 8.31467 2.50089 8.11871 3.05399 8.28299L4.90168 8.83174L4.94943 8.84084C5.15313 8.86972 5.62281 8.44175 6.20852 7.45618C6.82126 6.42511 6.9483 5.82227 6.7791 5.66683L5.83913 4.81535C5.13457 4.17724 4.92645 3.17419 5.32143 2.32073L5.91733 1.03299C6.28844 0.231091 7.21435 -0.178975 8.0809 0.0747632ZM6.7391 1.39184L6.1432 2.67959C5.90634 3.19129 6.03112 3.79268 6.45358 4.17532L7.3959 5.0289C7.99873 5.58264 7.79899 6.53048 6.98875 7.89378C6.22636 9.17657 5.53082 9.81047 4.78347 9.70055L4.67148 9.67727L2.79063 9.11994C2.60621 9.06524 2.40637 9.13053 2.29357 9.28238L1.07133 10.9279C0.807258 11.2834 0.854738 11.774 1.18242 12.0755L1.67146 12.5253C2.31105 13.1137 3.24508 13.286 4.06207 12.9662C5.59199 12.3673 7.03786 10.9431 8.38479 8.67674C9.73457 6.40577 10.2808 4.47411 10.0461 2.88579C9.9216 2.04332 9.30547 1.34743 8.4666 1.10179L7.82088 0.912724C7.38761 0.785855 6.92469 0.990889 6.7391 1.39184Z"
                    fill="#F6DC65"
                  />
                </svg>
                <Link className="text-lg font-medium" href="tel:+982182800003">
                  021-82800003
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  width="15"
                  height="12"
                  viewBox="0 0 15 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6562 0C13.9507 0 15 1.03319 15 2.30769V9.69231C15 10.9668 13.9507 12 12.6562 12H2.34375C1.04933 12 0 10.9668 0 9.69231V2.30769C0 1.03319 1.04933 0 2.34375 0H12.6562ZM14.0625 3.65631L7.73767 7.32089C7.61542 7.3917 7.4687 7.4035 7.33829 7.35629L7.26233 7.32089L0.9375 3.65815V9.69231C0.9375 10.457 1.5671 11.0769 2.34375 11.0769H12.6562C13.4329 11.0769 14.0625 10.457 14.0625 9.69231V3.65631ZM12.6562 0.923077H2.34375C1.5671 0.923077 0.9375 1.54299 0.9375 2.30769V2.58646L7.5 6.38761L14.0625 2.58554V2.30769C14.0625 1.54299 13.4329 0.923077 12.6562 0.923077Z"
                    fill="#F6DC65"
                  />
                </svg>
                <Link className="text-sm" href="mail:Support@techa.ir">
                  Support@techa.ir
                </Link>
              </li>
              <li className="flex gap-3">
                <span className="inline-block mt-2">
                  <svg
                    width="13"
                    height="14"
                    viewBox="0 0 13 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.28572 6.125C9.28572 7.57475 8.03851 8.75 6.5 8.75C4.96149 8.75 3.71429 7.57475 3.71429 6.125C3.71429 4.67525 4.96149 3.5 6.5 3.5C8.03851 3.5 9.28572 4.67525 9.28572 6.125ZM8.35714 6.125C8.35714 5.1585 7.52567 4.375 6.5 4.375C5.47433 4.375 4.64286 5.1585 4.64286 6.125C4.64286 7.0915 5.47433 7.875 6.5 7.875C7.52567 7.875 8.35714 7.0915 8.35714 6.125ZM11.0962 10.4606C13.6346 8.06759 13.6346 4.18776 11.0962 1.79475C8.55779 -0.598252 4.44221 -0.598252 1.90381 1.79475C-0.634602 4.18776 -0.634602 8.06759 1.90381 10.4606L3.31619 11.7721L5.21307 13.5091L5.33642 13.6121C6.05585 14.1616 7.10936 14.1273 7.7871 13.5092L10.0493 11.4355L11.0962 10.4606ZM2.55821 2.41167C4.7352 0.359376 8.2648 0.359376 10.4418 2.41167C12.563 4.41134 12.6174 7.62159 10.605 9.68334L10.4418 9.84368L9.21487 10.9847L7.14364 12.8822L7.05729 12.9519C6.72837 13.1861 6.27185 13.1861 5.94297 12.9518L5.85663 12.8821L3.08871 10.3399L2.55821 9.84368L2.39504 9.68334C0.382643 7.62159 0.437032 4.41134 2.55821 2.41167Z"
                      fill="#F6DC65"
                    />
                  </svg>
                </span>
                <span className="text-[15px] text-justify leading-7">
                  قزوین، پونک بلوار نخبگان، ضلع شمالی دانشگاه آزاد اسلامی قزوین،
                  مرکز رشد واحدهای فن آور
                </span>
              </li>
            </ul>
          </div>
          <div className="mx-auto flex items-center justify-center w-48 h-48 md:w-56 md:h-56 rounded-2xl border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">

            <a
              referrerPolicy="origin"
              target="_blank"
              href="https://trustseal.enamad.ir/?id=5807521&Code=loIPO28I7xMmZpty5QoXBeRYow2945YB"
              className="flex items-center justify-center"
            >
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=5807521&Code=loIPO28I7xMmZpty5QoXBeRYow2945YB"
                alt="نماد اعتماد الکترونیکی"
                className="w-24 md:w-28 cursor-pointer select-none"
                code="loIPO28I7xMmZpty5QoXBeRYow2945YB"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="bg-[#183b2d] py-3">
        <div className="container px-5 xl:px-20 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center text-[#ffffffB2]  font-light text-xs sm:text-lg">
            <div className="text-center sm:text-start mb-2 sm:mb-0">
              کلیه حقوق مادی و معنوی این وبسایت متعلق به شرکت تکا می باشد.
            </div>
            <div>
              طراحی شده توسط{" "}
              <Link
                className="text-[#7AE36A] font-medium"
                href="https://Joshang.ir"
              >
                رامین جوشنگ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
