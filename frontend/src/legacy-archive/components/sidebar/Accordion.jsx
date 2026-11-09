// components/sidebar/Accordion.js
"use client";
import React from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ title, subtitle, content, isOpen, onClick, icon }) => {
    return (
        <div className='border lg:border-[#D0DDD1] border-white rounded-2xl mb-5 overflow-hidden cursor-pointer'>
            <div
                className={`flex items-center justify-between py-3 transition-colors duration-300 cursor-pointer px-5 rounded-2xl ${isOpen ? 'lg:bg-[#D0DDD140]' : 'bg-transparent'} hover:lg:bg-[#D0DDD140]`}
                onClick={onClick}
            >
                <div className='flex items-center gap-3'>
                    {icon && (
                        <div className='w-9 h-9 flex justify-center items-center rounded-full '>
                            {icon}
                        </div>
                    )}
                    <div>
                        <p className='text-white lg:text-[#042A1B] text-sm opacity-50'>{title}</p>
                        <h3 className='text-white lg:text-[#042A1B] text-[16px] font-medium'>{subtitle}</h3>
                    </div>
                </div>
                <button className='text-[#7AE36A] lg:text-black'>
                    <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
            </div>
            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className='py-5 text-white lg:text-[#042A1B] px-3 lg:px-5'>
                    {content}
                </div>
            </div>
        </div>
    );
};

export default Accordion;