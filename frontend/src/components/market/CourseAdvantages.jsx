"use client";

import { motion } from "framer-motion";
import {
    BadgeCheck,
    FolderGit2,
    Laptop,
    Database,
    ShieldCheck,
    BriefcaseBusiness,
    Code2,
    Users,
} from "lucide-react";

const items = [

    {
        title: "پروژه واقعی",
        icon: Code2
    },

    {
        title: "Git & GitHub",
        icon: FolderGit2
    },

    {
        title: "SQL و API",
        icon: Database
    },

    {
        title: "احراز هویت",
        icon: ShieldCheck
    },

    {
        title: "رزومه سازی",
        icon: BriefcaseBusiness
    },

    {
        title: "تمرین عملی",
        icon: Laptop
    },

    {
        title: "آمادگی مصاحبه",
        icon: Users
    },

    {
        title: "پشتیبانی",
        icon: BadgeCheck
    }

];

export default function CourseAdvantages() {

    return (

        <section className="space-y-12">

            <div className="text-center">

                <h2 className="text-4xl font-black">

                    چرا دوره‌های Techa؟

                </h2>

                <p className="mt-5 text-muted-foreground">

                    صرفاً آموزش نمی‌بینید؛ برای استخدام آماده می‌شوید.

                </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                {

                    items.map((item, index) => {

                        const Icon = item.icon;

                        return (

                            <motion.div

                                key={item.title}

                                initial={{ opacity: 0, y: 25 }}

                                whileInView={{ opacity: 1, y: 0 }}

                                transition={{ delay: index * .05 }}

                                viewport={{ once: true }}

                                whileHover={{ y: -6 }}

                                className="rounded-3xl border bg-card p-7"

                            >

                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">

                                    <Icon />

                                </div>

                                <h3 className="font-bold">

                                    {item.title}

                                </h3>

                            </motion.div>

                        )

                    })

                }

            </div>

        </section>

    )

}