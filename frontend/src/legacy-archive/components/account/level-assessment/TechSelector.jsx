import { motion } from "framer-motion";
import { RiDatabaseFill, RiGitBranchFill, RiHtml5Fill, RiJavascriptFill, RiNextjsFill, RiNodejsFill, RiReactjsFill, RiTailwindCssFill, RiTerminalFill } from "react-icons/ri";

const techOptions = [
    { id: 'html', name: 'HTML', icon: <RiHtml5Fill />, color: 'from-green-100 to-green-50' },
    { id: 'css', name: 'CSS', icon: <RiHtml5Fill />, color: 'from-emerald-100 to-emerald-50' },
    { id: 'tailwindCSS', name: 'TailwindCSS', icon: <RiTailwindCssFill />, color: 'from-cyan-100 to-cyan-50' },
    { id: 'javaScript', name: 'JavaScript', icon: <RiJavascriptFill />, color: 'from-lime-100 to-lime-50' },
    { id: 'react', name: 'React', icon: <RiReactjsFill />, color: 'from-teal-100 to-teal-50' },
    { id: 'nextJS', name: 'Next.js', icon: <RiNextjsFill />, color: 'from-sky-100 to-sky-50' },
];

const TechSelector = ({ selectedTech, setSelectedTech }) => {
    const toggleTech = (techId) => {
        setSelectedTech(prev =>
            prev.includes(techId)
                ? prev.filter(t => t !== techId)
                : [...prev, techId]
        );
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                    تکنولوژی‌های مورد نظرتان را انتخاب کنید
                </h3>
                <p className="text-gray-600">
                    حداقل یک گزینه را برای شروع آزمون انتخاب نمایید
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {techOptions.map(tech => {
                    const isSelected = selectedTech.includes(tech.id);
                    return (
                        <motion.button
                            key={tech.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleTech(tech.id)}
                            className={`group relative p-4 rounded-xl border-2 transition-all 
                                flex flex-col items-center gap-3 h-full
                                ${isSelected
                                    ? 'border-green-500 bg-gradient-to-br ' + tech.color + ' shadow-lg shadow-green-100'
                                    : 'border-gray-200 hover:border-green-300 bg-white'}`}
                        >
                            <div className={`text-3xl transition-colors 
                                ${isSelected ? 'text-green-600' : 'text-gray-500 group-hover:text-green-500'}`}
                            >
                                {tech.icon}
                            </div>

                            <span className={`text-sm font-medium transition-colors
                                ${isSelected ? 'text-green-700' : 'text-gray-600 group-hover:text-green-600'}`}
                            >
                                {tech.name}
                            </span>

                            {isSelected && (
                                <div className="absolute -top-2 -right-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default TechSelector;