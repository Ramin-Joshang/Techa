"use client";

import { motion } from "framer-motion";
import {
    CheckCircle2,
    ArrowDown,
    Rocket,
} from "lucide-react";

export default function RoadmapSection({ data }) {
    return (
        <section className="space-y-12">

            <div className="text-center">

                <span className="inline-flex rounded-full bg-primary/10 px-5 py-2 text-primary">

                    مسیر یادگیری

                </span>

                <h2 className="mt-6 text-4xl font-black">

                    نقشه راه ورود به بازار کار

                </h2>

                <p className="mt-5 text-muted-foreground">

                    کافی است این مراحل را به ترتیب طی کنید.

                </p>

            </div>

            <div className="mx-auto max-w-3xl">

                {data.roadmap.map((item, index) => (

                    <motion.div

                        key={item}

                        initial={{ opacity: 0, y: 30 }}

                        whileInView={{ opacity: 1, y: 0 }}

                        transition={{ delay: index * .08 }}

                        viewport={{ once: true }}

                    >

                        <div className="flex items-center gap-5">

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">

                                {index === data.roadmap.length - 1 ?

                                    <Rocket /> : <CheckCircle2 />}

                            </div>

                            <div className="flex-1 rounded-2xl border bg-card p-6">

                                <h3 className="font-bold">

                                    {item}

                                </h3>

                            </div>

                        </div>

                        {

                            index !== data.roadmap.length - 1 &&

                            <div className="my-3 flex justify-center">

                                <ArrowDown className="text-muted-foreground" />

                            </div>

                        }

                    </motion.div>

                ))}

            </div>

        </section>
    );
}