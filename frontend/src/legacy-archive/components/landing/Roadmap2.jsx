"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Roadmap() {
    return (
        <section className="relative w-full overflow-hidden">

            {/* Mobile Image */}
            <motion.div
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="md:hidden"
            >
                <Image
                    src="/images/Roadmap-Mobile.png"
                    alt="Front-end Roadmap Banner"
                    width={1080}
                    height={1600}
                    className="w-full h-auto"
                    priority
                />
            </motion.div>

            {/* Desktop Image */}
            <motion.div
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="hidden md:block"
            >
                <Image
                    src="/images/Roadmap.png"
                    alt="Front-end Roadmap Banner"
                    width={1920}
                    height={700}
                    className="w-full h-auto"
                    priority
                />
            </motion.div>

        </section>
    );
}
