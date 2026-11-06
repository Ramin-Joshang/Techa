"use client"
const CourseTitle = ({ title }) => {
    return (
        <h1 className="font-extrabold text-black text-3xl">
            <span className="font-black pr-3">{title}</span>
        </h1>
    );
};

export default CourseTitle;
