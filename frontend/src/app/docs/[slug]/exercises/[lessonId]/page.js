"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import ExerciseList from "../../../../../components/exercises/ExerciseList";
import ExerciseDetails from "../../../../../components/exercises/ExerciseDetails";
import { fetchExercises } from "../../../../../features/main/exercises/exercisesActions";
import { useDispatch, useSelector } from "react-redux";

export default function ExercisePage() {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const { slug, lessonId } = useParams();
    console.log(slug, lessonId)
    const dispatch = useDispatch();
    const { exercises, loading, error } = useSelector((state) => state.exercises);

    // دریافت تمرینات از سرور
    useEffect(() => {

        dispatch(fetchExercises({
            "@ContentId": lessonId
        }));
    }, [lessonId]);

    const handleExerciseSelect = (exercise) => {
        setSelectedExercise(exercise);
    };

    const handleBackToList = () => {
        setSelectedExercise(null);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <AnimatePresence mode="wait">
                {selectedExercise ? (
                    <ExerciseDetails
                        exercise={selectedExercise}
                        onBack={handleBackToList}
                        slug={slug}
                    />
                ) : (
                    <ExerciseList
                        exercises={exercises}
                        loading={loading}
                        onExerciseSelect={handleExerciseSelect}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}