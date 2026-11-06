export default function SkillItem({ skill }) {
    return (
        <div className="bg-gray-200 p-4 rounded-lg shadow">
            <h3 className="font-semibold">{skill.name}</h3>
            <p className="text-gray-600">{skill.level}</p>
        </div>
    );
}