"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  BarsIcon,
  ContactUSIcon,
  XIcon,
} from "../Icons/Icons";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogIn,
  LogOut,
  Bookmark,
  Home,
  GraduationCap,
  Pen,
  PhoneCall,
  ChevronDown,
  Link2,
  BookOpenText,
  LayoutDashboard,
} from "lucide-react";
import { RiShoppingCartLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useSelector(state => state.auth);
  console.log(user)
  const isLoggedIn = !!user;

  const items = useSelector(state => state.cart.items);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    const handleScroll = () => setScrolled(window.scrollY > 50);

    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".menu-container")) setIsMenuOpen(false);
      if (isProfileOpen && !event.target.closest(".profile-container")) setIsProfileOpen(false);
      if (isSubMenuOpen && !event.target.closest(".submenu-container")) setIsSubMenuOpen(false);
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen, isProfileOpen, isSubMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || isProfileOpen) ? "hidden" : "auto";
  }, [isMenuOpen, isProfileOpen, isSubMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/auth/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[80] ${isMenuOpen ? "block" : "hidden"
          }`}
      ></div>
      <header
        className={`fixed w-full z-[80] bg-[#042A1B] ${scrolled ? "shadow-2xl py-3" : "py-5"} transition-all duration-200`}
      >
        <div className="container mx-auto px-5 lg:px-0 xl:px-5 2xl:px-20">
          <nav className="flex justify-between items-center">
            <div className="flex items-center">
              <Link className="lg:border-l border-[#FFFFFF33] lg:pl-5 xl:pl-8"
                href="/">
                <Image
                  src="/images/logo-light.svg"
                  width={180}
                  height={100}
                  alt="logo"
                  priority
                />
              </Link>
              <div
                className={`pt-14 lg:pt-0 px-5 lg:px-0 fixed w-64 lg:w-auto ${isMenuOpen ? "-right-0" : "-right-64"
                  } bottom-0 top-0 z-50 bg-[#042A1B] lg:bg-transparent border-8 border-r-0 rounded-2xl rounded-r-none border-[#7AE36A] lg:border-0 lg:static transition-all duration-300 menu-container`}
              >
                <Image
                  src="/images/logo-light.svg"
                  className="mx-auto lg:hidden"
                  width={200}
                  height={100}
                  alt="logo"
                  priority
                />
                <ul className="lg:pr-5 xl:pr-8 flex flex-col lg:flex-row lg:items-center gap-7 xl:gap-10 mt-10 lg:mt-0">
                  <li className="flex items-center gap-2 group">
                    <span>
                      <Home className={`stroke-[#7AE36A] ${pathname === "/" ? "opacity-100" : "opacity-30"
                        } group-hover:opacity-100`} strokeWidth={1} />
                    </span>
                    <Link
                      className={`font-normal text-sm ${pathname === "/" ? "text-[#7AE36A]" : "text-white"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                      href="/"
                    >
                      صفحه اصلی
                    </Link>
                  </li>

                  {/* <li className="flex items-center gap-2 group">
                    <span>
                      <GraduationCap className={`stroke-[#7AE36A] ${pathname.startsWith("/courses") ? "opacity-100" : "opacity-30"
                        } group-hover:opacity-100`} strokeWidth={1} />
                    </span>
                    <Link
                      className={`font-normal text-sm ${pathname.startsWith("/courses") ? "text-[#7AE36A]" : "text-white"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                      href="/courses"
                    >
                      دوره های ما
                    </Link>
                  </li> */}
                  <li className="flex items-center gap-2 group">
                    <span>
                      <BookOpenText className={`stroke-[#7AE36A] ${pathname.startsWith("/docs") ? "opacity-100" : "opacity-30"
                        } group-hover:opacity-100`} strokeWidth={1} />
                    </span>
                    <Link
                      className={`font-normal text-sm ${pathname.startsWith("/docs") ? "text-[#7AE36A]" : "text-white"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                      href="/docs"
                    >
                      مستندات
                    </Link>
                  </li>

                  <li className="flex items-center gap-2 group">
                    <span>
                      <Pen className={`stroke-[#7AE36A] ${pathname.startsWith("/blog") ? "opacity-100" : "opacity-30"
                        } group-hover:opacity-100`} strokeWidth={1} />
                    </span>
                    <Link
                      className={`font-normal text-sm ${pathname.startsWith("/blog") ? "text-[#7AE36A]" : "text-white"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                      href="https://blog.techa.ir"
                    >
                      بلاگ
                    </Link>
                  </li>

                  {/* لینک های مفید با Dropdown */}
                  <li
                    className="group relative submenu-container"
                    onMouseEnter={() => !isMobile && setIsSubMenuOpen(true)}
                    onMouseLeave={() => !isMobile && setIsSubMenuOpen(false)}
                  >
                    <button
                      className={`flex items-center gap-2 font-normal text-sm ${pathname.startsWith("/useful-links") ? "text-[#7AE36A]" : "text-white"}`}
                      onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
                    >
                      <span>
                        <Link2 className={`stroke-[#7AE36A] opacity-30 group-hover:opacity-100`} strokeWidth={1} />
                      </span>
                      لینک های مفید
                      <ChevronDown className={`w-4 h-4 transition-transform ${isSubMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Desktop Dropdown */}
                    <AnimatePresence>
                      {isSubMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full right-0 mt-2 w-56 bg-[#042A1B] border-4 border-[#7AE36A]/30 rounded-xl shadow-2xl backdrop-blur-sm lg:block hidden"
                        >
                          <ul className="py-2">
                            <li>
                              <Link
                                href="/about-us"
                                className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors"
                                onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                              >
                                <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                                درباره ما
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/faqs"
                                className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors"
                                onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                              >
                                <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                                سوالات متداول
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/questions"
                                className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors"
                                onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                              >
                                <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                                پرسش و پاسخ
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="#projects"
                                className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors"
                                onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                              >
                                <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                                پروژه های فعال
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/term"
                                className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors"
                                onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                              >
                                <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                                قوانین و مقررات
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/ai"
                                className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors"
                                onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                              >
                                <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                                ویرایشگر هوشمند
                              </Link>
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mobile Dropdown */}
                    {isMobile && isSubMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden pr-7 mt-2 border-r-4 border-[#7AE36A]/30"
                      >
                        <ul className="space-y-4 py-2">
                          <li>
                            <Link
                              href="/about-us"
                              className="text-white flex items-center gap-3"
                              onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                            >
                              <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                              درباره ما
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/faqs"
                              className="text-white flex items-center gap-3"
                              onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                            >
                              <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                              سوالات متداول                            </Link>
                          </li>
                          <li>
                            <Link
                              href="#projects"
                              className="text-white flex items-center gap-3"
                              onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                            >
                              <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                              پروژه های فعال                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/term"
                              className="text-white flex items-center gap-3"
                              onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                            >
                              <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                              قوانین و مقررات                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/ai"
                              className="text-white flex items-center gap-3"
                              onClick={() => { setIsSubMenuOpen(false); setIsMenuOpen(false) }}
                            >
                              <span className="w-2 h-2 bg-[#7AE36A] rounded-full" />
                              ویرایشگر هوشمند
                            </Link>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </li>



                  <li className="flex items-center gap-2 group">
                    <span>
                      <PhoneCall className={`stroke-[#7AE36A] ${pathname.startsWith("/contact-us") ? "opacity-100" : "opacity-30"
                        } group-hover:opacity-100`} strokeWidth={1} />
                    </span>
                    <Link
                      className={`font-normal text-sm ${pathname.startsWith("/contact-us") ? "text-[#7AE36A]" : "text-white"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                      href="/contact-us"
                    >
                      تماس با ما
                    </Link>
                  </li>
                </ul>
                <div className="flex items-center gap-3 mt-10 justify-center lg:hidden">
                  <div className="text-white">
                    <p className="text-[12.5px] font-normal">
                      با ما در تماس باشید
                    </p>
                    <h3 className="font-bold">021-82800003</h3>
                  </div>
                  <span>
                    <ContactUSIcon />
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && items.length > 0 && (
                <Link
                  href="/cart"
                  className="relative flex items-center gap-1 text-white hover:text-emerald-300 transition-colors"
                >
                  <span>
                    <RiShoppingCartLine className="w-6 h-6" />
                  </span>
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {items.length}
                  </span>
                </Link>
              )}

              <div className="lg:hidden">
                {isMenuOpen ? (
                  <span className="cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <XIcon />
                  </span>
                ) : (
                  <span className="cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <BarsIcon />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-5">
                {/* <div className="hidden lg:flex justify-center items-center gap-3">
                  <div className="text-white">
                    <p className="text-[12.5px] font-normal">
                      با ما در تماس باشید
                    </p>
                    <h3 className="font-bold">021-82800003</h3>
                  </div>
                  <span>
                    <ContactUSIcon />
                  </span>
                </div> */}
                <div className="flex items-center gap-4">
                  {isLoggedIn ? (
                    <div className="relative profile-container">
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 group"
                      >
                        <div className="flex gap-1">
                          { }
                          <ChevronDown className={`text-white w-5 group-hover:text-[#7AE36A] ${isProfileOpen ? 'rotate-180' : 'rotate-0'} transition-all duration-200`} />
                          <span className="hidden sm:block text-white font-medium group-hover:text-[#7AE36A] transition-colors text-sm">
                            {user?.FirstName && user?.LastName
                              ? `${user.FirstName} ${user.LastName}`
                              : "کاربر مهمان"}
                          </span>

                        </div>
                        <div className="relative w-12 h-12">
                          <Image
                            src={user?.avatarUrl ?? "/images/user.png"} // اگر avatar موجود نبود، پیش‌فرض
                            alt={user?.FirstName && user?.LastName
                              ? `${user.FirstName} ${user.LastName}`
                              : "کاربر مهمان"}
                            fill
                            className="rounded-full object-cover border-2 border-[#7AE36A]"
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isProfileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute top-14 left-0 w-52 bg-[#042A1B] border-4 border-[#7AE36A]/30 rounded-xl shadow-2xl backdrop-blur-sm"
                          >
                            <div className="p-4 border-b-2 border-[#7AE36A]/20">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12">
                                  <Image
                                    src={user?.avatarUrl ?? "/images/user.png"} // اگر avatar موجود نبود، پیش‌فرض
                                    alt={user?.FirstName && user?.LastName
                                      ? `${user.FirstName} ${user.LastName}`
                                      : "کاربر مهمان"}
                                    fill
                                    className="rounded-full object-cover border-2 border-[#7AE36A]"
                                  />

                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {user?.FirstName && user?.LastName
                                      ? `${user.FirstName} ${user.LastName}`
                                      : "کاربر مهمان"}
                                  </p>

                                  <p className="text-[#7AE36A] text-sm">
                                    {user.Mobile}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <ul className="py-2">
                              <li>
                                <Link
                                  href="/account"
                                  className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors cursor-pointer"
                                >
                                  <LayoutDashboard className="w-5 h-5 text-[#7AE36A]" />
                                  حساب کاربری
                                </Link>
                              </li>
                              <li>
                                <Link
                                  href="/account/profile"
                                  className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors cursor-pointer"
                                >
                                  <User className="w-5 h-5 text-[#7AE36A]" />
                                  پروفایل من
                                </Link>
                              </li>
                              <li>
                                <Link
                                  href="/account/courses"
                                  className="px-4 py-3 hover:bg-[#7AE36A]/10 text-white flex items-center gap-3 transition-colors cursor-pointer"
                                >
                                  <Bookmark className="w-5 h-5 text-[#7AE36A]" />
                                  دوره‌های من
                                </Link>
                              </li>
                              <li>
                                <p
                                  className="px-4 py-3 hover:bg-red-500/10 text-red-400 flex items-center gap-3 transition-colors cursor-pointer"
                                  onClick={handleLogout}
                                >
                                  <LogOut className="w-5 h-5" />
                                  خروج از حساب
                                </p>
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-2 bg-[#7AE36A] text-[#042A1B] px-6 py-2 rounded-full font-medium hover:bg-[#6acf5a] transition-all shadow-lg shadow-[#7AE36A]/20 group-hover:rounded-b-none group-hover:rounded-t-full"
                    >
                      <LogIn className="rotate-180 w-5 h-5" />
                      ورود
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div >
      </header >
    </>
  );
};

export default Header;