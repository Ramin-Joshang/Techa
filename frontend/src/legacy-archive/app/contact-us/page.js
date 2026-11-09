"use client";
import {
  EmailIcon,
  HeadPhoneIcon,
  MapIcon,
} from "../../components/Icons/Icons";
import { CheckIcon, Send, SendIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ContactUs() {
  const position = [200.505, -0.09];

  return (
    <div className="pt-40">
      <div className="container px-5 xl:px-20 mx-auto">
        <div className="flex flex-col lg:grid grid-cols-5 gap-y-16 gap-10">
          <div className="col-span-2">
            <h1 className=" font-black text-[#042A1B] text-4xl flex gap-3 items-center">
              <span>سلام!</span>
              <Image src="/images/hand.svg" width={40} height={40} alt="" />
            </h1>
            <h1 className=" font-black text-[#042A1B] text-4xl flex items-center mt-3">
              با ما در ارتباط باشید.
            </h1>
            <p className="mt-10 text-[16px] font-normal text-[#042A1B]">
              از طریق راه‌های ارتباطی با ما درتماس باشید. <br />
              کارشناسان ما پاسخگوی سوالات و انتقادات و پیشنهادات شما هستند.
            </p>
            <form action="" className="mt-10 grid gap-4">
              <input
                className="w-full border border-[#D0DDD1] focus:outline-none rounded-2xl px-3 py-2 placeholder:text-sm placeholder:font-normal placeholder:opacity-50 placeholder:text-[#042A1B]"
                type="text"
                placeholder="نام و نام خانوادگی"
              />
              <input
                className="w-full border border-[#D0DDD1] focus:outline-none rounded-2xl px-3 py-2 placeholder:text-sm placeholder:font-normal placeholder:opacity-50 placeholder:text-[#042A1B]"
                type="text"
                placeholder="پست الکترونیک"
              />
              <textarea
                className="w-full border border-[#D0DDD1] focus:outline-none rounded-2xl px-3 py-2 placeholder:text-sm placeholder:font-normal placeholder:opacity-50 placeholder:text-[#042A1B]"
                placeholder="پیام شما"
                rows="4"
              ></textarea>
              <div className="flex justify-end">
                <button className="flex items-center bg-[#7AE36A] w-fit px-7 py-2.5 rounded-xl text-[#042A1B] font-medium text-sm">
                  <p>ارسال پیام</p>
                  <span className="rotate-[-135deg] w-4 h-4 flex justify-center items-center">
                    <Send />
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="col-span-3">
            <div className="grid gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-[60px] h-[60px] flex justify-center items-center rounded-2xl bg-[#F3F6F3]">
                    <HeadPhoneIcon />
                  </div>
                  <div>
                    <p className="text-[#042A1B] text-[16px] font-normal">
                      شماره تماس
                    </p>
                    <a href="tel:+982182800003" className="text-[#042A1B] text-[25px] font-bold">
                      021-82800003
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[60px] h-[60px] flex justify-center items-center rounded-2xl bg-[#F3F6F3]">
                    <EmailIcon />
                  </div>
                  <div>
                    <p className="text-[#042A1B] text-[16px] font-normal">
                      پست الکترونیک
                    </p>
                    <a href="mail:Support@techa.ir" className="text-[#042A1B] text-xl font-semibold">
                      Support@techa.ir
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="min-w-[60px] min-h-[60px] flex justify-center items-center rounded-2xl bg-[#F3F6F3]">
                  <MapIcon />
                </div>
                <div>
                  <p className="text-[#042A1B] text-[16px] font-normal">
                    آدرس شرکت
                  </p>
                  <h3 className="text-[#042A1B] text-xl font-bold">
                    قزوین، خیابان دانشگاه، بلوار نخبگان، ضلع شمالی دانشگاه آزاد
                    اسلامی قزوین، مرکز رشد واحدهای فن آور
                  </h3>
                </div>
              </div>
            </div>
            <div className="rounded-3xl mt-10 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.123456789!2d50.039586!3d36.323213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzYsIDMyMywgMjEzLCDQkCwgMDM5LCA1ODY!5e0!3m2!1sen!2sus!4v1634234567890!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
