// components/TabButtons.js
"use client";
import { motion } from "framer-motion";

const TabButtons = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex space-x-1 bg-[#D0DDD140] p-1.5 rounded-full whitespace-nowrap">
            {tabs.map((tab, index) => (
                <motion.button
                    key={index}
                    className={`py-2 px-5 text-sm sm:text-[16px] font-medium text-[#042A1B] rounded-full ${activeTab !== index
                        ? "bg-transparent opacity-50"
                        : "bg-[#ffffff] font-semibold opacity-100"
                        }`}
                    onClick={() => onTabChange(index)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {tab.title}
                </motion.button>
            ))}
        </div>
    );
};

export default TabButtons;
