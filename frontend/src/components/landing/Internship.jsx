// components/Internship.js
import Image from 'next/image';
import Link from 'next/link';

const Internship = () => {
    return (
        <div className="mt-10 bg-[#e0f5f5] py-10">
            <div className="container mx-auto px-5 2xl:px-20">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className='text-[#042A1B]'>
                        <h1 className='text-4xl font-extrabold '>کارآموزی پروژه محور</h1>
                        <p className='text-[17px] text-justify font-normal leading-7 my-4'>
                            تکا با ایجادمحیطی عملیاتی، پروژه های واقعی در اختیار کارآموزان منتخب قرار می دهد که در مدت کوتاهی بتوانند یا پروژه محول شده را به سوددهی برسانند و برای خود یک درآمد مستمر ایجاد کنند یا اینکه با کسب تجارب فراوان از شکستها و موفقیتها با یک روزمه قوی جذب بازار کار شوند.
                        </p>
                        <Link className='bg-[#7AE36A] px-5 py-2 rounded-full font-semibold  mt-2 inline-block hover:text-white transition-all duration-300' href="/courses">پروژه های در حال اجرا</Link>
                    </div>
                    <div className="relative w-full pb-[60%] lg:mt-0">
                        <Image
                            src="/images/Internship.png"
                            fill
                            style={{ objectFit: "cover" }}
                            alt="banner"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Internship;