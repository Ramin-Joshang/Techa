"use client";
import { motion } from 'framer-motion';
import { Code, Medal, Briefcase, Award, BookOpen, GitPullRequest, Globe, Users, Rocket, Database, Cpu, Cloud, BrainCircuit, Shield, ArrowLeft, ArrowUpLeft, ArrowUpRight, Sparkle, BadgeCheck, Download, X } from 'lucide-react';
import { useState } from 'react';

const SectionWrapper = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="mb-12"
    >
        {children}
    </motion.div>
);


const SkillItem = ({ name, level, icon, isVerified, experience }) => (
    <motion.div
        dir='ltr'
        whileHover={{ y: -5 }}
        className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 relative group transition-all duration-300"
    >
        <div className="flex items-start justify-between mb-3 gap-3">
            {/* بخش آیکون و عنوان */}
            <div className="flex items-center gap-3 flex-1">
                {icon && (
                    <div className="bg-green-50 rounded-xl mt-1">
                        <img src={icon} className='w-14 h-14' alt="" />
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
                        {isVerified && (
                            <span className="relative inline-block group">
                                <motion.span
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ rotate: 15 }}
                                    className="inline-block bg-gradient-to-br from-green-500 to-green-600 p-1 rounded-full shadow-xl shadow-green-200/50"
                                >
                                    <svg
                                        className="w-4 h-4 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </motion.span>

                                {/* افکت نور پس‌زمینه */}
                                {/* <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#4ade8070_0%,transparent_70%)] group-hover:opacity-50 opacity-0 transition-opacity" /> */}

                                {/* Tooltip پیشرفته */}
                                {/* <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-md before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:translate-y-1.5 before:w-2 before:h-2 before:bg-gray-800 before:rotate-45">
                                    <span className="flex items-center gap-1">
                                        <span className="text-emerald-400">✓</span>
                                        تایید شده
                                    </span>
                                </span> */}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {tech}
                        </span> */}
                        {experience && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {experience}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* درصد مهارت */}
            <span className="text-2xl font-bold text-green-600">
                {level}%
            </span>
        </div>

        {/* نوار پیشرفت */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${level}%` }}
                transition={{ duration: 1.5, type: 'spring' }}
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full relative"
            >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            </motion.div>
        </div>
    </motion.div>
);

// const ExperienceItem = ({ position, company, year, description, achievements }) => (
//     <motion.div
//         whileHover={{ x: 10 }}
//         className="relative pl-8 border-l-2 border-green-500 mb-6 bg-white p-4 rounded-xl shadow-sm"
//     >
//         <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[9px] top-4" />
//         <h3 className="text-lg font-semibold">{position}</h3>
//         <div className="flex items-center gap-2 mb-2">
//             <Briefcase className="w-5 h-5 text-gray-500" />
//             <span className="font-medium">{company}</span>
//             <span className="text-gray-500">•</span>
//             <span className="text-gray-500">{year}</span>
//         </div>
//         <p className="text-gray-600 mb-3">{description}</p>
//         <div className="space-y-2">
//             {achievements.map((achievement, i) => (
//                 <div key={i} className="flex items-start gap-2">
//                     <Medal className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
//                     <span className="text-sm text-gray-600">{achievement}</span>
//                 </div>
//             ))}
//         </div>
//     </motion.div>
// );
// const ExperienceItem = ({ position, company, year, description, techStack }) => (
//     <motion.div
//         whileHover={{ scale: 1.02 }}
//         className="relative pl-8 border-l-2 border-green-100 group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
//     >
//         {/* نشانگر خط زمانی */}
//         <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[8px] top-6 border-2 border-white shadow-sm" />

//         {/* هدر */}
//         <div className="flex flex-col gap-2 mb-4">
//             <h3 className="text-xl font-bold text-gray-800">{position}</h3>
//             <div className="flex items-center gap-3">
//                 <div className="p-2 bg-green-50 rounded-lg">
//                     <Briefcase className="w-5 h-5 text-green-600" />
//                 </div>
//                 <div>
//                     <h4 className="font-medium text-gray-800">{company}</h4>
//                     <p className="text-gray-500 text-sm">{year}</p>
//                 </div>
//             </div>
//         </div>

//         {/* توضیحات */}
//         <p className="text-gray-600 text-sm mb-4 leading-relaxed">
//             {description}
//         </p>

//         {/* تگ‌های تکنولوژی */}
//         <div className="flex flex-wrap gap-2">
//             {techStack.map((tech, i) => (
//                 <span
//                     key={i}
//                     className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200"
//                 >
//                     {tech}
//                 </span>
//             ))}
//         </div>
//     </motion.div>
// );

const ExperienceItem = ({ position, company, year, description, techStack }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
            y: -2,
            transition: { duration: 0.2 }
        }}
        className="relative pl-10 border-l-2 border-slate-100 group bg-white p-5 rounded-2xl shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
        {/* Timeline Indicator */}
        <div className="absolute w-3.5 h-3.5 bg-white border-2 border-green-400 rounded-full -left-[9px] top-6 shadow-[0_2px_8px_rgba(99,102,241,0.2)] transition-all group-hover:border-green-500 group-hover:scale-110" />

        {/* Header Section */}
        <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800 relative">
                    <span className="bg-gradient-to-r from-green-500/40 to-transparent absolute -left-8 top-1/2 w-6 h-1 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {position}
                </h3>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">{year}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-green-50 rounded-lg shadow-sm">
                    <Briefcase className="w-5 h-5 text-green-600 transition-colors group-hover:text-green-700" />
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-slate-700">{company}</h4>
                    <p className="text-sm text-slate-500">Full-time Position</p>
                </div>
            </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 mb-6 leading-relaxed relative pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-green-100 before:rounded-full">
            {description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
            {techStack.map((tech, i) => (
                <motion.span
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50/70 rounded-lg backdrop-blur-sm border border-green-100 transition-colors hover:bg-green-100/50"
                >
                    {tech}
                </motion.span>
            ))}
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-50 pointer-events-none transition-all duration-300" />
    </motion.div>
);

export default function MainContent() {

    const [selectedCert, setSelectedCert] = useState(null);

    return (
        <div className="w-full p-5  bg-gray-50">
            {/* بخش مهارت‌ها */}
            <SectionWrapper>
                <div className="flex items-center gap-3 mb-8">
                    <Code className="w-8 h-8 text-green-500" />
                    <h2 className="text-3xl font-bold">مهارت‌های فنی</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sampleData.skills.map((skill, index) => (
                        <SkillItem
                            key={index}
                            {...skill}
                        />
                    ))}
                </div>
            </SectionWrapper>

            {/* بخش سوابق کاری */}
            <SectionWrapper delay={0.2}>
                <div className="flex items-center gap-3 mb-8">
                    <Briefcase className="w-8 h-8 text-green-500" />
                    <h2 className="text-3xl font-bold">تجربه‌های حرفه‌ای</h2>
                </div>
                <div className="space-y-6 grid xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {sampleData.experiences.map((exp, index) => (
                        <ExperienceItem key={index} {...exp} />
                    ))}
                </div>
            </SectionWrapper>

            {/* بخش پروژه‌های استراتژیک */}
            {/* <SectionWrapper delay={0.4}>
                <div className="flex items-center gap-3 mb-8">
                    <Rocket className="w-8 h-8 text-green-500" />
                    <h2 className="text-3xl font-bold">پروژه‌های کلیدی</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleData.projects.map((project, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="group relative overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                                    <p className="text-sm text-green-200">{project.role}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {project.tech.map((tech, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4 text-sm">{project.description}</p>
                                <div className="flex items-center justify-between">
                                    <a
                                        href={project.link}
                                        className="inline-flex items-center text-green-500 hover:text-green-600 font-medium"
                                    >
                                        مشاهده مستندات
                                        <BookOpen className="w-4 h-4 mr-2" />
                                    </a>
                                    <span className="text-xs text-gray-500">{project.duration}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </SectionWrapper> */}
            <SectionWrapper delay={0.3}>
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <Rocket className="w-8 h-8 text-green-500" />
                        <h2 className="text-3xl font-bold">پروژه های من</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {sampleData.projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover="hover"
                            className="relative group bg-white rounded-2xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_-6px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden border border-gray-100"
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-r from-cyan-200/30 to-green-300/30 rounded-full blur-3xl" />
                            </div>

                            {/* Image Section */}
                            <div className="relative h-60 overflow-hidden">
                                <motion.img
                                    variants={{
                                        hover: { scale: 1.05 }
                                    }}
                                    src={project.image}
                                    alt={project.title}
                                    className="h-full w-full object-cover origin-center transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                        <span className="text-sm text-cyan-100">{project.role}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5 pt-4">

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-5 leading-relaxed relative pl-4 before:absolute before:left-0 before:top-1 before:h-4/5 before:w-0.5 before:bg-gradient-to-b from-cyan-300 to-green-400">
                                    {project.description}
                                </p>
                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tech.map((tech, i) => (
                                        <motion.span
                                            key={i}
                                            whileHover={{ y: -2 }}
                                            className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg border border-gray-200 backdrop-blur-sm flex items-center gap-2"
                                        >
                                            <Code className="w-4 h-4 text-green-500" />
                                            {tech}
                                        </motion.span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <motion.a
                                        whileHover={{ x: 5 }}
                                        href={project.link}
                                        className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
                                    >
                                        مشاهده مستندات
                                        <ArrowUpLeft className="w-4 h-4 mr-2" />
                                    </motion.a>
                                    <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">
                                        ⏳ {project.duration}
                                    </span>
                                </div>
                            </div>

                            {/* Hover Border */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 pointer-events-none transition-all duration-500" />
                        </motion.div>
                    ))}
                </div>
            </SectionWrapper>
            {/* بخش جوایز و افتخارات */}
            <SectionWrapper delay={0.6}>
                <div className="flex items-center gap-3 mb-8">
                    <Medal className="w-8 h-8 text-green-500" />
                    <h2 className="text-3xl font-bold">افتخارات و دستاوردها</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sampleData.achievements.map((achievement, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-6 rounded-xl shadow-lg border border-green-100 text-center relative overflow-hidden"
                        >
                            <div className="mb-4">
                                <achievement.icon className="w-12 h-12 mx-auto text-green-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{achievement.organization}</p>
                            <p className="text-xs text-gray-500">{achievement.year}</p>
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </SectionWrapper>

            <SectionWrapper delay={0.2}>
                <div className="py-16">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">پروژه‌های منتخب</span>
                        </h2>
                        <p className="text-xl text-gray-600">نمونه‌کارهای اجرا شده با آخرین تکنولوژی‌های روز دنیا</p>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                        {sampleData.projects.map((project, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                className="relative group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden"
                            >
                                {/* Image Section */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                                        {project.duration}
                                    </span>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    {/* Project Title & Role */}
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                        <p className="text-sm text-gray-600">{project.role}</p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tech.map((tech, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="border-t border-gray-100 pt-4">
                                        <a
                                            href={project.link}
                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            مشاهده جزئیات
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                        </a>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-xl pointer-events-none transition-all duration-300"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            <SectionWrapper delay={0.3}>
                <div className=" py-16">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-500">
                                مدارک و گواهینامه‌ها
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600">اسناد معتبر علمی و حرفه‌ای</p>
                    </div>

                    {/* Certificates Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                        {sampleData.certificatesData.map((cert, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                className="relative group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                            >
                                {/* Ribbon for Official Documents */}
                                {cert.type === 'official' && (
                                    <div className="absolute -right-2 top-4 bg-emerald-500 text-white px-3 py-1 text-sm font-medium rotate-45 shadow-md z-10">
                                        رسمی
                                    </div>
                                )}

                                {/* Certificate Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${cert.type === 'course' ? 'bg-cyan-100' : 'bg-emerald-100'}`}>
                                            {cert.type === 'course' ? (
                                                <BookOpen className="w-6 h-6 text-cyan-600" />
                                            ) : (
                                                <BadgeCheck className="w-6 h-6 text-emerald-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{cert.title}</h3>
                                            <p className="text-sm text-gray-500">{cert.issuer}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Certificate Body */}
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            🗓️ {cert.date}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            🆔 {cert.id}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {cert.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedCert(cert)}
                                            className="flex-1 text-center px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            مشاهده مدرک
                                        </button>
                                        {cert.downloadUrl && (
                                            <a
                                                href={cert.downloadUrl}
                                                download
                                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                دانلود PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Certificate Modal */}
                    {selectedCert && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setSelectedCert(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedCert.title}</h3>
                                        <p className="text-sm text-gray-500">{selectedCert.issuer}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCert(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-6 h-6 text-gray-600" />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 max-h-[80vh] overflow-y-auto">
                                    {/* Certificate Image */}
                                    <img
                                        src={selectedCert.image}
                                        alt={selectedCert.title}
                                        className="w-full h-auto rounded-lg border border-gray-200"
                                    />

                                    {/* Certificate Details */}

                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 border-t border-gray-100">
                                    <div className="flex justify-end gap-3">
                                        <a
                                            href={selectedCert.downloadUrl}
                                            download
                                            className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg flex items-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            دانلود مدرک
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </SectionWrapper>


        </div>
    );
}


const sampleData = {
    certificatesData: [
        {
            title: "کارشناسی ارشد مهندسی نرم‌افزار",
            issuer: "دانشگاه تهران",
            date: "مهر ۱۴۰۰ - شهریور ۱۴۰۲",
            id: "UT-SE-789456",
            type: "official",
            description: "گرایش سیستم‌های هوشمند - معدل ۱۹.۲ - پایان‌نامه برتر دانشکده",
            credentialUrl: "#",
            downloadUrl: "#",
            image: "/images/blog-1.png"
        },
        {
            title: "توسعه دهنده حرفه‌ای React",
            issuer: "Meta (Coursera)",
            date: "فروردین ۱۴۰۲",
            id: "CERT-789123",
            type: "course",
            description: "مدرک تخصصی توسعه فرانت‌اند با تمرکز بر React.js و اکوسیستم آن",
            credentialUrl: "#",
            downloadUrl: "#",
            image: "/images/blog-1.png"
        },
        {
            title: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            date: "آبان ۱۴۰۱",
            id: "AWS-456789CDA",
            type: "official",
            description: "مدرک تخصصی توسعه و استقرار برنامه‌های ابری در پلتفرم AWS",
            credentialUrl: "#",
            downloadUrl: "#",
            image: "/images/blog-1.png"
        },
        {
            title: "توسعه امنیت سایبری",
            issuer: "Cisco Networking Academy",
            date: "مرداد ۱۴۰۰",
            id: "CISCO-CCNA-789",
            type: "course",
            description: "مدرک تخصصی شبکه و امنیت سایبری سطح پیشرفته",
            credentialUrl: "#",
            downloadUrl: "#",
            image: "/images/blog-1.png"
        },
        {
            title: "مدیریت پروژه حرفه‌ای (PMP)",
            issuer: "Project Management Institute",
            date: "اسفند ۱۳۹۹",
            id: "PMP-123456",
            type: "official",
            description: "مدرک بین‌المللی مدیریت پروژه با تاکید بر روش‌های Agile",
            credentialUrl: "#",
            downloadUrl: "#",
            image: "/images/blog-1.png"
        },
        {
            title: "توسعه Full-Stack با Node.js",
            issuer: "Udemy",
            date: "خرداد ۱۴۰۱",
            id: "UD-789456",
            type: "course",
            description: "دوره جامع توسعه Full-Stack با Node.js، Express و MongoDB",
            credentialUrl: "#",
            downloadUrl: "#",
            image: "/images/blog-1.png"
        }
    ],
    skills: [
        {
            name: 'HTML',
            level: 95,
            icon: '/images/icons/html.png',
            isVerified: true,
            experience: '4+ سال'
        },
        {
            name: 'CSS',
            level: 95,
            icon: '/images/icons/css.png',
            isVerified: true,
            experience: '4+ سال'
        },
        {
            name: 'TailwindCSS',
            level: 95,
            icon: '/images/icons/tailwind.png',
            isVerified: true,
            experience: '3+ سال'
        },
        {
            name: 'JavaScript',
            level: 90,
            icon: '/images/icons/js.png',
            isVerified: false,
            experience: '4+ سال'
        },
        {
            name: 'React',
            level: 92,
            icon: '/images/icons/react.png',
            isVerified: true,
            experience: '۴+ سال'
        },
        {
            name: 'Next.js',
            level: 88,
            icon: '/images/icons/next.png',
            isVerified: true,
            experience: '۳+ سال'
        },
        {
            name: 'TypeScript',
            level: 85,
            icon: '/images/icons/ts.png',
            isVerified: false,
            experience: '۲+ سال'
        },
        {
            name: 'Redux',
            level: 90,
            icon: '/images/icons/redux.png',
            isVerified: true,
            experience: '۴+ سال'
        },
        {
            name: 'Tailwind CSS',
            level: 87,
            icon: '/images/icons/bootstrap.png',
            isVerified: true,
            experience: '۳+ سال'
        },
        {
            name: 'Vue.js',
            level: 84,
            icon: '/images/icons/vue.png',
            isVerified: false,
            experience: '۲+ سال'
        },
        {
            name: 'React Query',
            level: 89,
            icon: '/images/icons/reactquery.png',
            isVerified: true,
            experience: '۳+ سال'
        },
        {
            name: 'NodeJS',
            level: 86,
            icon: '/images/icons/node-js.png',
            isVerified: true,
            experience: '۴+ سال'
        },
        {
            name: 'MySQL',
            level: 90,
            icon: '/images/icons/mysql.png',
            isVerified: true,
            experience: '۴+ سال'
        },
        {
            name: 'MongoDB',
            level: 87,
            icon: '/images/icons/mongo.png',
            isVerified: true,
            experience: '۳+ سال'
        },
        {
            name: 'C++',
            level: 84,
            icon: '/images/icons/cpp.png',
            isVerified: false,
            experience: '۲+ سال'
        },
        {
            name: 'Linux',
            level: 89,
            icon: '/images/icons/linux.png',
            isVerified: true,
            experience: '۳+ سال'
        },
    ]
    ,
    experiences: [
        {
            position: "توسعه دهنده فرانت اند",
            company: "شرکت تکا",
            year: "1402 - اکنون",
            description: "توسعه و راهبری پلتفرم مدیریت محتوای سازمانی با استفاده از آخرین تکنولوژی‌های وب",
            techStack: [
                "HTML",
                "CSS",
                "Tailwind CSS",
                "JavaScript (JS)",
                "React",
                "Next.js",
                "TypeScript (TS)",
                "SQL",
                "shadcn/ui",
                "Material-UI (MUI)",
                "Redux",
                "Git"
            ]
        },
        {
            position: "توسعه دهنده فرانت اند",
            company: "شرکت برازمان",
            year: "1403 - 1402",
            description: "طراحی و پیاده‌سازی سامانه پرداخت آنلاین با قابلیت مقیاس‌پذیری بالا",
            techStack: [
                "HTML",
                "CSS",
                "Tailwind CSS",
                "JavaScript (JS)",
                "React",
                "Next.js",
                "TypeScript (TS)",
                "shadcn/ui",
                "Material-UI (MUI)",
                "Redux",
                "Vue",
                "Vuex",
                "Git"
            ]
        },
        {
            position: "کارآموزی فرانت اند",
            company: "شرکت آدم برفی",
            year: "1401-1401",
            description: "مشاوره و راهبری پیاده‌سازی سیستم‌های سازمانی مبتنی بر ابر",
            techStack: ["HTML", "CSS", "SASS", "Bootsrap", "JavaScript", "Git"]
        }
    ],
    achievements: [
        {
            title: 'برترین راهکار ابری',
            organization: 'انجمن فناوری ابری آسیا',
            year: '2023',
            icon: Globe
        },
        {
            title: 'نوآوری در هوش مصنوعی',
            organization: 'مرکز تحقیقات جهانی AI',
            year: '2022',
            icon: Cpu
        },
        {
            title: 'رهبری تیم برتر',
            organization: 'مجمع مدیریت فناوری',
            year: '2021',
            icon: Users
        },
        {
            title: 'معمار سیستم‌های مقیاس‌پذیر',
            organization: 'کنفرانس بین‌المللی نرم‌افزار',
            year: '2020',
            icon: Database
        }
    ],
    projects: [
        {
            title: "پلتفرم آموزشی تکا",
            image: "/images/blog-1.png",
            role: "توسعه دهنده فرانت اند و تولید محتوا",
            description: "طراحی و پیاده‌سازی تکا که مجموعه ای در بدنه دانشگاه، با هدف توانمند سازی دانشجویان برای ورود به بازار کار و درآمدزایی مستقل، از طریق آموزش چند رسانه ای و کارآموزی مهارت محور است.",
            tech: ["HTML", "CSS", "Tailwind", "JavaScript", "React", "Redux", "Next.js", "Git"],
            duration: "13 ماه",
            link: "techa.ir",
            awards: ["جایزه بهترین پروژه IoT 2023", "رتبه اول نوآوری انرژی"]
        },
        {
            title: "پلتفرم تجارت الکترونیک نسل جدید",
            image: "/images/blog-1.png",
            role: "توسعه‌دهنده ارشد بک‌اند",
            description: "ایجاد یک اکوسیستم تجارت الکترونیک با معماری میکروسرویس و قابلیت پردازش بیش از ۱۰۰۰۰ تراکنش در ثانیه.",
            tech: ["Microservices", "Kubernetes", "Golang", "GraphQL", "Redis"],
            duration: "۱ سال",
            link: "#",
            awards: ["بهترین معماری مقیاس‌پذیر ۲۰۲۲"]
        },
        {
            title: "سیستم تشخیص چهره هوشمند",
            image: "/images/blog-1.png",
            role: "سرپرست تیم هوش مصنوعی",
            description: "توسعه یک سیستم تشخیص چهره با دقت ۹۹.۸% و قابلیت کار در شرایط نوری مختلف و زوایای متنوع.",
            tech: ["Python", "OpenCV", "Deep Learning", "Docker", "Flask"],
            duration: "۶ ماه",
            link: "#",
            awards: ["جایزه نوآوری در امنیت سایبری"]
        },
        {
            title: "پلتفرم تحلیل داده‌های مالی",
            image: "/images/blog-1.png",
            role: "معمار داده",
            description: "طراحی یک سیستم تحلیلی پیشرفته برای پردازش و تجزیه‌وتحلیل داده‌های مالی در زمان واقعی با قابلیت پیش‌بینی بازار.",
            tech: ["Big Data", "Apache Spark", "Kafka", "Python", "Tableau"],
            duration: "۹ ماه",
            link: "#",
            awards: ["بهترین راه‌حل FinTech 2023"]
        },
        {
            title: "سیستم مدیریت ناوگان هوشمند",
            image: "/images/blog-1.png",
            role: "توسعه‌دهنده فول‌استک",
            description: "پیاده‌سازی یک سیستم جامع برای ردیابی و بهینه‌سازی عملکرد ناوگان حمل‌ونقل با استفاده از تکنولوژی‌های پیشرفته.",
            tech: ["React Native", "NestJS", "PostgreSQL", "WebSockets", "Mapbox"],
            duration: "۱ سال و ۲ ماه",
            link: "#",
            awards: ["جایزه نوآوری در لجستیک"]
        },
        {
            title: "پلتفرم آموزش آنلاین تعاملی",
            image: "/images/blog-1.png",
            role: "طراح تجربه کاربری",
            description: "ایجاد یک محیط یادگیری تعاملی با قابلیت‌های واقعیت افزوده و تحلیل پیشرفته رفتار یادگیرنده.",
            tech: ["AR/VR", "Three.js", "Vue.js", "WebRTC", "MongoDB"],
            duration: "۱۰ ماه",
            link: "#",
            awards: ["بهترین پلتفرم EdTech 2023"]
        }
    ]
};