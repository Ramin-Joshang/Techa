// components/ExerciseDetails.js
"use client";
import { motion } from "framer-motion";
import SubmissionForm from "./SubmissionForm";

const ExerciseDetails = ({ exercise }) => {
    return (
        <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="space-y-6"
        >
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold">{exercise.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>مهلت انجام: {exercise.deadline}</span>
                    <span>•</span>
                    <span>سطح: {exercise.difficulty}</span>
                </div>
            </div>

            <div className="prose max-w-none">
                <h2 className="text-xl font-semibold">صورت تمرین</h2>
                <p className="mt-2 leading-relaxed">{exercise.description}</p>
            </div>

            <SubmissionForm exercise={{
                id: "123", // ID تمرین
                language: "html" // یا javascript/react
            }} />
        </motion.div>
    );
};

export default ExerciseDetails;