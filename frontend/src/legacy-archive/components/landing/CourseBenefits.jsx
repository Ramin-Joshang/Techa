import React from 'react';

const benefits = [
    {
        id: 1,
        icon: "/images/Exercise.svg",
        title: "آموزش و کارآموزی کاملا مجازی",
        description: "هزاران تمرین و محتوای تخصصی به همراه فیلم آموزش",
    },
    {
        id: 2,
        icon: "/images/Class.svg",
        title: "پرداخت حداقل هزینه",
        description: "امکان پرداخت هزینه آموزش از حقوق کارآموزی",
    },
    {
        id: 3,
        icon: "/images/Work.svg",
        title: "کسب رزومه قوی",
        description: "اجرای پروژه های واقعی به همراه مربی",
    },
    {
        id: 4,
        icon: "/images/Online.svg",
        title: "درآمد از استارت آپ شخصی",
        description: "رشد دادن پروژه ارائه شده و کسب منفعت مستمر",
    },
];

const CourseBenefits = () => {
    return (
        <div className="mb-20 mt-10">
            <div className="container mx-auto px-5 2xl:px-20">
                <div className="text-[#042A1B] text-center">
                    <h1 className="font-extrabold text-4xl ">
                        مـــزایای{" "}
                        <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">
                            کارآموزی
                        </span>
                    </h1>
                    <p className="text-lg font-normal mt-3">
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با
                        استفاده از طراحان گرافیک است
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {benefits.map(item => (
                        <div key={item.id} className="relative h-[280px] sm:pt-[100%] border-[5px] border-[#F6DC6526] rounded-3xl sm:rounded-full">
                            <div className="absolute inset-0 flex flex-col justify-center items-center p-7">
                                <div className="w-[90px] h-[90px] flex justify-center items-center bg-[#F6DC65] rounded-full mb-3">
                                    <img src={item.icon} alt={item.title} />
                                </div>
                                <h3 className="mt-2 text-center text-xl font-bold">
                                    {item.title}
                                </h3>
                                <p className="text-center font-medium text-[16px] mt-1">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseBenefits;