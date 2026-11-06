// components/AccordionItem.js
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ title, content, isOpen, onClick }) => {
    return (
        <div className="border-b border-[#D0DDD1] py-5 cursor-pointer">
            <div className="flex items-center justify-between" onClick={onClick}>
                <p className="text-[19px] font-medium text-black">{title}</p>
                <span
                    className={`text-[#7AE36A] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <ChevronDown />
                </span>
            </div>
            <div
                className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="mt-5 pr-5">
                    <p className="text-[19px] font-normal text-black leading-9 text-justify">
                        {content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccordionItem;
