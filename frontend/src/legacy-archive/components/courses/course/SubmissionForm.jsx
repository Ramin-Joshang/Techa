// components/SubmissionForm.js
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import ExerciseHTMLEditor from "../../inline/exercises/ExerciseHTMLEditor";
import ExerciseJSEditor from "../../inline/exercises/ExerciseJSEditor";
import ExerciseReactEditor from "../../inline/exercises/ExerciseReactEditor";

const SubmissionForm = () => {
    const [code, setCode] = useState("");
    const params = useParams();

    // استخراج courseId از پارامترهای مسیر
    const courseId = params.courseId; // فرض بر اینکه ساختار مسیر: /courses/[courseId]/... 

    // تعیین زبان بر اساس courseId
    const getLanguage = () => {
        switch (courseId) {
            case "19":
                return "html";
            case "10":
                return "react";
            case "21":
                return "javascript";
            default:
                return "html"; // مقدار پیش‌فرض
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: ارسال کد به سرور
    };

    const renderEditor = () => {
        const language = getLanguage();

        switch (language) {
            case "html":
                return (
                    <ExerciseHTMLEditor
                        tutorialID={courseId}
                        onCodeChange={setCode}
                        editable={true}
                    />
                );
            case "javascript":
                return (
                    <ExerciseJSEditor
                        tutorialID={courseId}
                        onCodeChange={setCode}
                        editable={true}
                    />
                );
            case "react":
                return (
                    <ExerciseReactEditor
                        tutorialID={courseId}
                        onCodeChange={setCode}
                        editable={true}
                    />
                );
            default:
                return <div>زبان تمرین پشتیبانی نمی‌شود</div>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-xl p-6"
        >
            <h3 className="text-xl font-semibold mb-4">ارسال تکلیف</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>{renderEditor()}</div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                >
                    <Send size={18} />
                    ارسال پاسخ
                </motion.button>
            </form>
        </motion.div>
    );
};

export default SubmissionForm;