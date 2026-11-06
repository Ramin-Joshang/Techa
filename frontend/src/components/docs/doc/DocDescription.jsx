// components/CourseDescription.js
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DocDescription = ({ description }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

    const formatted = description
        ?.split('$')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p class="mb-2.5">${p}.</p>`)
        .join('');


    return (
        <div>
            <div
                className={`overflow-hidden text-[19px] leading-9 text-black text-justify font-normal transition-all duration-500 relative ${showFullDescription ? 'max-h-screen' : 'max-h-40'
                    }`}
            >
                <div
                    dangerouslySetInnerHTML={{
                        __html: formatted || description,
                    }}
                ></div>
                {!showFullDescription && (
                    <span className="absolute w-full bg-white h-5 bottom-0 opacity-70"></span>
                )}
            </div>
            <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 flex items-center font-semibold gap-2 text-[#7AE36A]"
            >
                {showFullDescription ? 'مشاهده کمتر' : 'مشاهده بیشتر'}
                <span
                    className={`transition-transform duration-300 ${showFullDescription ? 'rotate-180' : ''
                        }`}
                >
                    <ChevronDown />
                </span>
            </button>
        </div>
    );
};

export default DocDescription;