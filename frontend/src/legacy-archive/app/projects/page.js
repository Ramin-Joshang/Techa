import ProjectCard from "../../components/projects/ProjectCard"

export default function HomePage() {

    const projects = [
        {
            id: 1,
            title: "سامانه خدمات شهری",
            image: "/images/project.svg",
            status: "analysis",
            requiredInterns: 3,
            currentInterns: 1,
            progress: 45,
            description:
                "سامانه مدیریت پیمانها و پیمانکاران شهری برای شهرداریها - نیاز به توسعه دهنده ماهر با آشنایی به فرآیندهای خدمات شهری - وضعیت پروژه: فاز بازطراحی و توسعه",
        },
        {
            id: 2,
            title: "پلتفرم فروش پوشاک دخترانه",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 2,
            currentInterns: 0,
            progress: 20,
            description:
                "پلتفرم تخصصی فروش پوشاک دخترانه (تونیک، مانتو و...) - ویژه توسعه دهندگان خانم علاقمند به حوزه فشن - وضعیت: فاز تحلیل و طراحی",
        },
        {
            id: 3,
            title: "سامانه مشاوره شغلی",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 2,
            currentInterns: 1,
            progress: 30,
            description:
                "سامانه راهنمایی شغلی هوشمند برای نوجوانان - نیاز به توسعه دهنده با توانایی تولید محتوای آموزشی - وضعیت: فاز تحلیل و طراحی",
        },
        {
            id: 4,
            title: "پلتفرم باشگاه مشتریان",
            image: "/images/project.svg",
            status: "analysis",
            requiredInterns: 2,
            currentInterns: 2,
            progress: 85,
            description:
                "سیستم مدیریت ارتباط با مشتریان (CRM) پیشرفته - ویژه توسعه دهندگان آقا با دانش بازاریابی - وضعیت: فاز راه‌اندازی نهایی",
        },
        {
            id: 5,
            title: "پلتفرم قطعه‌سازان صنعتی",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 3,
            currentInterns: 0,
            progress: 15,
            description:
                "اکوسیستم ارتباط تولیدکنندگان و قطعه‌سازان - نیاز به توسعه دهنده آشنا با حوزه صنعت - وضعیت: فاز تحلیل و طراحی",
        },
        {
            id: 6,
            title: "پلتفرم ارتباط صنعت و دانشگاه",
            image: "/images/project.svg",
            status: "analysis",
            requiredInterns: 4,
            currentInterns: 2,
            progress: 55,
            description:
                "سامانه همکاری دانشجویان با صنایع - نیاز به توسعه دهنده با روابط عمومی قوی - وضعیت: فاز توسعه اولیه",
        },
        {
            id: 7,
            title: "پلتفرم آنالیز قراردادها",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 2,
            currentInterns: 1,
            progress: 25,
            description:
                "سیستم هوشمند تحلیل قراردادهای حقوقی - نیاز به توسعه دهنده با توانایی فرموله کردن مفاهیم حقوقی - وضعیت: فاز تحقیق و طراحی",
        },
    ];

    return (
        <div className="container mx-auto p-4 pt-32">
            <h1 className="text-3xl font-bold mb-8">پروژه‌های کارآموزی</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    )
}