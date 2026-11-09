import { motion } from "framer-motion";
import ExerciseCard from "./ExerciseCard";
import ExerciseCardSkeleton from "./ExerciseCardSkeleton";

export default function ExerciseList({ exercises, loading, onExerciseSelect }) {
    const skeletons = [...Array(4)];

    return (
        <motion.div
            key="exercise-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">تمرینات دوره</h1> */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {loading ? (
                    skeletons.map((_, index) => (
                        <ExerciseCardSkeleton key={index} />
                    ))
                ) : (
                    exercises.map((exercise, index) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            index={index}
                            onClick={() => onExerciseSelect(exercise)}
                        />
                    ))
                )}
            </div>

            {!loading && exercises.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    هیچ تمرینی برای این دوره وجود ندارد
                </div>
            )}
        </motion.div>
    );
}