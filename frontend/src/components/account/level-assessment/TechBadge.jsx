const TechBadge = ({ tech }) => {
    const techData = {
        html: { name: 'HTML', color: 'bg-orange-100 text-orange-700' },
        css: { name: 'CSS', color: 'bg-blue-100 text-blue-700' },
        tailwindCSS: { name: 'TailwindCSS', color: 'bg-red-100 text-red-700' },
        javaScript: { name: 'JavaScript', color: 'bg-yellow-100 text-yellow-700' },
        react: { name: 'React', color: 'bg-cyan-100 text-cyan-700' },
        nextJS: { name: 'Next.js', color: 'bg-green-100 text-green-700' },
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${techData[tech]?.color || 'bg-gray-100 text-gray-700'}`}>
            {techData[tech]?.name || tech}
        </span>
    );
};

export default TechBadge;