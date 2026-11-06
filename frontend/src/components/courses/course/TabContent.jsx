// components/TabContent.js
"use client";
import { motion, AnimatePresence } from "framer-motion";

const TabContent = ({ activeTab, tabs, variants }) => {
    return (
        <div className="my-5">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                >
                    {tabs[activeTab].content}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default TabContent;
