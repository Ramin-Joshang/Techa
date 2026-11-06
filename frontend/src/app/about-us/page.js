import {
  ClockCoursesIcon,
  CoursesIcon,
  UsersIcon,
} from "../../components/Icons/Icons";
import Image from "next/image";

export default function ContactUs() {
  return (
    <div className="pt-32">
      <div className="container px-5 xl:px-20 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-14">
          <div className="lg:col-span-4">
            <h1 className="font-black text-[#042A1B] text-3xl">
              آموزش، لازمه یک آینده روشن
            </h1>
            <p className="font-normal leading-7 text-[#042A1B] text-justify mt-3">
              پلتفرم آموزشی تکا، با هدف توانمد سازی جوانان شروع به فعالیت نمود. بعد از آموزش اولیه و آموزش مهارتهای اولیه توسعه فرانت اند، تکا پروژه های واقعی و کوچکی را تحویل کارآموزان می دهد تا آنها را به سوددهی برسانند، اگر بتوانند در مدت مشخص و با کمک منابع تحویل داده شده برای سایت کاربر جذب کنند، تکا مدیریت آنها را به کارآموزان سپرده و امکان ایجاد یک درآمد مستمر را برای آنها فراهم می کند.
              انتخاب پروژه با توجه به علایق و توانمنیدها فرد صورت می گیرد. هزینه آموزش می تواند به صورت نقدی پرداخت شود یا اینکه کارآموز می تواند با سپردن ضمانت مناسب بعد از کسب مهارت از روی حقوق کارآموزی خود آن را پرداخت نماید.
            </p>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div className="flex gap-3 items-center">
                <span>
                  <CoursesIcon />
                </span>
                <span className="w-[1px] h-[50px] bg-[#A5AFCF]"></span>
                <div>
                  <p className="text-[#042A1B] text-[16px] font-normal left-6">
                    دوره های ما
                  </p>
                  <h3 className="text-[#042A1B] font-black text-3xl">+5</h3>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span>
                  <UsersIcon />
                </span>
                <span className="w-[1px] h-[50px] bg-[#A5AFCF]"></span>
                <div>
                  <p className="text-[#042A1B] text-[16px] font-normal left-6">
                    کاربران ما
                  </p>
                  <h3 className="text-[#042A1B] font-black text-3xl">+2</h3>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span>
                  <ClockCoursesIcon />
                </span>
                <span className="w-[1px] h-[50px] bg-[#A5AFCF]"></span>
                <div>
                  <p className="text-[#042A1B] text-[16px] font-normal left-6">
                    ساعت آموزش
                  </p>
                  <h3 className="text-[#042A1B] font-black text-3xl">+50</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 relative w-full pb-[60%] lg:mt-0">
            <Image
              src="/images/about.png"
              className="rounded-3xl"
              layout="fill"
              objectFit="cover"
              alt="about-us"
            />
          </div>
        </div>
        <div className="mt-20 h-60 bg-no-repeat bg-contain relative rounded-3xl overflow-hidden flex items-center sm:px-20">
          <div className="absolute inset-0 bg-[url('/images/about-banner.png')] bg-cover bg-no-repeat"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-[#042A1B] to-[#042A1B44]"></div>
          <div className="absolute mx-7 sm:mx-0">
            <div className="flex items-center gap-3">
              <span className="w-[30px] h-[30px] flex justify-center items-center bg-[#7AE36A] rounded-lg">
                <svg
                  width="12"
                  height="17"
                  viewBox="0 0 12 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.02535 0.362165L2.94814 0.0783585C3.81284 -0.187581 4.73671 0.242202 5.10702 1.08266L5.84394 2.75522C6.16506 3.48407 5.98687 4.34117 5.40338 4.87423L3.77968 6.35759C3.87987 7.24486 4.18973 8.11853 4.70928 8.9786C5.22883 9.83868 5.8777 10.5521 6.65591 11.119L8.60607 10.4931C9.34527 10.2558 10.1503 10.5285 10.6037 11.1696L11.66 12.6634C12.1871 13.4087 12.0923 14.4369 11.4383 15.0689L10.7374 15.7461C10.0397 16.4203 9.04327 16.6648 8.1215 16.388C5.94534 15.7347 3.9445 13.7949 2.11898 10.5688C0.290802 7.33795 -0.354412 4.59681 0.183336 2.34538C0.409618 1.39802 1.11035 0.643575 2.02535 0.362165Z"
                    fill="#042A1B"
                  />
                </svg>
              </span>
              <p className="text-white font-medium text-lg leading-5">
                مشاوره و تماس با ما
              </p>
            </div>
            <a href="tel:+982182800003" className="mt-5 inline-block text-white font-bold text-3xl">021-82800003</a>
            <p className="text-white font-normal text-[16px]">
              کارشناسان ما در سریع‌ترین زمان ممکن پاسخگوی شما هستند
            </p>
          </div>
        </div>
        <div className="mt-20">
          <div>
            <h2 className="text-[#042A1B] font-bold text-2xl leading-7">
              ماموریت ها، ارزش ها و باورهای ما
            </h2>
            <p className="text-[#042A1B] font-normal text-[16px] mt-2.5">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
              استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در
              ستون و سطرآنچنان که لازم است.
            </p>
          </div>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 gap-y-8">
            <div>
              <h3 className="text-lg text-[#042A1B] font-bold leading-7">
                همراهی
              </h3>
              <p className="text-[#042A1B] font-normal text-[16px] mt-2 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
                استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است.
              </p>
            </div>
            <div>
              <h3 className="text-lg text-[#042A1B] font-bold leading-7">
                تمرین محوری
              </h3>
              <p className="text-[#042A1B] font-normal text-[16px] mt-2 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
                استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است.{" "}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-[#042A1B] font-bold leading-7">
                نوآوری
              </h3>
              <p className="text-[#042A1B] font-normal text-[16px] mt-2 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
                استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است.{" "}
              </p>
            </div>
            <div>
              <h3 className="text-lg text-[#042A1B] font-bold leading-7">
                مسئولیت پذیری
              </h3>
              <p className="text-[#042A1B] font-normal text-[16px] mt-2 text-justify">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
                استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است.{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
